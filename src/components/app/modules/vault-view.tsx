"use client";

import * as React from "react";
import {
  ChevronRight,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  File as FileIcon,
  Folder,
  FolderPlus,
  MoreHorizontal,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, IntegrationPending } from "@/components/ui/alert";
import { DemoBadge, PageHeader, EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UploadProgress, type UploadItem } from "@/components/motion/upload-progress";
import { useT } from "@/components/i18n/language-provider";
import { DEMO_FILES } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const KIND_ICON = {
  pdf: FileText,
  image: FileImage,
  doc: FileText,
  sheet: FileSpreadsheet,
  archive: FileArchive,
} as const;

const FOLDERS = ["All files", "Credentials", "Work", "Personal", "Trash"] as const;

export function VaultView() {
  const t = useT();
  const [folder, setFolder] = React.useState<string>("All files");
  const [query, setQuery] = React.useState("");
  const [starred, setStarred] = React.useState<Record<string, boolean>>({});
  const [uploads, setUploads] = React.useState<UploadItem[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_FILES.filter((file) => {
      const inFolder = folder === "All files" || folder === "Trash" || file.folder === folder;
      const matches = !q || file.name.toLowerCase().includes(q);
      return inFolder && matches;
    });
  }, [folder, query]);

  const addUploads = (names: string[]) => {
    const items: UploadItem[] = names.map((name, index) => ({
      id: `u-${Date.now()}-${index}`,
      name,
      size: 1024 * (512 + index * 128),
      progress: 0,
      status: "uploading" as const,
    }));
    setUploads(items);

    items.forEach((item) => {
      let progress = 0;
      const tick = window.setInterval(() => {
        progress += 12 + Math.random() * 18;
        if (progress >= 100) {
          window.clearInterval(tick);
          setUploads((list) =>
            list.map((u) => (u.id === item.id ? { ...u, progress: 100, status: "complete" } : u)),
          );
        } else {
          setUploads((list) => list.map((u) => (u.id === item.id ? { ...u, progress } : u)));
        }
      }, 220);
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t("vault.title")}
        description={t("vault.subtitle")}
        actions={
          <>
            <Button variant="secondary" onClick={() => addUploads(["sample-upload.pdf"])}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              {t("vault.uploadFiles")}
            </Button>
            <Button variant="primary" onClick={() => addUploads([`folder-${Date.now()}.txt`])}>
              <FolderPlus className="h-4 w-4" aria-hidden="true" />
              {t("vault.newFolder")}
            </Button>
            <DemoBadge label={t("common.localOnly")} />
          </>
        }
      />

      <Alert variant="info">{t("vault.localNote")}</Alert>

      <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
        <aside className="surface-card h-fit p-2" aria-label={t("vault.allFiles")}>
          <ul className="space-y-0.5">
            {FOLDERS.map((item) => {
              const active = folder === item;
              return (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => setFolder(item)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-left text-[0.8125rem] transition-colors focus-ring",
                      active
                        ? "bg-[var(--brand-soft)] font-medium text-[var(--brand)]"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]",
                    )}
                  >
                    <Folder className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {item === "All files"
                      ? t("vault.allFiles")
                      : item === "Trash"
                        ? t("vault.trash")
                        : item}
                    {item === "Trash" && (
                      <ChevronRight className="ml-auto h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 border-t border-[var(--divider)] px-2.5 py-3">
            <p className="flex items-center justify-between text-[0.75rem] text-[var(--muted-foreground)]">
              <span>{t("vault.storage")}</span>
              <span className="tabular-nums">18%</span>
            </p>
            <div
              role="progressbar"
              aria-label={t("vault.storage")}
              aria-valuenow={18}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-elevated)]"
            >
              <span className="block h-full w-[18%] rounded-full bg-[var(--brand)]" />
            </div>
            <p className="mt-1.5 text-[0.6875rem] text-[var(--subtle-foreground)]">
              1.8 GB / 10 GB {t("vault.storageUsed")}
            </p>
          </div>
        </aside>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <label htmlFor="vault-search" className="sr-only">
              {t("vault.searchFiles")}
            </label>
            <Input
              id="vault-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("vault.searchFiles")}
              className="pl-9"
            />
          </div>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const names = Array.from(event.dataTransfer.files).map((f) => f.name);
              addUploads(names.length ? names : ["dropped-file.txt"]);
            }}
            className={cn(
              "rounded-[var(--radius-md)] border-2 border-dashed p-4 transition-colors",
              dragging
                ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                : "border-[var(--border)] bg-[var(--surface)]",
            )}
          >
            <p className="text-center text-sm text-[var(--muted-foreground)]">
              {dragging ? t("vault.dragActive") : t("vault.dropHere")}
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="sr-only"
              aria-label={t("vault.uploadFiles")}
              onChange={(event) => {
                const names = Array.from(event.target.files ?? []).map((f) => f.name);
                addUploads(names.length ? names : ["selected-file.txt"]);
                event.target.value = "";
              }}
            />
            <div className="mt-3 text-center">
              <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
                <Upload className="h-4 w-4" aria-hidden="true" />
                {t("vault.uploadFiles")}
              </Button>
            </div>
          </div>

          {uploads.length > 0 && <UploadProgress items={uploads} onRemove={(id) => setUploads((l) => l.filter((u) => u.id !== id))} />}

          {filtered.length === 0 ? (
            <EmptyState
              icon={Folder}
              title={t("vault.emptyFolder")}
              description={t("vault.emptyFolderBody")}
              compact
            />
          ) : (
            <ul className="surface-card divide-y divide-[var(--divider)] overflow-hidden">
              {filtered.map((file) => {
                const Icon = KIND_ICON[file.kind] ?? FileIcon;
                return (
                  <li key={file.id} className="flex items-center gap-3 px-4 py-3">
                    <Icon className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{file.name}</span>
                      <span className="block text-[0.75rem] text-[var(--subtle-foreground)]">
                        {file.folder} · {file.size} · {file.updatedAt}
                      </span>
                    </span>

                    <button
                      type="button"
                      aria-label={t("vault.starred")}
                      aria-pressed={!!starred[file.id]}
                      onClick={() => setStarred((s) => ({ ...s, [file.id]: !s[file.id] }))}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-[6px] focus-ring",
                        starred[file.id]
                          ? "text-[var(--warning)]"
                          : "text-[var(--subtle-foreground)] hover:text-[var(--foreground)]",
                      )}
                    >
                      <Star
                        className="h-4 w-4"
                        fill={starred[file.id] ? "currentColor" : "none"}
                        aria-hidden="true"
                      />
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label={t("vault.contextMenu")}
                          className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--muted-foreground)] hover:bg-[var(--surface-elevated)] focus-ring"
                        >
                          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>{t("vault.previewFile")}</DropdownMenuItem>
                        <DropdownMenuItem>{t("vault.renameFile")}</DropdownMenuItem>
                        <DropdownMenuItem>{t("vault.moveFile")}</DropdownMenuItem>
                        <DropdownMenuItem className="text-[var(--error)] focus:text-[var(--error)]">
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          {t("vault.deleteFile")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                );
              })}
            </ul>
          )}

          <IntegrationPending feature="Cloud file storage">
            {t("vault.localNote")}
          </IntegrationPending>
        </div>
      </div>
    </div>
  );
}
