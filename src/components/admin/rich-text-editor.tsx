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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isSafeUrl } from "@/lib/actions/validate-url";

export function RichTextEditor({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
}) {
  const [html, setHtml] = useState(defaultValue ?? "");

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
              const url = window.prompt("Link URL");
              if (!url) return;
              if (!isSafeUrl(url)) {
                window.alert("Please enter a valid http:// or https:// URL.");
                return;
              }
              editor.chain().focus().setLink({ href: url }).run();
            }}
            label="Link"
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} value={html} readOnly />
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
