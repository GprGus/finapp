import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useNotes } from '../state/store';
import { EditorToolbar } from '../components/EditorToolbar';
import type { Note } from '../types';

export function NoteEditor({
  note,
  onBack,
  onRequestDelete,
}: {
  note: Note;
  onBack: () => void;
  onRequestDelete: (note: Note) => void;
}) {
  const { updateNote } = useNotes();
  const [title, setTitle] = useState(note.title);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);

  // Intentionally keyed only on note.id: this should reset the editor when switching notes, but
  // must NOT re-run on every keystroke (note.title/contentHtml change on each debounced autosave),
  // which would wipe the contentEditable DOM and the user's cursor position mid-typing.
  useEffect(() => {
    setTitle(note.title);
    if (editorRef.current) editorRef.current.innerHTML = note.contentHtml;
  }, [note.id]);

  const scheduleSave = (data: Partial<Pick<Note, 'title' | 'contentHtml'>>) => {
    window.clearTimeout(saveTimer.current);
    // Best-effort autosave: fire the PATCH without blocking typing, and swallow failures here —
    // the explicit flush in goBack() is what the user actually sees/waits on.
    saveTimer.current = window.setTimeout(() => {
      updateNote(note.id, data).catch((err) => console.error('Falha ao salvar nota', err));
    }, 400);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    scheduleSave({ title: value });
  };

  const handleContentChange = () => {
    scheduleSave({ contentHtml: editorRef.current?.innerHTML ?? '' });
  };

  const runCommand = (command: string) => {
    editorRef.current?.focus();
    document.execCommand(command);
    handleContentChange();
  };

  const openImagePicker = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      editorRef.current?.focus();
      const sel = window.getSelection();
      if (sel && savedRangeRef.current) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
      document.execCommand('insertImage', false, reader.result as string);
      handleContentChange();
    };
    reader.readAsDataURL(file);
  };

  const goBack = async () => {
    window.clearTimeout(saveTimer.current);
    try {
      await updateNote(note.id, { title, contentHtml: editorRef.current?.innerHTML ?? '' });
    } catch (err) {
      console.error('Falha ao salvar nota', err);
    }
    onBack();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div
        className="sticky top-0 z-60 flex items-center justify-between px-3 pt-[calc(env(safe-area-inset-top,0px)+10px)] pb-2"
        style={{
          background: 'var(--header-blur-bg)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        }}
      >
        <button
          onClick={goBack}
          aria-label="Voltar"
          className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer bg-transparent flex-shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12.5 4.5L6 10l6.5 5.5"
              stroke="var(--color-ink)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          onClick={() => onRequestDelete(note)}
          aria-label="Excluir nota"
          className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer bg-transparent flex-shrink-0"
          style={{ color: 'var(--warning-color)' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M3.5 5h11M7 5V3.5h4V5M4.5 5l.6 9.5A1.5 1.5 0 006.6 16h4.8a1.5 1.5 0 001.5-1.5L13.5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </button>
      </div>

      <EditorToolbar onCommand={runCommand} onInsertImage={openImagePicker} />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="px-5 pt-4 pb-10 flex-1">
        <input
          className="w-full text-[22px] font-bold text-ink tracking-tight mb-3 outline-none border-none bg-transparent placeholder:text-ink/30"
          placeholder="Título"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
        />
        <div
          ref={editorRef}
          className="note-content text-[15px] text-ink leading-relaxed outline-none min-h-[50vh]"
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentChange}
          data-placeholder="Comece a escrever…"
        />
      </div>
    </div>
  );
}
