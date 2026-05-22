import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useEffect, useRef } from "react";
import {
  Check,
  ArrowRight,
  RefreshCw,
  Webhook,
  Clock,
  Plug,
  Radio,
  Inbox,
  RotateCw,
  Shield,
  Network,
  LucideIcon,
  Map
} from "lucide-react";

interface Concept {
  id: string;
  label: string;
  color: string;
  connections: string[];
  position: { x: number; y: number };
  category: string;
  Icon: LucideIcon;
}

const CONCEPTS: Concept[] = [
  {
    id: 'restapi',
    label: 'REST API',
    color: 'from-cyan-500 to-blue-500',
    connections: ['webhook', 'polling', 'graphql'],
    position: { x: 50, y: 10 },
    category: 'Request-Response',
    Icon: RefreshCw
  },
  {
    id: 'webhook',
    label: 'Webhook',
    color: 'from-blue-500 to-indigo-500',
    connections: ['restapi', 'eventdriven', 'retry'],
    position: { x: 20, y: 25 },
    category: 'Push-Based',
    Icon: Webhook
  },
  {
    id: 'polling',
    label: 'Polling',
    color: 'from-indigo-500 to-purple-500',
    connections: ['restapi', 'websocket'],
    position: { x: 20, y: 40 },
    category: 'Pull-Based',
    Icon: Clock
  },
  {
    id: 'websocket',
    label: 'WebSocket',
    color: 'from-purple-500 to-pink-500',
    connections: ['polling', 'eventdriven'],
    position: { x: 20, y: 55 },
    category: 'Bidirectional',
    Icon: Plug
  },
  {
    id: 'eventdriven',
    label: 'Event-Driven',
    color: 'from-pink-500 to-rose-500',
    connections: ['webhook', 'websocket', 'messagequeue'],
    position: { x: 20, y: 70 },
    category: 'Architecture',
    Icon: Radio
  },
  {
    id: 'messagequeue',
    label: 'Message Queue',
    color: 'from-rose-500 to-orange-500',
    connections: ['eventdriven', 'retry'],
    position: { x: 20, y: 85 },
    category: 'Async Processing',
    Icon: Inbox
  },
  {
    id: 'retry',
    label: 'Retry Logic',
    color: 'from-orange-500 to-amber-500',
    connections: ['webhook', 'messagequeue', 'circuitbreaker'],
    position: { x: 80, y: 30 },
    category: 'Resilience',
    Icon: RotateCw
  },
  {
    id: 'circuitbreaker',
    label: 'Circuit Breaker',
    color: 'from-amber-500 to-yellow-500',
    connections: ['retry'],
    position: { x: 80, y: 50 },
    category: 'Resilience',
    Icon: Shield
  },
  {
    id: 'graphql',
    label: 'GraphQL',
    color: 'from-yellow-500 to-lime-500',
    connections: ['restapi', 'websocket'],
    position: { x: 80, y: 70 },
    category: 'Query Language',
    Icon: Network
  },
];

interface ConceptNavProps {
  currentConcept: string | null;
  completedConcepts: Set<string>;
  onConceptSelect: (conceptId: string) => void;
}

