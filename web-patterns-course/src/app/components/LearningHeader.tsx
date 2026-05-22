import { motion } from "motion/react";
import {
  RotateCcw,
  RefreshCw,
  Webhook,
  Clock,
  Plug,
  Radio,
  Inbox,
  RotateCw as RotateCwIcon,
  Shield,
  Network
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";

interface LearningHeaderProps {
  courseTitle?: string;
  completedCount: number;
  totalCount: number;
  onResetCourse: () => void;
}

export function LearningHeader({ completedCount, totalCount, onResetCourse }: LearningHeaderProps) {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const progress = (completedCount / totalCount) * 100;

  const handleConfirmReset = () => {
    onResetCourse();
    setShowResetDialog(false);
  };

  return (
    <>
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Progress and Wall */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-slate-900/50 px-6 py-3 rounded-xl border border-white/10">
            <div>
              <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-1">
                Progress
              </div>
              <div className="text-2xl font-bold text-white">
                {completedCount} / {totalCount}
              </div>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div>
              <div className="text-xs text-slate-400 font-mono mb-2 uppercase tracking-wider">
                Build Your Knowledge Wall
              </div>
              <BrickWall completedCount={completedCount} totalCount={totalCount} />
            </div>
          </div>
        </div>

        {/* Right side - Restart */}
        <Button
          onClick={() => setShowResetDialog(true)}
          variant="outline"
          size="sm"
          className="border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-red-500/50"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restart Course
        </Button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-800/50">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 shadow-lg shadow-cyan-500/50"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </header>

    {/* Reset Confirmation Dialog */}
    <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
      <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <RotateCcw className="w-5 h-5 text-orange-400" />
            Restart Course?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            This will clear all your progress including:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span>All {completedCount} completed concept{completedCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span>Your brick wall progress</span>
          </div>
          <div className="text-xs text-slate-500 mt-3">
            Note: Your notes and flashcards will be preserved.
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-slate-800 border-white/10 text-white hover:bg-slate-700">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmReset}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
          >
            Yes, Restart Course
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

interface BrickWallProps {
  completedCount: number;
  totalCount: number;
}

const CONCEPT_ICONS = [
  RefreshCw,      // REST API
  Webhook,        // Webhook
  Clock,          // Polling
  Plug,           // WebSocket
  Radio,          // Event-Driven
  Inbox,          // Message Queue
  RotateCwIcon,   // Retry Logic
  Shield,         // Circuit Breaker
  Network         // GraphQL
];

const CONCEPT_GRADIENTS = [
  'from-cyan-500 to-blue-500',
  'from-blue-500 to-indigo-500',
  'from-indigo-500 to-purple-500',
  'from-purple-500 to-pink-500',
  'from-pink-500 to-rose-500',
  'from-rose-500 to-orange-500',
  'from-orange-500 to-amber-500',
  'from-amber-500 to-yellow-500',
  'from-yellow-500 to-lime-500'
];

function BrickWall({ completedCount, totalCount }: BrickWallProps) {
  // Create a realistic brick wall pattern
  const rows = 3;
  const bricksInRows = [3, 3, 3]; // 3 bricks per row

  let brickCounter = 0;

  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: rows }).map((_, rowIndex) => {
        const bricksInThisRow = bricksInRows[rowIndex];
        const isOffsetRow = rowIndex % 2 === 1;

        return (
          <div
            key={rowIndex}
            className="flex gap-1"
            style={{
              marginLeft: isOffsetRow ? '20px' : '0',
              marginRight: isOffsetRow ? '20px' : '0'
            }}
          >
            {Array.from({ length: bricksInThisRow }).map((_, colIndex) => {
              const currentBrickIndex = brickCounter;
              brickCounter++;

              if (currentBrickIndex >= totalCount) return null;

              const isLit = currentBrickIndex < completedCount;
              const IconComponent = CONCEPT_ICONS[currentBrickIndex];
              const gradient = CONCEPT_GRADIENTS[currentBrickIndex];

              return (
                <motion.div
                  key={colIndex}
                  className={`relative w-10 h-6 rounded-sm transition-all duration-500 flex items-center justify-center ${
                    isLit
                      ? `bg-gradient-to-br ${gradient} shadow-lg border border-white/20`
                      : 'bg-slate-800/80 border border-slate-700/50'
                  }`}
                  initial={{ scale: 0, opacity: 0, y: 20 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    y: 0
                  }}
                  transition={{
                    delay: currentBrickIndex * 0.1,
                    duration: 0.4,
                    type: "spring"
                  }}
                  title={`Concept ${currentBrickIndex + 1}`}
                >
                  {isLit ? (
                    <>
                      <IconComponent className="w-3.5 h-3.5 text-white z-10" />
                      <motion.div
                        className="absolute inset-0 bg-white/20 rounded-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.2, 0, 0.2] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: currentBrickIndex * 0.3
                        }}
                      />
                    </>
                  ) : (
                    <div className="w-2 h-2 rounded-sm bg-slate-600/50" />
                  )}
                </motion.div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
