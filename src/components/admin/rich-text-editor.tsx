"use client";

import { useState } from "react";
import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Strikethrough,
  Heading2,
  Heading3,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isSafeUrl } from "@/lib/actions/validate-url";
import { toast } from "sonner";

export function RichTextEditor({
  name,
  label,
  defaultValue,
  enableCaseStudyTemplate = false,
  isEnglish = false,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  enableCaseStudyTemplate?: boolean;
  isEnglish?: boolean;
}) {
  const [html, setHtml] = useState(defaultValue ?? "");
  const [linkInputOpen, setLinkInputOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  function handleApplyLink() {
    if (!linkUrl) {
      setLinkInputOpen(false);
      return;
    }
    if (!isSafeUrl(linkUrl)) {
      toast.error("Format tautan harus diawali dengan http:// atau https://");
      return;
    }
    editor?.chain().focus().setLink({ href: linkUrl }).run();
    setLinkUrl("");
    setLinkInputOpen(false);
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: defaultValue || "",
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose-content min-h-32 rounded-b-xl px-4 py-2.5 text-sm outline-none",
      },
    },
  });

  const state = useEditorState({
    editor,
    selector: (ctx) => ({
      bold: ctx.editor?.isActive("bold") ?? false,
      italic: ctx.editor?.isActive("italic") ?? false,
      strike: ctx.editor?.isActive("strike") ?? false,
      heading2: ctx.editor?.isActive("heading", { level: 2 }) ?? false,
      heading3: ctx.editor?.isActive("heading", { level: 3 }) ?? false,
      bulletList: ctx.editor?.isActive("bulletList") ?? false,
      orderedList: ctx.editor?.isActive("orderedList") ?? false,
      link: ctx.editor?.isActive("link") ?? false,
      alignLeft: ctx.editor?.isActive({ textAlign: "left" }) ?? false,
      alignCenter: ctx.editor?.isActive({ textAlign: "center" }) ?? false,
      alignRight: ctx.editor?.isActive({ textAlign: "right" }) ?? false,
      alignJustify: ctx.editor?.isActive({ textAlign: "justify" }) ?? false,
    }),
  });

  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted">{label}</label>
      <div className="rounded-xl border border-border bg-surface">
        <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
          <ToolbarButton
            active={state?.bold}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            label="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            active={state?.italic}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            label="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            active={state?.strike}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            label="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <div className="mx-1 h-5 w-px bg-border" aria-hidden />
          <ToolbarButton
            active={state?.heading2}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            label="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            active={state?.heading3}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            label="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
          <div className="mx-1 h-5 w-px bg-border" aria-hidden />
          <ToolbarButton
            active={state?.bulletList}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            label="Bullet list"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            active={state?.orderedList}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            label="Numbered list"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <div className="mx-1 h-5 w-px bg-border" aria-hidden />
          <ToolbarButton
            active={state?.alignLeft}
            onClick={() => editor?.chain().focus().setTextAlign("left").run()}
            label="Align left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            active={state?.alignCenter}
            onClick={() => editor?.chain().focus().setTextAlign("center").run()}
            label="Align center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            active={state?.alignRight}
            onClick={() => editor?.chain().focus().setTextAlign("right").run()}
            label="Align right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            active={state?.alignJustify}
            onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
            label="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>
          <div className="mx-1 h-5 w-px bg-border" aria-hidden />
          <ToolbarButton
            active={state?.link}
            onClick={() => {
              if (!editor) return;
              if (editor.isActive("link")) {
                editor.chain().focus().unsetLink().run();
                return;
              }
              setLinkUrl("");
              setLinkInputOpen(true);
            }}
            label="Link"
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
          {enableCaseStudyTemplate && (
            <button
              type="button"
              onClick={() => {
                const template = isEnglish
                  ? `<h3>Problem & Challenges</h3><p>Describe the real-world challenges faced by the user or client before this project.</p><h3>Solution & Technical Architecture</h3><p>Explain the architecture, technology stack, and engineering approach used to solve the problem.</p><ul><li>Key architecture decision & database design</li><li>Performance, responsive UX, and security implementation</li></ul><h3>Outcomes & Impact</h3><ul><li>Measurable latency reduction or conversion improvement</li><li>Direct user satisfaction or operational efficiency</li></ul>`
                  : `<h3>Masalah & Tantangan</h3><p>Tuliskan tantangan atau masalah nyata yang dihadapi pengguna/klien sebelum proyek ini dibangun.</p><h3>Solusi & Arsitektur Teknis</h3><p>Jelaskan pendekatan teknis, pemilihan stack arsitektur, dan bagaimana solusi tersebut menyelesaikan masalah.</p><ul><li>Arsitektur aplikasi dan integrasi sistem utama</li><li>Optimasi performa, keamanan, dan UX yang responsif</li></ul><h3>Dampak & Hasil</h3><ul><li>Peningkatan efisiensi waktu atau hasil terukur yang dicapai</li><li>Tingkat kepuasan klien atau kemudahan operasional</li></ul>`;

                if (!html || html === "<p></p>" || window.confirm(isEnglish ? "Replace editor content with case study template?" : "Ganti konten editor dengan template studi kasus?")) {
                  editor?.commands.setContent(template);
                  setHtml(template);
                }
              }}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              {isEnglish ? "Insert Template" : "Sisipkan Template"}
            </button>
          )}
        </div>
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} value={html} readOnly />

      {linkInputOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-2xl space-y-3">
            <h4 className="font-display font-semibold text-sm text-foreground">Masukkan Tautan Web</h4>
            <input
              type="url"
              autoFocus
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApplyLink();
                } else if (e.key === "Escape") {
                  setLinkInputOpen(false);
                }
              }}
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setLinkInputOpen(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyLink}
                className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted transition-colors hover:bg-surface-2 hover:text-foreground",
        active && "border-accent/40 bg-accent/15 text-accent hover:bg-accent/20 hover:text-accent"
      )}
    >
      {children}
    </button>
  );
}
