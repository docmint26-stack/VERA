import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getDb } from "@/server/db/client";
import { updateProfile } from "@/server/modules/users/service";
import { createDocument, getDocument } from "@/server/modules/documents/service";
import { createAchievement, getAchievement } from "@/server/modules/achievements/service";
import { createOrganization, getOrganization } from "@/server/modules/organizations/service";
import { createNotification, getNotification } from "@/server/modules/notifications/service";
import { getRootFolder } from "@/server/modules/vault/service";
import { createUploadIntent, storeUpload } from "@/server/modules/vault/service";
import { getObjectStorage } from "@/server/storage";

const integration = describe.skipIf(process.env.RUN_DB_TESTS !== "1");

integration("PostgreSQL persistence and owner isolation", () => {
  const db = getDb();
  let userA = "";
  let userB = "";
  let documentId = "";
  let achievementId = "";
  let organizationId = "";
  let notificationId = "";
  let uploadKey = "";

  beforeAll(async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const [a, b] = await Promise.all([
      db.user.create({ data: { name: "Integration A", email: `a-${suffix}@test.invalid` } }),
      db.user.create({ data: { name: "Integration B", email: `b-${suffix}@test.invalid` } }),
    ]);
    userA = a.id;
    userB = b.id;
  });

  afterAll(async () => {
    if (organizationId) await db.organization.delete({ where: { id: organizationId } });
    if (uploadKey) await getObjectStorage().delete(uploadKey);
    await db.user.deleteMany({ where: { id: { in: [userA, userB] } } });
    await db.$disconnect();
  });

  it("persists profile, document, achievement, organization, notification, and vault root", async () => {
    const profile = await updateProfile(userA, { headline: "Persistent profile", bio: null, location: null, occupation: null });
    expect(profile).toMatchObject({ userId: userA });

    const document = await createDocument(userA, { title: "Persistent document", content: { type: "doc", content: [] } });
    documentId = document.id;
    expect((await getDocument(userA, documentId)).title).toBe("Persistent document");

    const achievement = await createAchievement(userA, { type: "PROJECT", title: "Persistent achievement", visibility: "PRIVATE" });
    achievementId = achievement.id;
    expect((await getAchievement(userA, achievementId)).status).toBe("CLAIMED");

    const organization = await createOrganization(userA, { name: "Persistent Org", slug: `persistent-${Date.now()}` });
    organizationId = organization.id;
    expect((await getOrganization(organizationId, userA)).id).toBe(organizationId);

    await createNotification(userA, { type: "SYSTEM", title: "Persistence check" });
    notificationId = (await db.notification.findFirst({ where: { userId: userA, title: "Persistence check" }, orderBy: { createdAt: "desc" } }))!.id;
    expect((await getNotification(userA, notificationId)).id).toBe(notificationId);

    expect((await getRootFolder(userA)).name).toBe("Root");

    const intent = await createUploadIntent(userA, { name: "notes.txt", mimeType: "text/plain", sizeBytes: 11 });
    uploadKey = intent.storageKey;
    const quarantined = await storeUpload(userA, intent.id, Buffer.from("hello world"), "text/plain", "notes.txt");
    expect(quarantined.status).toBe("QUARANTINED");
    expect(quarantined.scanStatus).toBe("ERROR");
  });

  it("rejects cross-user reads at the service boundary", async () => {
    await expect(getDocument(userB, documentId)).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(getAchievement(userB, achievementId)).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(getOrganization(organizationId, userB)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(getNotification(userB, notificationId)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
