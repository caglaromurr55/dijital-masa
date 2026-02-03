"use client";

import { useOptimistic, useRef } from "react";
import { addNote, deleteNote } from "@/actions/notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, StickyNote } from "lucide-react";
import { toast } from "sonner";

interface Note {
  id: string;
  content: string;
  user_id?: string;
  created_at?: string;
}

interface QuickNotesProps {
  initialNotes: Note[];
}

export default function QuickNotes({ initialNotes }: QuickNotesProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [optimisticNotes, addOptimisticNote] = useOptimistic(
    initialNotes,
    (state, newNote: Note) => [newNote, ...state]
  );

  const handleAddNote = async (formData: FormData) => {
    const content = formData.get("content") as string;
    if (!content.trim()) return;

    formRef.current?.reset();

    addOptimisticNote({
      id: Math.random().toString(),
      content: content,
      created_at: new Date().toISOString()
    });

    try {
      await addNote(formData);
      toast.success("Not eklendi");
    } catch (error) {
      toast.error("Not eklenirken hata oluştu");
    }
  };

  const handleDeleteNote = async (id: string) => {
    // Optimistic delete could be added here similar to add
    // For now, simpler implementation for delete
    try {
      await deleteNote(id);
      toast.success("Not silindi");
    } catch (error) {
      toast.error("Not silinirken hata oluştu");
    }
  };

  return (
    <div className="space-y-4">
      <form ref={formRef} action={handleAddNote} className="flex gap-2">
        <Input
          name="content"
          placeholder="Yeni not veya hatırlatıcı..."
          className="text-xs bg-white dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800"
        />
        <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus size={16} />
        </Button>
      </form>

      <div className="space-y-2 max-h-62.5 overflow-y-auto pr-2 custom-scrollbar">
        {optimisticNotes.length === 0 ? (
          <p className="text-[10px] text-center text-slate-400 py-4 italic">Henüz not eklenmemiş.</p>
        ) : (
          optimisticNotes.map((note) => (
            <div key={note.id} className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 rounded-md group">
              <div className="flex items-start gap-2">
                <StickyNote size={12} className="text-yellow-600 dark:text-yellow-500 mt-0.5" />
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{note.content}</p>
              </div>
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}