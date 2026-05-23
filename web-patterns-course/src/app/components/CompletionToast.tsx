import { motion, AnimatePresence } from "motion/react";
import { Sparkle, Stack } from "@phosphor-icons/react";
import Confetti from "react-confetti";
import { useWindowSize } from "@/app/hooks/useWindowSize";

interface CompletionToastProps {
  show: boolean;
  conceptName: string;
  brickNumber: number;
}

export function CompletionToast({ show, conceptName, brickNumber }: CompletionToastProps) {
  const { width, height } = useWindowSize();

  return (
    <>
      {/* Confetti */}
      {show && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']}
        />
      )}

      {/* Toast */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.8 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-xl blur opacity-75 animate-pulse"></div>
              <div className="relative bg-slate-900 px-6 py-4 rounded-xl border border-white/20 flex items-center gap-4 shadow-2xl">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 0.5 }}
                >
                  <Sparkle className="w-6 h-6 text-cyan-400" weight="duotone" />
                </motion.div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Stack className="w-6 h-6 text-white" weight="duotone" />
                  </div>
                  <div>
                    <div className="font-bold text-white mb-1">
                      Brick #{brickNumber} Added!
                    </div>
                    <div className="text-sm text-slate-300">
                      {conceptName} mastered
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