export function ConceptNav({ currentConcept, completedConcepts, onConceptSelect }: ConceptNavProps) {
  const navigate = useNavigate();
  const conceptRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const groupedConcepts = CONCEPTS.reduce((acc, concept) => {
    if (!acc[concept.category]) {
      acc[concept.category] = [];
    }
    acc[concept.category].push(concept);
    return acc;
  }, {} as Record<string, Concept[]>);

  // Listen for selectConcept events from CourseOverview
  useEffect(() => {
    const handleSelectConcept = (event: any) => {
      const { conceptId } = event.detail;
      onConceptSelect(conceptId);
      navigate('/learn');
    };

    window.addEventListener('selectConcept', handleSelectConcept);
    return () => window.removeEventListener('selectConcept', handleSelectConcept);
  }, [onConceptSelect, navigate]);

  // Auto-scroll to current concept
  useEffect(() => {
    if (currentConcept && conceptRefs.current[currentConcept] && containerRef.current) {
      const element = conceptRefs.current[currentConcept];
      const container = containerRef.current;

      if (element) {
        const elementTop = element.offsetTop;
        const elementHeight = element.offsetHeight;
        const containerHeight = container.clientHeight;
        const scrollTop = container.scrollTop;

        // Calculate if element is out of view
        const elementBottom = elementTop + elementHeight;
        const containerBottom = scrollTop + containerHeight;

        if (elementTop < scrollTop || elementBottom > containerBottom) {
          // Scroll to center the element
          const scrollTo = elementTop - (containerHeight / 2) + (elementHeight / 2);

          container.scrollTo({
            top: scrollTo,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [currentConcept]);

  return (
    <div ref={containerRef} className="w-80 border-r border-white/10 bg-black/20 backdrop-blur-xl overflow-auto">
      <div className="p-6">
        {/* Back to Table of Contents Button */}
        <motion.button
          onClick={() => navigate('/')}
          className="w-full mb-6 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 hover:border-cyan-500/50 transition-all group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Map className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white">Table of Contents</div>
              <div className="text-xs text-slate-400">Back to concept map</div>
            </div>
          </div>
        </motion.button>

        <div className="mb-6">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
            Concepts
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedConcepts).map(([category, concepts]) => (
            <div key={category}>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3 px-2">
                {category}
              </div>
              <div className="space-y-2">
                {concepts.map((concept) => {
                  const isCompleted = completedConcepts.has(concept.id);
                  const isCurrent = currentConcept === concept.id;
                  const hasConnection = currentConcept && concept.connections.includes(currentConcept);

                  return (
                    <motion.button
                      key={concept.id}
                      ref={(el) => { conceptRefs.current[concept.id] = el; }}
                      onClick={() => {
                        onConceptSelect(concept.id);
                        navigate('/learn');
                      }}
                      className={`relative w-full text-left px-4 py-3 rounded-lg transition-all duration-300 group ${
                        isCurrent
                          ? 'bg-white/10 ring-2 ring-white/30 shadow-xl'
                          : hasConnection
                          ? 'bg-white/5 ring-1 ring-white/20'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Gradient border effect for current concept */}
                      {isCurrent && (
                        <motion.div
                          className={`absolute -inset-0.5 bg-gradient-to-r ${concept.color} rounded-lg blur opacity-30 -z-10`}
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${concept.color} flex items-center justify-center flex-shrink-0 ${
                            isCurrent ? 'animate-pulse shadow-lg' : ''
                          }`}>
                            <concept.Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium ${
                              isCurrent ? 'text-white' : 'text-slate-300'
                            }`}>
                              {concept.label}
                            </div>
                            {concept.connections.length > 0 && (
                              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <ArrowRight className="w-3 h-3" />
                                <span>{concept.connections.length} connection{concept.connections.length !== 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {hasConnection && !isCurrent && (
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          )}
                          {isCompleted && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`w-6 h-6 rounded-full bg-gradient-to-r ${concept.color} flex items-center justify-center shadow-lg`}
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Connection indicators */}
                      {isCurrent && concept.connections.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 pt-3 border-t border-white/10"
                        >
                          <div className="text-xs text-slate-400 mb-2">Connects to:</div>
                          <div className="flex flex-wrap gap-1">
                            {concept.connections.map((connId) => {
                              const connConcept = CONCEPTS.find(c => c.id === connId);
                              if (!connConcept) return null;
                              return (
                                <span
                                  key={connId}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onConceptSelect(connId);
                                  }}
                                  className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${connConcept.color} text-white cursor-pointer hover:scale-105 transition-transform`}
                                >
                                  {connConcept.label}
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
