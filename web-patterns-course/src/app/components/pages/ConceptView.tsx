import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  Sparkles, CheckCircle2, ArrowRight, StickyNote, Brain,
  Construction, BookOpen, X, Plus, PartyPopper,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { NotesPanel } from '@/app/components/NotesPanel';
import { FlashcardsPanel } from '@/app/components/FlashcardsPanel';
import { useCourseCtx } from '@/app/components/CourseShell';

export function ConceptView() {
  const { course, concepts, currentConceptId, setCurrentConceptId, completedConcepts, markComplete } = useCourseCtx();
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  const [isFlashcardsPanelOpen, setIsFlashcardsPanelOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  const concept = concepts.find((c) => c.id === currentConceptId) ?? null;
  const isCompleted = concept ? completedConcepts.has(concept.id) : false;

  const handleTextSelection = () => {
    const sel = window.getSelection()?.toString().trim();
    if (sel) setSelectedText(sel);
    else setSelectedText('');
  };

  useEffect(() => {
    const onSelectionChange = () => {
      const text = window.getSelection()?.toString().trim();
      if (!text) setSelectedText('');
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, []);

  const goToNext = () => {
    const idx = concepts.findIndex((c) => c.id === currentConceptId);
    const next = concepts[idx + 1];
    if (next) setCurrentConceptId(next.id);
  };

  if (!concept) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-xl"
        >
          <motion.div
            className="w-28 h-28 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-2xl"
            animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Construction className="w-14 h-14 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Alege un concept</h2>
          <p className="text-lg text-slate-300 mb-8">
            Selecteaza un concept din bara laterala pentru a incepe.
          </p>
          <div className="flex items-center justify-center gap-3 text-cyan-400">
            <BookOpen className="w-5 h-5" />
            <span>← alege din stanga</span>
          </div>
        </motion.div>
      </div>
    );
  }

  const conceptIndex = concepts.findIndex((c) => c.id === concept.id);
  const hasNext = conceptIndex < concepts.length - 1;

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 overflow-auto p-10" onMouseUp={handleTextSelection}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            key={concept.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
                  Conceptul {conceptIndex + 1} din {concepts.length} · {course.title}
                </div>
                <h1
                  className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${concept.gradient} mb-2`}
                >
                  {concept.label}
                </h1>
                <p className="text-slate-400 text-base">{concept.subtitle}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0 mt-1">
                <Button
                  onClick={() => { setIsNotesPanelOpen(!isNotesPanelOpen); if (!isNotesPanelOpen) setIsFlashcardsPanelOpen(false); }}
                  variant="outline"
                  size="sm"
                  className={isNotesPanelOpen ? 'border-cyan-500/50 text-cyan-300 bg-cyan-500/10' : 'border-white/10 text-slate-400 hover:text-white bg-white/5'}
                >
                  <StickyNote className="w-4 h-4 mr-1.5" /> Note
                </Button>
                <Button
                  onClick={() => { setIsFlashcardsPanelOpen(!isFlashcardsPanelOpen); if (!isFlashcardsPanelOpen) setIsNotesPanelOpen(false); }}
                  variant="outline"
                  size="sm"
                  className={isFlashcardsPanelOpen ? 'border-purple-500/50 text-purple-300 bg-purple-500/10' : 'border-white/10 text-slate-400 hover:text-white bg-white/5'}
                >
                  <Brain className="w-4 h-4 mr-1.5" /> Carduri
                </Button>
              </div>
            </div>

            {/* Explain paragraphs */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-7 mb-6 border border-white/10 cursor-text select-text space-y-4 hover:border-white/20 transition-colors">
              {concept.explain.map((para, i) => (
                <p
                  key={i}
                  className="text-slate-200 leading-relaxed text-sm"
                  dangerouslySetInnerHTML={{ __html: para }}
                />
              ))}
            </div>

            {/* Diagram */}
            {concept.diagram && (
              <div className="mb-6">
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Diagrama</div>
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-xs text-emerald-400 font-mono leading-relaxed overflow-x-auto whitespace-pre">
                  {concept.diagram}
                </pre>
              </div>
            )}

            {/* Use cases / Pros / Cons */}
            {(concept.usecases.length > 0 || concept.pros.length > 0 || concept.cons.length > 0) && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                {concept.usecases.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10 cursor-text select-text hover:border-white/20 transition-colors">
                    <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-3">Cand il gasesti</h4>
                    <ul className="space-y-2">
                      {concept.usecases.map((u, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-cyan-400 flex-shrink-0 mt-0.5">→</span>
                          <span>{u}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {concept.pros.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10 cursor-text select-text hover:border-white/20 transition-colors">
                    <h4 className="text-xs font-mono text-green-400 uppercase tracking-wider mb-3">Avantaje</h4>
                    <ul className="space-y-2">
                      {concept.pros.map((p, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-green-400 flex-shrink-0 mt-0.5">+</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {concept.cons.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10 cursor-text select-text hover:border-white/20 transition-colors">
                    <h4 className="text-xs font-mono text-red-400 uppercase tracking-wider mb-3">Limitari</h4>
                    <ul className="space-y-2">
                      {concept.cons.map((c, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-red-400 flex-shrink-0 mt-0.5">−</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Connected concepts */}
            {concept.connections.length > 0 && (
              <div className="mb-8">
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Leaga-se de</div>
                <div className="flex flex-wrap gap-2">
                  {concept.connections.map((connId) => {
                    const conn = concepts.find((c) => c.id === connId);
                    if (!conn) return null;
                    return (
                      <button
                        key={connId}
                        onClick={() => setCurrentConceptId(connId)}
                        className={`text-xs px-3 py-1.5 rounded-full bg-gradient-to-r ${conn.gradient} text-white font-medium hover:scale-105 transition-transform shadow-sm`}
                      >
                        {conn.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 mb-6">
              <Button
                onClick={() => markComplete(concept.id)}
                disabled={isCompleted}
                className={`px-7 py-5 text-base font-bold rounded-xl transition-all ${
                  isCompleted
                    ? 'bg-green-500/20 text-green-300 cursor-not-allowed'
                    : `bg-gradient-to-r ${concept.gradient} hover:scale-105 hover:shadow-xl text-white`
                }`}
              >
                {isCompleted ? (
                  <><CheckCircle2 className="w-5 h-5 mr-2" /> Completat!</>
                ) : (
                  <><Sparkles className="w-5 h-5 mr-2" /> Am inteles — adauga caramida</>
                )}
              </Button>
              {isCompleted && hasNext && (
                <Button
                  onClick={goToNext}
                  variant="outline"
                  className="px-6 py-5 text-base border-white/10 text-slate-300 hover:text-white hover:border-cyan-500/50 hover:bg-white/5"
                >
                  Urmatorul <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Celebration */}
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 text-green-400 text-sm font-medium"
              >
                <motion.div
                  animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  <PartyPopper className="w-5 h-5" />
                </motion.div>
                Bravo! O caramida adaugata la zidul tau.
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Text selection tooltip */}
      <AnimatePresence>
        {selectedText && !isNotesPanelOpen && !isFlashcardsPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-40 max-w-xs"
          >
            <div className="relative">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${concept?.gradient ?? 'from-cyan-500 to-blue-500'} rounded-xl blur opacity-60`} />
              <div className="relative bg-slate-900 border border-white/10 rounded-xl p-4 shadow-2xl">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-sm font-bold text-white">Text selectat</span>
                  <Button onClick={() => setSelectedText('')} variant="ghost" size="icon" className="w-5 h-5 text-slate-400">
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <p className="text-xs text-slate-400 italic mb-3 line-clamp-2">"{selectedText.slice(0, 120)}{selectedText.length > 120 ? '...' : ''}"</p>
                <Button
                  onClick={() => setIsNotesPanelOpen(true)}
                  size="sm"
                  className={`w-full bg-gradient-to-r ${concept?.gradient ?? 'from-cyan-500 to-blue-500'} text-white`}
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Adauga la note
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NotesPanel
        isOpen={isNotesPanelOpen}
        onClose={() => setIsNotesPanelOpen(false)}
        selectedText={selectedText}
        currentTopic={concept?.label ?? ''}
        onTextCleared={() => setSelectedText('')}
      />
      <FlashcardsPanel
        isOpen={isFlashcardsPanelOpen}
        onClose={() => setIsFlashcardsPanelOpen(false)}
      />
    </div>
  );
}
