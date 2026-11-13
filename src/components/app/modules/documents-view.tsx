"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  ArrowLeft,
  Bold,
  FilePlus2,
  Grid2x2,
  Italic,
  LayoutList,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Printer,
  Redo2,
  Search,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, IntegrationPending } from "@/components/ui/alert";
import { DemoBadge, PageHeader, EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/components/i18n/language-provider";
import { DEMO_DOCUMENTS, type DemoDocument } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Resume",
  "Cover Letter",
  "Business Proposal",
  "Research Summary",
  "Project Report",
  "Personal Statement",
] as const;

const TEMPLATES = [
  "resume",
  "coverLetter",
  "businessProposal",
  "researchSummary",
  "projectReport",
  "jobApplication",
  "personalStatement",
  "invoice",
  "professionalLetter",
  "custom",
] as const;

type SortKey = "recent" | "name" | "created";

export function DocumentsView() {
  const t = useT();
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("All");
  const [sort, setSort] = React.useState<SortKey>("recent");
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [newOpen, setNewOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const items = DEMO_DOCUMENTS.filter((doc) => {
      const matchesQuery = !q || doc.title.toLowerCase().includes(q);
      const matchesCategory = category === "All" || doc.category === category;
      return matchesQuery && matchesCategory;
    });
    if (sort === "name") return [...items].sort((a, b) => a.title.localeCompare(b.title));
    return items;
  }, [query, category, sort]);

  const open = DEMO_DOCUMENTS.find((doc) => doc.id === openId) ?? null;

  if (open) {
    return <DocumentEditor document={open} onBack={() => setOpenId(null)} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t("documents.title")}
        description={t("documents.subtitle")}
        actions={
          <>
            <Button variant="primary" onClick={() => setNewOpen(true)}>
              <FilePlus2 className="h-4 w-4" aria-hidden="true" />
              {t("documents.newDocument")}
            </Button>
            <DemoBadge label={t("common.localOnly")} />
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--subtle-foreground)]"
            aria-hidden="true"
          />
          <label htmlFor="doc-search" className="sr-only">
            {t("documents.searchDocuments")}
          </label>
          <Input
            id="doc-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("documents.searchDocuments")}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="doc-category" className="sr-only">
            {t("documents.category")}
          </label>
          <select
            id="doc-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-10 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm shadow-[var(--shadow-xs)] focus:border-[var(--brand)] focus:outline-none focus:ring-4 focus:ring-[var(--brand-ring)]"
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? t("documents.allCategories") : item}
              </option>
            ))}
          </select>

          <label htmlFor="doc-sort" className="sr-only">
            {t("documents.sortBy")}
          </label>
          <select
            id="doc-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="h-10 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm shadow-[var(--shadow-xs)] focus:border-[var(--brand)] focus:outline-none focus:ring-4 focus:ring-[var(--brand-ring)]"
          >
            <option value="recent">{t("documents.sortRecent")}</option>
            <option value="name">{t("documents.sortName")}</option>
            <option value="created">{t("documents.sortCreated")}</option>
          </select>

          <div className="flex rounded-[var(--radius-sm)] border border-[var(--border)] p-0.5">
            <button
              type="button"
              aria-label={t("documents.gridView")}
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-[5px] focus-ring",
                view === "grid" ? "bg-[var(--surface-elevated)] text-[var(--foreground)]" : "text-[var(--muted-foreground)]",
              )}
            >
              <Grid2x2 className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={t("documents.listView")}
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-[5px] focus-ring",
                view === "list" ? "bg-[var(--surface-elevated)] text-[var(--foreground)]" : "text-[var(--muted-foreground)]",
              )}
            >
              <LayoutList className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <IntegrationPending feature="Cloud document storage">
        {t("documents.localOnlyNote")}
      </IntegrationPending>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FilePlus2}
          title={t("documents.empty")}
          description={t("documents.emptyBody")}
          action={
            <Button variant="primary" onClick={() => setNewOpen(true)}>
              {t("documents.newDocument")}
            </Button>
          }
        />
      ) : (
        <ul
          className={cn(
            view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-2",
          )}
        >
          {filtered.map((doc) => (
            <li key={doc.id}>
              <button
                type="button"
                onClick={() => setOpenId(doc.id)}
                className={cn(
                  "w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] text-left transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)] focus-ring",
                  view === "grid" ? "p-4" : "flex items-center gap-4 px-4 py-3",
                )}
              >
                <span className={cn("block", view === "list" && "flex flex-1 items-center gap-4")}>
                  <span className="block truncate text-sm font-medium">{doc.title}</span>
                  <span
                    className={cn(
                      "mt-1 block text-[0.75rem] text-[var(--muted-foreground)]",
                      view === "list" && "mt-0",
                    )}
                  >
                    {doc.category} · {doc.words} {t("documents.wordCount")}
                  </span>
                </span>
                <span
                  className={cn(
                    "flex items-center gap-2 text-[0.75rem] text-[var(--subtle-foreground)]",
                    view === "grid" ? "mt-3" : "shrink-0",
                  )}
                >
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[0.625rem] font-medium",
                      doc.status === "published"
                        ? "bg-[var(--success-soft)] text-[var(--success)]"
                        : "bg-[var(--surface-elevated)] text-[var(--muted-foreground)]",
                    )}
                  >
                    {doc.status === "published" ? t("common.published") : t("common.draft")}
                  </span>
                  {doc.updatedAt}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <NewDocumentDialog open={newOpen} onOpenChange={setNewOpen} onPick={(id) => setOpenId(id)} />
    </div>
  );
}

function NewDocumentDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (id: string) => void;
}) {
  const t = useT();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{t("documents.templates")}</DialogTitle>
          <DialogDescription>{t("documents.newDocument")}</DialogDescription>
        </DialogHeader>
        <DialogBodyGrid>
          {TEMPLATES.map((template) => (
            <button
              key={template}
              type="button"
              onClick={() => {
                onOpenChange(false);
                onPick(DEMO_DOCUMENTS[0].id);
              }}
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-3.5 text-left transition-colors hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] focus-ring"
            >
              <span className="block text-sm font-medium">
                {t(`documents.templatesList.${template}`)}
              </span>
            </button>
          ))}
        </DialogBodyGrid>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("actions.cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogBodyGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-2.5 px-6 pb-2 sm:grid-cols-2">{children}</div>;
}

function DocumentEditor({ document, onBack }: { document: DemoDocument; onBack: () => void }) {
  const t = useT();
  const [focusMode, setFocusMode] = React.useState(false);
  const [preview, setPreview] = React.useState(false);
  const [saveState, setSaveState] = React.useState<"idle" | "saving" | "local">("local");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: t("documents.editorTitle") }),
    ],
    content: `<h2>${document.title}</h2><p></p>`,
    editorProps: {
      attributes: {
        class: "vera-prose min-h-[420px] px-1 focus:outline-none",
        "aria-label": t("documents.editorTitle"),
      },
    },
    onUpdate: () => {
      setSaveState("saving");
      window.setTimeout(() => setSaveState("local"), 600);
    },
  });

  React.useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-[var(--muted-foreground)]">
        {t("common.loading")}
      </div>
    );
  }

  const words = editor.getText().trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("actions.back")}
        </Button>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{document.title}</span>
        <span role="status" className="text-[0.75rem] text-[var(--muted-foreground)]">
          {saveState === "saving" ? t("documents.autosaveSaving") : t("documents.autosaveLocal")}
        </span>
        <Button variant="secondary" size="sm" onClick={() => setPreview((p) => !p)}>
          {preview ? t("documents.editMode") : t("documents.previewMode")}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" aria-hidden="true" />
          {t("documents.print")}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={focusMode ? t("actions.close") : t("documents.outline")}
          onClick={() => setFocusMode((f) => !f)}
        >
          {focusMode ? (
            <Minimize2 className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      <Alert variant="info">{t("documents.localOnlyNote")}</Alert>

      {!preview && (
        <div className="flex flex-wrap items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-1.5">
          <ToolbarButton
            label="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Strikethrough"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-[var(--divider)]" />
          <ToolbarButton
            label="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-[var(--divider)]" />
          <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>
          <span className="ml-auto pr-2 text-[0.6875rem] text-[var(--subtle-foreground)]">
            {words} {t("documents.wordCount")}
          </span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <div className="surface-card p-6">
          {preview ? (
            <div className="vera-prose" dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
          ) : (
            <EditorContent editor={editor} />
          )}
        </div>

        {!focusMode && (
          <aside className="hidden lg:block">
            <div className="surface-card p-4">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--subtle-foreground)]">
                {t("documents.outline")}
              </p>
              <ul className="mt-3 space-y-2 text-[0.8125rem] text-[var(--muted-foreground)]">
                <li className="font-medium text-[var(--foreground)]">{document.title}</li>
                <li className="pl-2">{document.category}</li>
                <li className="pl-2">
                  {words} {t("documents.wordCount")}
                </li>
              </ul>
              <div className="mt-4 border-t border-[var(--divider)] pt-3">
                <IntegrationPending feature={t("documents.aiAssist")}>
                  {t("documents.aiAssistPending")}
                </IntegrationPending>
              </div>
              <div className="mt-3">
                <IntegrationPending feature="PDF / DOCX export">
                  {t("documents.exportPending")}
                </IntegrationPending>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-[5px] text-[var(--muted-foreground)] transition-colors focus-ring",
        active ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]",
      )}
    >
      {children}
    </button>
  );
}
