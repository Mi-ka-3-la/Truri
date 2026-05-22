import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import {
  X,
  Plus,
  Edit3,
  Trash2,
  StickyNote,
  Save,
  XCircle,
  Sparkles
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

interface Note {
  id: string;
  topic: string;
  comment: string;
  question: string;
  answer: string;
  timestamp: number;
}

interface NotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  currentTopic: string;
  onTextCleared: () => void;
}

export function NotesPanel({
  isOpen,
  onClose,
  selectedText,
  currentTopic,
  onTextCleared
}: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    topic: currentTopic,
    comment: "",
    question: "",
    answer: ""
  });

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem("learningNotes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem("learningNotes", JSON.stringify(notes));
  }, [notes]);

  // Update topic when currentTopic changes
  useEffect(() => {
    if (currentTopic) {
      setFormData(prev => ({ ...prev, topic: currentTopic }));
    }
  }, [currentTopic]);

  // Pre-fill comment with selected text
  useEffect(() => {
    if (selectedText && !editingNoteId) {
      setFormData(prev => ({
        ...prev,
        comment: selectedText,
        topic: currentTopic
      }));
      if (!isAddingNote) {
        setIsAddingNote(true);
      }
    }
  }, [selectedText, currentTopic]);

  const handleAddNote = () => {
    if (!formData.comment.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      topic: formData.topic || currentTopic,
      comment: formData.comment,
      question: formData.question,
      answer: formData.answer,
      timestamp: Date.now()
    };

    setNotes([newNote, ...notes]);
    resetForm();
    onTextCleared();
  };

  const handleUpdateNote = () => {
    if (!editingNoteId || !formData.comment.trim()) return;

    setNotes(notes.map(note =>
      note.id === editingNoteId
        ? { ...note, ...formData }
        : note
    ));
    resetForm();
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const handleEditNote = (note: Note) => {
    setFormData({
      topic: note.topic,
      comment: note.comment,
      question: note.question,
      answer: note.answer
    });
    setEditingNoteId(note.id);
    setIsAddingNote(false);
  };

  const resetForm = () => {
    setFormData({
      topic: currentTopic,
      comment: "",
      question: "",
      answer: ""
    });
    setIsAddingNote(false);
    setEditingNoteId(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 500, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 500, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-[600px] bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
              <StickyNote className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Learning Notes</h2>
              <p className="text-sm text-slate-400">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'} saved
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Add Note Form */}
        {(isAddingNote || editingNoteId) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-6 bg-white/5 border-b border-white/10"
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Topic
                </label>
                <Input
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="Enter topic..."
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Comment / Note
                  {selectedText && (
                    <span className="ml-2 text-xs text-cyan-400">
                      (Highlighted text pasted below)
                    </span>
                  )}
                </label>
                <Textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Highlight any text from the content and it will appear here automatically, or type your own notes..."
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 min-h-[150px] font-normal"
                  rows={8}
                />
                <div className="text-xs text-slate-400 mt-1">
                  {formData.comment.length} characters
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Question (Optional)
                </label>
                <Textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter a question to explore later..."
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 min-h-[80px]"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  Answer (Optional)
                  {formData.question && formData.answer && (
                    <span className="text-xs text-purple-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Will create flashcard
                    </span>
                  )}
                </label>
                <Textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Enter the answer to create a flashcard..."
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 min-h-[80px]"
                  rows={3}
                />
                {formData.question && !formData.answer && (
                  <div className="text-xs text-slate-500 mt-1">
                    💡 Add an answer to turn this into a flashcard for studying
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={editingNoteId ? handleUpdateNote : handleAddNote}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingNoteId ? 'Update Note' : 'Save Note'}
                </Button>
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="border-white/10 text-slate-300 hover:bg-white/5"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Add Note Button */}
        {!isAddingNote && !editingNoteId && (
          <div className="p-4 border-b border-white/10">
            <Button
              onClick={() => setIsAddingNote(true)}
              className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Note
            </Button>
          </div>
        )}

        {/* Notes Table */}
        <div className="flex-1 overflow-auto p-6">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <StickyNote className="w-16 h-16 text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">
                No notes yet
              </h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Highlight text from the learning content and click "Add Note" to start building your knowledge base.
              </p>
            </div>
          ) : (
            <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-cyan-400 font-bold">Topic</TableHead>
                    <TableHead className="text-cyan-400 font-bold">Comment</TableHead>
                    <TableHead className="text-cyan-400 font-bold">Question</TableHead>
                    <TableHead className="text-cyan-400 font-bold">Answer</TableHead>
                    <TableHead className="text-cyan-400 font-bold w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notes.map((note) => (
                    <TableRow
                      key={note.id}
                      className="border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <TableCell className="font-medium text-white align-top">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mt-1.5 flex-shrink-0" />
                          <span>{note.topic}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300 align-top max-w-xs">
                        <div className="whitespace-pre-wrap break-words text-sm">
                          {note.comment}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400 align-top max-w-xs">
                        <div className="whitespace-pre-wrap break-words text-sm italic">
                          {note.question || '—'}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300 align-top max-w-xs">
                        <div className="whitespace-pre-wrap break-words text-sm">
                          {note.answer ? (
                            <div className="flex items-start gap-2">
                              <Sparkles className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                              <span>{note.answer}</span>
                            </div>
                          ) : (
                            '—'
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditNote(note)}
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteNote(note.id)}
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="text-xs text-slate-400 text-center space-y-1">
            <div>💡 Tip: Highlight text in the learning content to quickly add notes</div>
            <div className="flex items-center justify-center gap-2 text-purple-400">
              <Sparkles className="w-3 h-3" />
              Add both Question & Answer to create flashcards
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
