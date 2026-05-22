import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import {
  X,
  Brain,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  ListChecks,
  Sparkles
} from "lucide-react";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  topic: string;
  timestamp: number;
}

interface FlashcardsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FlashcardsPanel({ isOpen, onClose }: FlashcardsPanelProps) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDeck, setShowDeck] = useState(true);
  const [studyMode, setStudyMode] = useState<'sequential' | 'random'>('sequential');

  // Load flashcards from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem("learningNotes");
    if (savedNotes) {
      const notes = JSON.parse(savedNotes);
      // Convert notes with questions AND answers into flashcards
      const flashcards = notes
        .filter((note: any) => note.question && note.question.trim() && note.answer && note.answer.trim())
        .map((note: any) => ({
          id: note.id,
          question: note.question,
          answer: note.answer,
          topic: note.topic,
          timestamp: note.timestamp
        }));
      setCards(flashcards);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (studyMode === 'random') {
      const randomIndex = Math.floor(Math.random() * cards.length);
      setCurrentCardIndex(randomIndex);
    } else {
      setCurrentCardIndex((prev) => (prev + 1) % cards.length);
    }
    setIsFlipped(false);
  };

  const handlePrevious = () => {
    setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
    setIsFlipped(false);
  };

  const handleShuffle = () => {
    const randomIndex = Math.floor(Math.random() * cards.length);
    setCurrentCardIndex(randomIndex);
    setIsFlipped(false);
  };

  const selectCard = (index: number) => {
    setCurrentCardIndex(index);
    setShowDeck(false);
    setIsFlipped(false);
  };

  if (!isOpen) return null;

  const currentCard = cards[currentCardIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 500, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 500, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-[700px] bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Flashcards</h2>
              <p className="text-sm text-slate-400">
                {cards.length} {cards.length === 1 ? 'card' : 'cards'} in deck
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowDeck(!showDeck)}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-white/10"
            >
              <ListChecks className="w-4 h-4 mr-2" />
              {showDeck ? 'Hide' : 'Show'} Deck
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {cards.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <Brain className="w-16 h-16 text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              No flashcards yet
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mb-4">
              Create flashcards by adding both a <strong>Question</strong> and an <strong>Answer</strong> in your notes.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-w-md">
              <div className="text-xs text-slate-400 mb-2">💡 How to create flashcards:</div>
              <ol className="text-xs text-slate-300 space-y-1 list-decimal list-inside text-left">
                <li>Go to the Notes panel</li>
                <li>Add a note with both Question and Answer fields filled</li>
                <li>Your flashcard will appear here automatically</li>
              </ol>
            </div>
          </div>
        ) : showDeck ? (
          /* Deck View */
          <div className="flex-1 overflow-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Your Deck</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => setStudyMode(studyMode === 'sequential' ? 'random' : 'sequential')}
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-slate-300 hover:bg-white/5"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  {studyMode === 'sequential' ? 'Sequential' : 'Random'}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {cards.map((card, index) => (
                <motion.button
                  key={card.id}
                  onClick={() => selectCard(index)}
                  className={`relative p-4 rounded-xl border transition-all text-left ${
                    index === currentCardIndex
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-xs text-slate-400 mb-2 font-mono">
                    Card #{index + 1}
                  </div>
                  <div className="text-sm font-medium text-white mb-1 line-clamp-2">
                    {card.question}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                    <span className="text-xs text-slate-400">{card.topic}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          /* Card Study View */
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            {/* Card Counter */}
            <div className="text-sm text-slate-400 mb-8 font-mono">
              Card {currentCardIndex + 1} of {cards.length}
            </div>

            {/* Flashcard */}
            <div className="w-full max-w-xl mb-8 perspective-1000">
              <motion.div
                className="relative w-full h-96 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
              >
                {/* Front of card (Question) */}
                <div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 backdrop-blur-xl p-8 flex flex-col items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                >
                  <div className="text-xs uppercase tracking-wider text-purple-400 mb-4 font-bold">
                    Question
                  </div>
                  <div className="text-xl text-white text-center leading-relaxed">
                    {currentCard?.question}
                  </div>
                  <div className="mt-6 text-sm text-slate-400 flex items-center gap-2">
                    <RotateCw className="w-4 h-4" />
                    Click to flip
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                    <span className="text-xs text-slate-400">{currentCard?.topic}</span>
                  </div>
                </div>

                {/* Back of card (Answer) */}
                <div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50 backdrop-blur-xl p-8 flex flex-col items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="text-xs uppercase tracking-wider text-cyan-400 mb-4 font-bold">
                    Answer
                  </div>
                  <div className="text-lg text-white text-center leading-relaxed max-h-64 overflow-y-auto">
                    {currentCard?.answer}
                  </div>
                  <div className="mt-6 text-sm text-slate-400 flex items-center gap-2">
                    <RotateCw className="w-4 h-4" />
                    Click to flip back
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-4">
              <Button
                onClick={handlePrevious}
                disabled={cards.length <= 1}
                variant="outline"
                size="lg"
                className="border-white/10 text-slate-300 hover:bg-white/5"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </Button>

              <Button
                onClick={handleShuffle}
                disabled={cards.length <= 1}
                variant="outline"
                size="lg"
                className="border-white/10 text-purple-400 hover:bg-purple-500/10"
              >
                <Shuffle className="w-5 h-5" />
              </Button>

              <Button
                onClick={handleNext}
                disabled={cards.length <= 1}
                variant="outline"
                size="lg"
                className="border-white/10 text-slate-300 hover:bg-white/5"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Study Mode Indicator */}
            <div className="mt-6 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Study Mode: {studyMode === 'random' ? 'Random' : 'Sequential'}
            </div>
          </div>
        )}

        {/* Footer */}
        {cards.length > 0 && !showDeck && (
          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="text-xs text-slate-400 text-center">
              💡 Tip: {isFlipped ? 'Test yourself before flipping back' : 'Try to answer before flipping the card'}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
