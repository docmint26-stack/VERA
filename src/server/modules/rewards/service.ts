import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { RewardTransactionType, RewardTransactionStatus } from "@/generated/prisma/enums";
import { errors } from "@/lib/errors/app-error";
import { cursorWhere, orderByWithCursor, paginationQuery, toPage, type Page } from "@/lib/api/pagination";
import { getDb } from "@/server/db/client";
import { recordActivity } from "@/server/modules/common";

// ---------------------------------------------------------------------------
// Rewards Foundation (Phase 2 - data structures only, no active earning)
// ---------------------------------------------------------------------------

const rewardAccountSelect = {
  id: true,
  userId: true,
  balance: true,
  lifetimeEarned: true,
  lifetimeRedeemed: true,
  version: true,
  createdAt: true,
  updatedAt: true,
} as const;

const rewardTransactionSelect = {
  id: true,
  accountId: true,
  userId: true,
  amount: true,
  type: true,
  status: true,
  reason: true,
  idempotencyKey: true,
  relatedType: true,
  relatedId: true,
  metadata: true,
  createdAt: true,
} as const;

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listTransactionsQuery = paginationQuery.extend({
  type: z.array(z.nativeEnum(RewardTransactionType)).optional(),
  status: z.array(z.nativeEnum(RewardTransactionStatus)).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// ---------------------------------------------------------------------------
// Reward Account
// ---------------------------------------------------------------------------

/** Get reward account for a user. Creates one if it doesn't exist. */
export async function getRewardAccount(userId: string) {
  const db = getDb();
  const account = await db.rewardAccount.upsert({
    where: { userId },
    create: {
      userId,
      balance: BigInt(0),
      lifetimeEarned: BigInt(0),
      lifetimeRedeemed: BigInt(0),
      version: 0,
    },
    update: {},
    select: rewardAccountSelect,
  });
  return {
    ...account,
    balance: Number(account.balance),
    lifetimeEarned: Number(account.lifetimeEarned),
    lifetimeRedeemed: Number(account.lifetimeRedeemed),
  };
}

/** Get balance for a user. */
export async function getBalance(userId: string): Promise<{ balance: number }> {
  const account = await getDb().rewardAccount.findUnique({
    where: { userId },
    select: { balance: true },
  });
  return { balance: Number(account?.balance ?? BigInt(0)) };
}

// ---------------------------------------------------------------------------
// Transactions (Phase 4 will activate earning/redemption)
// ---------------------------------------------------------------------------

/** List reward transactions for a user. */
export async function listTransactions(
  userId: string,
  query: z.infer<typeof listTransactionsQuery>,
): Promise<Page<{ id: string; createdAt: Date }>> {
  const db = getDb();
  const where: Prisma.RewardTransactionWhereInput = {
    userId,
    ...(query.type?.length ? { type: { in: query.type } } : {}),
    ...(query.status?.length ? { status: { in: query.status } } : {}),
    ...(query.startDate ? { createdAt: { gte: query.startDate } } : {}),
    ...(query.endDate ? { createdAt: { lte: query.endDate } } : {}),
    ...(cursorWhere("createdAt", query.cursor, "desc") ?? {}),
  };
  const rows = await db.rewardTransaction.findMany({
    where,
    orderBy: orderByWithCursor("createdAt", "desc"),
    take: query.limit + 1,
    select: rewardTransactionSelect,
  });
  
  type Result = typeof rows[number] & { id: string; createdAt: Date; amount: number };
  return toPage(
    rows.map(r => ({ ...r, amount: Number(r.amount) })) as Result[],
    query.limit,
    (row) => row.createdAt.toISOString(),
  );
}

/** Get transaction by ID. */
export async function getTransaction(userId: string, id: string) {
  const transaction = await getDb().rewardTransaction.findFirst({
    where: { id, userId },
    select: {
      ...rewardTransactionSelect,
      account: { select: { userId: true } },
    },
  });
  if (!transaction) throw errors.notFound("Transaction not found.");
  return {
    ...transaction,
    amount: Number(transaction.amount),
  };
}

// ---------------------------------------------------------------------------
// Internal: Create transaction (Phase 4 will use this)
// ---------------------------------------------------------------------------

/**
 * Internal function to create a reward transaction.
 * Uses optimistic concurrency control to prevent race conditions.
 * Phase 2: This is a foundation function; actual earning/redemption is Phase 4.
 */
export async function createTransaction(
  userId: string,
  input: {
    type: RewardTransactionType;
    amount: bigint;
    reason: string;
    idempotencyKey: string;
    relatedType?: string;
    relatedId?: string;
    metadata?: unknown;
  },
): Promise<{ id: string; newBalance: bigint }> {
  const db = getDb();
  
  // Check for duplicate idempotency key
  const existing = await db.rewardTransaction.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
    select: { id: true },
  });
  if (existing) {
    throw errors.conflict("Duplicate transaction (idempotency key already used).");
  }

  return db.$transaction(async (tx) => {
    // Get or create account with lock
    const account = await tx.rewardAccount.upsert({
      where: { userId },
      create: {
        userId,
        balance: BigInt(0),
        lifetimeEarned: BigInt(0),
        lifetimeRedeemed: BigInt(0),
        version: 0,
      },
      update: {},
    });

    // Calculate new balance
    const amount = input.type === "REDEEM" || input.type === "REVERSAL" ? -input.amount : input.amount;
    const newBalance = account.balance + amount;

    if (newBalance < BigInt(0)) {
      throw errors.badRequest("Insufficient balance for redemption.");
    }

    // Update account
    await tx.rewardAccount.update({
      where: { userId, version: account.version },
      data: {
        balance: newBalance,
        lifetimeEarned: input.type === "EARN" ? { increment: input.amount } : undefined,
        lifetimeRedeemed: input.type === "REDEEM" ? { increment: input.amount } : undefined,
        version: { increment: 1 },
      },
    });

    // Create transaction
    await tx.rewardTransaction.create({
      data: {
        accountId: account.id,
        userId,
        amount: input.type === "REDEEM" || input.type === "REVERSAL" ? -input.amount : input.amount,
        type: input.type,
        status: "POSTED",
        reason: input.reason,
        idempotencyKey: input.idempotencyKey,
        relatedType: input.relatedType ?? null,
        relatedId: input.relatedId ?? null,
        metadata: input.metadata as Prisma.InputJsonValue ?? null,
      },
    });

    await recordActivity(userId, "REWARD_TRANSACTION", `Reward ${input.type.toLowerCase()}: ${input.reason}`, {
      subjectType: "reward",
      subjectId: userId,
    });

    return { id: userId, newBalance };
  });
}

// ---------------------------------------------------------------------------
// Rules (Phase 4 will activate)
// ---------------------------------------------------------------------------

/** List reward rules. */
export async function listRules() {
  const rules = await getDb().rewardRule.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      points: true,
      active: true,
      cooldownSeconds: true,
      maxPerUser: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return rules;
}

/** Get rule by code. */
export async function getRule(code: string) {
  const rule = await getDb().rewardRule.findUnique({
    where: { code },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      points: true,
      active: true,
      cooldownSeconds: true,
      maxPerUser: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!rule) throw errors.notFound("Reward rule not found.");
  return rule;
}
