"use client";

import * as React from "react";
import {
  ArrowUp,
  Copy,
  Paperclip,
  Plus,
  RotateCcw,
  Sparkles,
  Square,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { DemoBadge, PageHeader, EmptyState } from "@/components/ui/empty-state";
import { AIThinkingIndicator } from "@/components/motion/ai-thinking";
import { useT } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  sample?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

const STARTERS = [
  "Draft a resume summary from my recent work",
  "Plan a three-day workshop on verification basics",
  "Explain the difference between each verification stage",
] as const;

const SAMPLE_REPLY =
  "This is a labelled sample response. In Phase 3 a connected provider would answer from your own workspace context — your documents, your Passport and your attachments — instead of this static text.";

export function AIView() {
  const t = useT();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [thinking, setThinking] = React.useState(false);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const newConversation = () => {
    const id = `c-${Date.now()}`;
    setConversations((list) => [{ id, title: t("ai.newChat"), messages: [] }, ...list]);
    setActiveId(id);
    setDraft("");
  };

  const send = async (text: string) => {
    if (!text.trim()) return;
    const id = activeId ?? `c-${Date.now()}`;
    if (!activeId) {
      setConversations((list) => [{ id, title: text.slice(0, 48), messages: [] }, ...list]);
      setActiveId(id);
    }

    const userMessage: Message = { id: `m-${Date.now()}`, role: "user", text: text.trim() };
    setConversations((list) =>
      list.map((c) =>
        c.id === id
          ? {
              ...c,
              title: c.messages.length === 0 ? text.trim().slice(0, 48) : c.title,
              messages: [...c.messages, userMessage],
            }
          : c,
      ),
    );
    setDraft("");
    setThinking(true);

    await new Promise((resolve) => setTimeout(resolve, 1400));

    setThinking(false);
    setConversations((list) =>
      list.map((c) =>
        c.id === id
          ? {
              ...c,
              messages: [
                ...c.messages,
                { id: `m-${Date.now()}-a`, role: "assistant", text: SAMPLE_REPLY, sample: true },
              ],
            }
          : c,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t("ai.title")}
        description={t("ai.subtitle")}
        actions={
          <>
            <Button variant="secondary" onClick={newConversation}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t("ai.newChat")}
            </Button>
            <DemoBadge label={t("common.awaitingIntegration")} />
          </>
        }
      />

      <Alert variant="warning" title={t("ai.unavailable")}>
        {t("ai.unavailableBody")}
      </Alert>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        {/* Conversation list */}
        <aside className="surface-card hidden h-fit p-2 lg:block" aria-label={t("ai.searchChats")}>
          <p className="px-2.5 pb-1.5 pt-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--subtle-foreground)]">
            {t("ai.searchChats")}
          </p>
          {conversations.length === 0 ? (
            <p className="px-2.5 py-3 text-[0.8125rem] text-[var(--muted-foreground)]">{t("ai.noChats")}</p>
          ) : (
            <ul className="space-y-0.5">
              {conversations.map((conversation) => (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(conversation.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-left text-[0.8125rem] transition-colors focus-ring",
                      conversation.id === activeId
                        ? "bg-[var(--brand-soft)] font-medium text-[var(--brand)]"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]",
                    )}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{conversation.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 border-t border-[var(--divider)] px-2.5 py-3">
            <p className="text-[0.6875rem] leading-relaxed text-[var(--subtle-foreground)]">
              {t("common.localOnly")}
            </p>
          </div>
        </aside>

        {/* Thread */}
        <section className="surface-card flex min-h-[560px] flex-col overflow-hidden" aria-label={t("ai.title")}>
          <div className="flex items-center justify-between border-b border-[var(--divider)] px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
              {active ? active.title : t("ai.emptyTitle")}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t("ai.retry")}
                disabled={!active}
                onClick={() => send(t("actions.retry"))}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t("ai.deleteConversation")}
                disabled={!active}
                onClick={() => {
                  setConversations((list) => list.filter((c) => c.id !== activeId));
                  setActiveId(null);
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5" aria-live="polite">
            {!active || active.messages.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title={t("ai.emptyTitle")}
                description={t("ai.emptyBody")}
                compact
                className="border-0 bg-transparent"
              >
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {STARTERS.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => send(starter)}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-[0.8125rem] text-[var(--muted-foreground)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)] focus-ring"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </EmptyState>
            ) : (
              <ol className="space-y-5">
                {active.messages.map((message) => (
                  <li
                    key={message.id}
                    className={cn("flex gap-3", message.role === "user" && "justify-end")}
                  >
                    {message.role === "assistant" && (
                      <span
                        aria-hidden="true"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-[var(--brand)] text-[0.6875rem] font-bold text-white"
                      >
                        V
                      </span>
                    )}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-[var(--radius-md)] px-4 py-3 text-sm leading-relaxed",
                        message.role === "user"
                          ? "bg-[var(--brand)] text-white"
                          : "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]",
                      )}
                    >
                      {message.sample && (
                        <p className="mb-2 flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--brand)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />
                          {t("ai.sampleLabel")}
                        </p>
                      )}
                      <p>{message.text}</p>
                      {message.sample && (
                        <p className="mt-2 border-t border-[var(--divider)] pt-2 text-[0.75rem] text-[var(--muted-foreground)]">
                          {t("ai.sampleNote")}
                        </p>
                      )}
                      {message.role === "assistant" && (
                        <div className="mt-2.5 flex gap-2">
                          <button
                            type="button"
                            onClick={() => navigator.clipboard?.writeText(message.text)}
                            className="inline-flex items-center gap-1 rounded-[5px] px-1.5 py-1 text-[0.75rem] text-[var(--muted-foreground)] hover:bg-[var(--surface-elevated)] focus-ring"
                          >
                            <Copy className="h-3 w-3" aria-hidden="true" />
                            {t("ai.copyMessage")}
                          </button>
                        </div>
                      )}
                    </div>
                    {message.role === "user" && (
                      <span
                        aria-hidden="true"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-elevated)] text-[0.6875rem] font-semibold text-[var(--muted-foreground)]"
                      >
                        A
                      </span>
                    )}
                  </li>
                ))}

                {thinking && (
                  <li className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-[var(--brand)] text-[0.6875rem] font-bold text-white"
                    >
                      V
                    </span>
                    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                      <AIThinkingIndicator />
                    </div>
                  </li>
                )}
              </ol>
            )}
          </div>

          {/* Composer */}
          <form
            className="border-t border-[var(--divider)] p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void send(draft);
            }}
          >
            <div className="flex items-end gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-2 focus-within:border-[var(--brand)] focus-within:ring-4 focus-within:ring-[var(--brand-ring)]">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("ai.attachFile")}
                onClick={() => undefined}
              >
                <Paperclip className="h-4 w-4" aria-hidden="true" />
              </Button>
              <label htmlFor="ai-composer" className="sr-only">
                {t("ai.composerPlaceholder")}
              </label>
              <textarea
                id="ai-composer"
                rows={1}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send(draft);
                  }
                }}
                placeholder={t("ai.composerPlaceholder")}
                className="max-h-40 min-h-[36px] flex-1 resize-none bg-transparent px-1 py-1.5 text-sm outline-none placeholder:text-[var(--subtle-foreground)]"
              />
              <Button
                type="submit"
                size="icon-sm"
                aria-label={t("actions.submit")}
                disabled={!draft.trim() || thinking}
              >
                {thinking ? (
                  <Square className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
            <p className="mt-2 flex items-center justify-between text-[0.6875rem] text-[var(--subtle-foreground)]">
              <span>{t("ai.sendHint")}</span>
              <span>{t("common.localOnly")}</span>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
