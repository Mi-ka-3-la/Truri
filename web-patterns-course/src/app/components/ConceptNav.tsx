import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router';
import { useEffect, useRef } from 'react';
import { Check, ArrowRight, Map } from 'lucide-react';
import type { ConceptNode } from '@/lib/courses';

interface FullConceptNavProps {
  currentConceptId: string | null;
  completedConcepts: Set<string>;
  onConceptSelect: (id: string) => void;
  concepts: ConceptNode[];
  courseTitle: string;
}

export function ConceptNavFull({ concepts, courseTitle, currentConceptId, completedConcepts, onConceptSelect }: FullConceptNavProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const conceptRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentConceptId && conceptRefs.current[currentConceptId] && containerRef.current) {
      const el = conceptRefs.current[currentConceptId]!;
      const container = containerRef.current;
      const scrollTo = el.offsetTop - container.clientHeight / 2 + el.offsetHeight / 2;
      container.scrollTo({ top: scrollTo, behavior: 'smooth' });
    }
  }, [currentConceptId]);

  const grouped = concepts.reduce<Record<string, ConceptNode[]>>((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});

  return (
    <div ref={containerRef} className="w-72 border-r border-white/10 bg-black/20 backdrop-blur-xl overflow-auto flex-shrink-0">
      <div className="p-5">
        {/* Back to mind map */}
        <motion.button
          onClick={() => navigate(`/courses/${slug}`)}
          className="w-full mb-5 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Map className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-white">{courseTitle}</div>
              <div className="text-xs text-slate-400">← harta conceptelor</div>
            </div>
          </div>
        </motion.button>

        <div className="space-y-5">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 px-1">
                {category}
              </div>
              <div className="space-y-1.5">
                {items.map((concept) => {
                  const done = completedConcepts.has(concept.id);
                  const active = currentConceptId === concept.id;
                  const connected = currentConceptId
                    ? concept.connections.includes(currentConceptId) ||
                      concepts.find((c) => c.id === currentConceptId)?.connections.includes(concept.id)
                    : false;

                  return (
                    <motion.button
                      key={concept.id}
                      ref={(el) => { conceptRefs.current[concept.id] = el; }}
                      onClick={() => onConceptSelect(concept.id)}
                      className={`relative w-full text-left px-3.5 py-3 rounded-lg transition-all ${
                        active
                          ? 'bg-white/10 ring-2 ring-white/25'
                          : connected
                          ? 'bg-white/5 ring-1 ring-white/15'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.015, x: 3 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {active && (
                        <motion.div
                          className={`absolute -inset-0.5 bg-gradient-to-r ${concept.gradient} rounded-lg blur opacity-25 -z-10`}
                          animate={{ opacity: [0.25, 0.5, 0.25] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-md bg-gradient-to-r ${concept.gradient} flex items-center justify-center flex-shrink-0 ${active ? 'animate-pulse' : ''}`}
                          >
                            <span className="text-white text-[10px] font-bold">
                              {concept.label.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${active ? 'text-white' : 'text-slate-300'}`}>
                              {concept.label}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <ArrowRight className="w-2.5 h-2.5" />
                              {concept.connections.length} conexiuni
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {connected && !active && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                          {done && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`w-5 h-5 rounded-full bg-gradient-to-r ${concept.gradient} flex items-center justify-center`}
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Connected pills */}
                      {active && concept.connections.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-2.5 pt-2.5 border-t border-white/10"
                        >
                          <div className="text-xs text-slate-500 mb-1.5">Leaga-se de:</div>
                          <div className="flex flex-wrap gap-1">
                            {concept.connections.map((connId) => {
                              const conn = concepts.find((c) => c.id === connId);
                              if (!conn) return null;
                              return (
                                <span
                                  key={connId}
                                  onClick={(e) => { e.stopPropagation(); onConceptSelect(connId); }}
                                  className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${conn.gradient} text-white cursor-pointer hover:scale-105 transition-transform`}
                                >
                                  {conn.label}
                                </span>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
