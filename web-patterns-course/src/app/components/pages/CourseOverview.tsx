import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useState, useMemo } from 'react';
import { ArrowRight, RotateCcw, Eye } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { useCourseCtx } from '@/app/components/CourseShell';
import { ICON_MAP } from '@/lib/icons';

const W = 800;
const H = 800;
const CX = W / 2;
const CY = H / 2;
const BRANCH_R = 190;
const CONCEPT_R = 330;
const NODE_R = 34;

export function CourseOverview() {
  const { course, concepts, completedConcepts, resetCourse, setCurrentConceptId } = useCourseCtx();
  const navigate = useNavigate();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [hoveredBranch, setHoveredBranch] = useState<number | null>(null);

  const handleSelect = (conceptId: string) => {
    setCurrentConceptId(conceptId);
    navigate(`/courses/${course.slug}/learn`);
  };

  // Group concepts by branch, preserving branch order
  const { branchList, conceptPos, branchMid } = useMemo(() => {
    const map = new Map<number, typeof concepts>();
    concepts.forEach(c => {
      if (!map.has(c.branchIndex)) map.set(c.branchIndex, []);
      map.get(c.branchIndex)!.push(c);
    });
    const branchList = Array.from(map.entries()).sort(([a], [b]) => a - b);
    const nB = branchList.length;

    const conceptPos = new Map<string, { x: number; y: number }>();
    const branchMid = new Map<number, { x: number; y: number; angle: number }>();

    branchList.forEach(([bIdx, bConcepts], order) => {
      const angle = (2 * Math.PI * order) / nB - Math.PI / 2;
      branchMid.set(bIdx, {
        x: CX + Math.cos(angle) * BRANCH_R,
        y: CY + Math.sin(angle) * BRANCH_R,
        angle,
      });

      const n = bConcepts.length;
      bConcepts.forEach((c, j) => {
        const spreadDeg = n === 1 ? 0 : Math.min(28, 56 / (n - 1)) * (j - (n - 1) / 2);
        const spread = (spreadDeg * Math.PI) / 180;
        const a = angle + spread;
        conceptPos.set(c.id, {
          x: CX + Math.cos(a) * CONCEPT_R,
          y: CY + Math.sin(a) * CONCEPT_R,
        });
      });
    });

    return { branchList, conceptPos, branchMid };
  }, [concepts]);

  const branchColor = (bIdx: number) => course.branchColors[bIdx] ?? '#64748b';
  const isLit = (bIdx: number) => hoveredBranch === bIdx;

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto px-8 pt-8 pb-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-slate-500 hover:text-slate-300 transition-colors text-sm mb-3 flex items-center gap-1"
          >
            ← Cursuri
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{course.title}</h1>
              <p className="text-slate-400 mt-1 text-sm">{course.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleSelect(concepts[0].id)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-5"
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

        {/* Mind map container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative bg-slate-900/60 rounded-3xl border border-white/10 backdrop-blur-xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Harta conceptelor</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Eye className="w-3.5 h-3.5" />
              hover pentru ramura
            </span>
          </div>

          {/* SVG lines layer */}
          <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: 'none' }}
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {branchList.map(([bIdx, bConcepts]) => {
                const mid = branchMid.get(bIdx)!;
                const lit = isLit(bIdx);
                const color = branchColor(bIdx);

                // Control point for the main branch curve (perpendicular offset)
                const perp = mid.angle + Math.PI / 2;
                const cpx = CX + Math.cos(mid.angle) * BRANCH_R * 0.5 + Math.cos(perp) * 30;
                const cpy = CY + Math.sin(mid.angle) * BRANCH_R * 0.5 + Math.sin(perp) * 30;

                return (
                  <g key={bIdx}>
                    {/* Center → branch midpoint */}
                    <motion.path
                      d={`M ${CX} ${CY} Q ${cpx} ${cpy} ${mid.x} ${mid.y}`}
                      fill="none"
                      stroke={lit ? color : '#334155'}
                      strokeWidth={lit ? 5 : 3}
                      strokeLinecap="round"
                      filter={lit ? 'url(#glow)' : undefined}
                      animate={{ stroke: lit ? color : '#334155', strokeWidth: lit ? 5 : 3, opacity: hoveredBranch !== null && !lit ? 0.2 : 1 }}
                      transition={{ duration: 0.25 }}
                      initial={{ pathLength: 0 }}
                    />

                    {/* Branch midpoint → each concept */}
                    {bConcepts.map(c => {
                      const pos = conceptPos.get(c.id)!;
                      return (
                        <motion.line
                          key={c.id}
                          x1={mid.x} y1={mid.y}
                          x2={pos.x} y2={pos.y}
                          stroke={lit ? color : '#334155'}
                          strokeWidth={lit ? 2.5 : 1.5}
                          strokeLinecap="round"
                          filter={lit ? 'url(#glow)' : undefined}
                          animate={{ stroke: lit ? color : '#334155', opacity: hoveredBranch !== null && !lit ? 0.2 : 1 }}
                          transition={{ duration: 0.25 }}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>

            {/* DOM nodes layer */}
            <div className="absolute inset-0">

              {/* Center node */}
              <div
                className="absolute"
                style={{ left: `${(CX / W) * 100}%`, top: `${(CY / H) * 100}%`, transform: 'translate(-50%, -50%)' }}
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring' }}
                  className="w-28 h-28 rounded-full bg-slate-900 border-2 border-slate-600 flex flex-col items-center justify-center text-center shadow-2xl"
                >
                  <span className="text-white font-bold text-xs leading-tight px-2">{course.title}</span>
                  <span className="text-slate-500 text-[9px] font-mono mt-1">{concepts.length} concepte</span>
                </motion.div>
              </div>

              {/* Branch category labels */}
              {branchList.map(([bIdx]) => {
                const mid = branchMid.get(bIdx)!;
                const lit = isLit(bIdx);
                const color = branchColor(bIdx);
                const branch = concepts.find(c => c.branchIndex === bIdx);
                const label = branch?.category ?? '';
                return (
                  <motion.div
                    key={bIdx}
                    className="absolute pointer-events-none"
                    style={{ left: `${(mid.x / W) * 100}%`, top: `${(mid.y / H) * 100}%`, transform: 'translate(-50%, -50%)' }}
                    animate={{ opacity: hoveredBranch !== null && !lit ? 0.2 : 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    <span
                      className="text-[9px] font-mono uppercase tracking-wider whitespace-nowrap"
                      style={{ color: lit ? color : '#475569' }}
                    >
                      {label}
                    </span>
                  </motion.div>
                );
              })}

              {/* Concept nodes */}
              {concepts.map((concept, i) => {
                const pos = conceptPos.get(concept.id);
                if (!pos) return null;
                const lit = isLit(concept.branchIndex);
                const done = completedConcepts.has(concept.id);
                const color = branchColor(concept.branchIndex);
                const IconComponent = ICON_MAP[concept.icon];

                return (
                  <motion.div
                    key={concept.id}
                    className="absolute"
                    style={{
                      left: `${(pos.x / W) * 100}%`,
                      top: `${(pos.y / H) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: hoveredBranch !== null && !lit ? 0.2 : 1,
                    }}
                    transition={{ delay: 0.1 + i * 0.05, type: 'spring' }}
                    onMouseEnter={() => setHoveredBranch(concept.branchIndex)}
                    onMouseLeave={() => setHoveredBranch(null)}
                    onClick={() => handleSelect(concept.id)}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      {/* Node circle */}
                      <motion.div
                        animate={{
                          backgroundColor: lit ? `${color}22` : '#0f172a',
                          borderColor: lit ? color : done ? '#10b981' : '#334155',
                          boxShadow: lit ? `0 0 20px ${color}55` : 'none',
                        }}
                        transition={{ duration: 0.25 }}
                        className="flex items-center justify-center rounded-full border-2"
                        style={{ width: NODE_R * 2, height: NODE_R * 2 }}
                      >
                        {IconComponent && (
                          <IconComponent
                            weight={lit || done ? 'duotone' : 'light'}
                            size={26}
                            color={lit ? color : done ? '#10b981' : '#475569'}
                          />
                        )}
                        {done && (
                          <div
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                            style={{ backgroundColor: '#10b981' }}
                          >
                            ✓
                          </div>
                        )}
                      </motion.div>

                      {/* Label */}
                      <motion.span
                        animate={{ color: lit ? '#f1f5f9' : done ? '#10b981' : '#64748b' }}
                        transition={{ duration: 0.25 }}
                        className="text-[10px] font-mono text-center whitespace-nowrap max-w-[90px] leading-tight"
                      >
                        {concept.label}
                      </motion.span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
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
            <AlertDialogCancel className="bg-slate-800 border-white/10 text-white hover:bg-slate-700">Anuleaza</AlertDialogCancel>
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
