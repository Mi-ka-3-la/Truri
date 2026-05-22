import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { ArrowRight, BookOpen, Target, Eye, RotateCcw, Map } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { useCourseCtx } from '@/app/components/CourseShell';

export function CourseOverview() {
  const { course, concepts, completedConcepts, resetCourse, setCurrentConceptId } = useCourseCtx();
  const navigate = useNavigate();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSelect = (conceptId: string) => {
    setCurrentConceptId(conceptId);
    navigate(`/courses/${course.slug}/learn`);
  };

  const isHighlighted = (id: string) => {
    if (!hoveredId) return false;
    if (id === hoveredId) return true;
    const hovered = concepts.find((c) => c.id === hoveredId);
    return hovered?.connections.includes(id) ?? concepts.find((c) => c.id === id)?.connections.includes(hoveredId) ?? false;
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-10">
        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => navigate('/')}
              className="text-slate-500 hover:text-slate-300 transition-colors text-sm flex items-center gap-1"
            >
              ← Cursuri
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{course.title}</h1>
              <p className="text-slate-400 mt-1 text-sm">{course.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-300">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span className="text-sm">{concepts.length} concepte</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-sm">{completedConcepts.size} completate</span>
              </div>
              <Button
                onClick={() => handleSelect(concepts[0].id)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-5 py-2 shadow-lg"
              >
                {completedConcepts.size > 0 ? 'Continua' : 'Incepe'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {completedConcepts.size > 0 && (
                <Button
                  onClick={() => setShowResetDialog(true)}
                  variant="ghost"
                  className="text-slate-400 hover:text-white hover:bg-white/5 px-3"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Mind map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl border border-white/10 p-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
              <Map className="w-3.5 h-3.5" />
              Harta conceptelor
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Eye className="w-3.5 h-3.5 text-cyan-500" />
              hover pentru conexiuni
            </div>
          </div>

          <svg
            viewBox="0 0 800 620"
            className="w-full h-[580px]"
            style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))' }}
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Connections */}
            {concepts.map((concept) =>
              concept.connections.map((connId) => {
                const target = concepts.find((c) => c.id === connId);
                if (!target) return null;
                const edgeKey = [concept.id, connId].sort().join('--');
                const x1 = (concept.position.x / 100) * 800;
                const y1 = (concept.position.y / 100) * 620;
                const x2 = (target.position.x / 100) * 800;
                const y2 = (target.position.y / 100) * 620;
                const cx = (x1 + x2) / 2;
                const active = hoveredId === concept.id || hoveredId === connId;
                const bothDone = completedConcepts.has(concept.id) && completedConcepts.has(connId);
                return (
                  <motion.path
                    key={edgeKey}
                    d={`M ${x1} ${y1} Q ${cx} ${y1} ${x2} ${y2}`}
                    fill="none"
                    stroke={active ? '#06b6d4' : bothDone ? '#3b82f6' : '#334155'}
                    strokeWidth={active ? 3 : 2}
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: active ? 1 : hoveredId ? 0.12 : 0.45 }}
                    transition={{ duration: 0.9, delay: 0.2 }}
                  />
                );
              }),
            )}

            {/* Nodes */}
            {concepts.map((concept, i) => {
              const x = (concept.position.x / 100) * 800;
              const y = (concept.position.y / 100) * 620;
              const done = completedConcepts.has(concept.id);
              const highlighted = isHighlighted(concept.id);
              const active = hoveredId === concept.id;
              const isCenter = i === 0;
              const r = isCenter ? 52 : 38;

              return (
                <g
                  key={concept.id}
                  onMouseEnter={() => setHoveredId(concept.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleSelect(concept.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {(done || active) && (
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={r + 14}
                      fill={active ? '#06b6d4' : '#3b82f6'}
                      opacity={active ? 0.35 : 0.18}
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: active ? 0.7 : 2.5, repeat: Infinity }}
                    />
                  )}
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill={highlighted ? 'rgba(6,182,212,0.12)' : 'rgba(15,23,42,0.92)'}
                    stroke={active ? '#06b6d4' : done ? '#10b981' : highlighted ? '#3b82f6' : '#334155'}
                    strokeWidth={active || isCenter ? 3 : 2}
                    filter="url(#glow)"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: active ? 1.08 : 1,
                      opacity: hoveredId && !highlighted ? 0.25 : 1,
                    }}
                    transition={{ delay: 0.15 + i * 0.07, type: 'spring' }}
                  />
                  {/* Category label */}
                  <motion.text
                    x={x}
                    y={y - r - 7}
                    textAnchor="middle"
                    fill={highlighted || active ? '#06b6d4' : '#475569'}
                    fontSize="8"
                    fontFamily="monospace"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredId && !highlighted ? 0.2 : 0.75 }}
                    transition={{ delay: 0.35 + i * 0.07 }}
                  >
                    {concept.category.toUpperCase()}
                  </motion.text>
                  {/* Label */}
                  <motion.text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fill={active ? '#06b6d4' : done ? '#10b981' : highlighted ? '#38bdf8' : '#e2e8f0'}
                    fontSize={isCenter ? 14 : 12}
                    fontWeight="bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredId && !highlighted ? 0.25 : 1 }}
                    transition={{ delay: 0.35 + i * 0.07 }}
                  >
                    {concept.label}
                  </motion.text>
                  {/* Done badge */}
                  {done && (
                    <>
                      <circle cx={x + r - 9} cy={y - r + 9} r={11} fill="#10b981" />
                      <text x={x + r - 9} y={y - r + 13} textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">✓</text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </motion.div>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-orange-400" />
              Restart {course.title}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Se sterge tot progresul din acest curs ({completedConcepts.size} concepte completate).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-white/10 text-white hover:bg-slate-700">
              Anuleaza
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { resetCourse(); setShowResetDialog(false); }}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white"
            >
              Da, Restart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
