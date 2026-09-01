"use client";

import { useRef, useEffect, useCallback } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Start writing...", minHeight = "400px" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternal = useRef(false);

  useEffect(() => {
    if (isInternal.current) return;
    const el = editorRef.current;
    if (el && el.innerHTML !== value) el.innerHTML = value;
  }, [value]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML === "" || el.innerHTML === "<br>") {
      el.innerHTML = `<p class="is-empty">${placeholder}</p>`;
    }
  }, [placeholder]);

  const exec = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    isInternal.current = true;
    if (editorRef.current) onChange(editorRef.current.innerHTML);
    setTimeout(() => { isInternal.current = false; }, 0);
    editorRef.current?.focus();
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertHTML", false, "&nbsp;&nbsp;&nbsp;&nbsp;");
    }
  }, []);

  const insertLink = useCallback(() => {
    const url = prompt("Enter URL:", "https://");
    if (url) exec("createLink", url);
  }, [exec]);

  const addHeading = useCallback((level: string) => {
    document.execCommand("formatBlock", false, level);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
    editorRef.current?.focus();
  }, [onChange]);

  const addList = useCallback((type: "ul" | "ol") => {
    document.execCommand("insert" + (type === "ul" ? "UnorderedList" : "OrderedList"));
    if (editorRef.current) onChange(editorRef.current.innerHTML);
    editorRef.current?.focus();
  }, [onChange]);

  const insertImage = useCallback(() => {
    const url = prompt("Enter image URL:", "https://");
    if (url) {
      document.execCommand("insertImage", false, url);
      if (editorRef.current) onChange(editorRef.current.innerHTML);
      editorRef.current?.focus();
    }
  }, [onChange]);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background">
      <Toolbar
        onBold={() => exec("bold")}
        onItalic={() => exec("italic")}
        onUnderline={() => exec("underline")}
        onHeading={(h: string) => addHeading(h)}
        onBulletList={() => addList("ul")}
        onOrderedList={() => addList("ol")}
        onLink={insertLink}
        onImage={insertImage}
        onAlign={(a: string) => exec("justify" + a.charAt(0).toUpperCase() + a.slice(1))}
      />
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="px-6 py-4 focus:outline-none text-foreground text-base leading-relaxed prose prose-sm max-w-none"
        style={{ minHeight }}
      />
    </div>
  );
}

function Toolbar({ onBold, onItalic, onUnderline, onHeading, onBulletList, onOrderedList, onLink, onImage, onAlign }: { onBold: () => void; onItalic: () => void; onUnderline: () => void; onHeading: (h: string) => void; onBulletList: () => void; onOrderedList: () => void; onLink: () => void; onImage: () => void; onAlign: (a: string) => void }) {
  const btnClass = "p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors text-sm";

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border bg-muted/30 sticky top-0 z-10">
      <button type="button" className={btnClass} onClick={onBold} title="Bold (Ctrl+B)"><BoldIcon /></button>
      <button type="button" className={btnClass} onClick={onItalic} title="Italic (Ctrl+I)"><ItalicIcon /></button>
      <button type="button" className={btnClass} onClick={onUnderline} title="Underline (Ctrl+U)"><UnderlineIcon /></button>
      <span className="w-px h-6 bg-border mx-1" />
      <button type="button" className={btnClass} onClick={() => onHeading("h2")} title="Heading 2"><strong>H2</strong></button>
      <button type="button" className={btnClass} onClick={() => onHeading("h3")} title="Heading 3"><strong>H3</strong></button>
      <button type="button" className={btnClass} onClick={() => onHeading("p")} title="Paragraph">¶</button>
      <span className="w-px h-6 bg-border mx-1" />
      <button type="button" className={btnClass} onClick={onBulletList} title="Bullet List"><ListIcon /></button>
      <button type="button" className={btnClass} onClick={onOrderedList} title="Numbered List"><OrderedListIcon /></button>
      <span className="w-px h-6 bg-border mx-1" />
      <button type="button" className={btnClass} onClick={onLink} title="Insert Link"><LinkIcon /></button>
      <button type="button" className={btnClass} onClick={onImage} title="Insert Image"><ImageIcon /></button>
      <span className="w-px h-6 bg-border mx-1" />
      <button type="button" className={btnClass} onClick={() => onAlign("left")} title="Align Left"><AlignLeftIcon /></button>
      <button type="button" className={btnClass} onClick={() => onAlign("center")} title="Align Center"><AlignCenterIcon /></button>
      <button type="button" className={btnClass} onClick={() => onAlign("right")} title="Align Right"><AlignRightIcon /></button>
    </div>
  );
}

function BoldIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>; }
function ItalicIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>; }
function UnderlineIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>; }
function ListIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>; }
function OrderedListIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>; }
function LinkIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>; }
function ImageIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>; }
function AlignLeftIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/><line x1="21" x2="3" y1="24" y2="24"/></svg>; }
function AlignCenterIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="6"/><line x1="16" x2="8" y1="12" y2="12"/><line x1="18" x2="6" y1="18" y2="18"/></svg>; }
function AlignRightIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="7" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/><line x1="21" x2="17" y1="24" y2="24"/></svg>; }
