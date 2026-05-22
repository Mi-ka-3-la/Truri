import { motion } from "motion/react";
import { useOutletContext, useNavigate } from "react-router";
import {
  RefreshCw,
  Webhook,
  Clock,
  Plug,
  Radio,
  Inbox,
  RotateCw,
  Shield,
  Network,
  ArrowRight,
  Eye,
  BookOpen,
  Target,
  Map,
  RotateCcw
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

interface OutletContext {
  onComplete: (conceptId: string) => void;
  currentConcept: string | null;
  completedConcepts: Set<string>;
  onResetCourse: () => void;
  onConceptSelect: (conceptId: string) => void;
}

interface ConceptNode {
  id: string;
  label: string;
  Icon: any;
  gradient: string;
  position: { x: number; y: number };
  connections: string[];
  category: string;
  description: string;
}

// Mind map structure: REST API as center, branches radiating out
const CONCEPTS: ConceptNode[] = [
  {
    id: 'restapi',
    label: 'REST API',
    Icon: RefreshCw,
    gradient: 'from-cyan-500 to-blue-500',
    position: { x: 50, y: 50 },
    connections: ['webhook', 'polling', 'graphql'],
    category: 'Core',
    description: 'Synchronous request-response model'
  },
  // Upper-left branch: Push-based → Events
  {
    id: 'webhook',
    label: 'Webhook',
    Icon: Webhook,
    gradient: 'from-blue-500 to-indigo-500',
    position: { x: 25, y: 25 },
    connections: ['restapi', 'eventdriven'],
    category: 'Push-Based',
    description: 'Server-initiated notifications'
  },
  {
    id: 'eventdriven',
    label: 'Event-Driven',
    Icon: Radio,
    gradient: 'from-pink-500 to-rose-500',
    position: { x: 10, y: 15 },
    connections: ['webhook', 'messagequeue'],
    category: 'Architecture',
    description: 'Event-based system design'
  },
  {
    id: 'messagequeue',
    label: 'Message Queue',
    Icon: Inbox,
    gradient: 'from-rose-500 to-orange-500',
    position: { x: 10, y: 35 },
    connections: ['eventdriven', 'retry'],
    category: 'Async',
    description: 'Decoupled message handling'
  },
  // Bottom-left branch: Polling → WebSocket
  {
    id: 'polling',
    label: 'Polling',
    Icon: Clock,
    gradient: 'from-indigo-500 to-purple-500',
    position: { x: 25, y: 75 },
    connections: ['restapi', 'websocket'],
    category: 'Pull-Based',
    description: 'Periodic status checking'
  },
  {
    id: 'websocket',
    label: 'WebSocket',
    Icon: Plug,
    gradient: 'from-purple-500 to-pink-500',
    position: { x: 10, y: 85 },
    connections: ['polling', 'graphql'],
    category: 'Real-time',
    description: 'Persistent two-way connection'
  },
  // Right branch: GraphQL (alternative)
  {
    id: 'graphql',
    label: 'GraphQL',
    Icon: Network,
    gradient: 'from-yellow-500 to-lime-500',
    position: { x: 75, y: 50 },
    connections: ['restapi', 'websocket'],
    category: 'Query',
    description: 'Flexible data fetching'
  },
  // Top-right branch: Resilience
  {
    id: 'retry',
    label: 'Retry Logic',
    Icon: RotateCw,
    gradient: 'from-orange-500 to-amber-500',
    position: { x: 90, y: 25 },
    connections: ['messagequeue', 'circuitbreaker'],
    category: 'Resilience',
    description: 'Automatic failure recovery'
  },
  {
    id: 'circuitbreaker',
    label: 'Circuit Breaker',
    Icon: Shield,
    gradient: 'from-amber-500 to-yellow-500',
    position: { x: 90, y: 10 },
    connections: ['retry'],
    category: 'Resilience',
    description: 'Prevent cascade failures'
  }
];

export function CourseOverview() {
  const { completedConcepts, onResetCourse, onConceptSelect } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [hoveredConcept, setHoveredConcept] = useState<string | null>(null);

  const handleStartLearning = (conceptId: string) => {
    // Set the current concept and navigate to learning page
    onConceptSelect(conceptId);
    navigate('/learn');
  };

  const handleConfirmReset = () => {
    onResetCourse();
    setShowResetDialog(false);
  };

  const getConnectedConcepts = (conceptId: string): string[] => {
    const concept = CONCEPTS.find(c => c.id === conceptId);
    return concept?.connections || [];
  };

  const isHighlighted = (conceptId: string): boolean => {
    if (!hoveredConcept) return false;
    if (conceptId === hoveredConcept) return true;

    // Check if this concept connects to the hovered one
    const hoveredConnections = getConnectedConcepts(hoveredConcept);
    if (hoveredConnections.includes(conceptId)) return true;

    // Check if the hovered concept connects to this one
    const thisConnections = getConnectedConcepts(conceptId);
    if (thisConnections.includes(hoveredConcept)) return true;

    return false;
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          {/* Title and subtitle */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-3">
              Web Patterns Course
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Master the essential patterns for modern web architecture
            </p>
          </div>

          {/* Stats and CTA row */}
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {/* Left: Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-sm">9 Concepts</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-sm">{completedConcepts.size} Completed</span>
              </div>
            </div>

            {/* Right: CTA */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleStartLearning('restapi')}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-2.5 shadow-lg hover:shadow-xl transition-all"
              >
                {completedConcepts.size > 0 ? 'Continue Learning' : 'Start Learning'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              {completedConcepts.size > 0 && (
                <Button
                  onClick={() => setShowResetDialog(true)}
                  variant="ghost"
                  className="text-slate-400 hover:text-white hover:bg-white/5 px-4 py-2.5"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restart
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Mind Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl border border-white/10 p-8 mb-12 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm uppercase tracking-wider text-slate-400 font-mono">
              Concept Map
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Hover over concepts to see connections</span>
            </div>
          </div>

          <svg
            viewBox="0 0 800 600"
            className="w-full h-[600px]"
            style={{ filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.3))' }}
          >
            <defs>
              {/* Gradients for connections */}
              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Draw connections with curved paths (Tony Buzan style) */}
            {CONCEPTS.map((concept) => {
              return concept.connections.map((connId) => {
                const target = CONCEPTS.find(c => c.id === connId);
                if (!target) return null;

                const x1 = (concept.position.x / 100) * 800;
                const y1 = (concept.position.y / 100) * 600;
                const x2 = (target.position.x / 100) * 800;
                const y2 = (target.position.y / 100) * 600;

                // Create organic curved path
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;

                // Calculate control points for smooth curves
                const dx = x2 - x1;
                const dy = y2 - y1;
                const offset = 30;

                // Control point perpendicular to the line
                const cx = midX - dy * offset / 100;
                const cy = midY + dx * offset / 100;

                const isCompleted = completedConcepts.has(concept.id) && completedConcepts.has(target.id);
                const isActiveConnection =
                  hoveredConcept === concept.id ||
                  hoveredConcept === target.id;

                const pathData = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;

                return (
                  <motion.path
                    key={`${concept.id}-${connId}`}
                    d={pathData}
                    fill="none"
                    stroke={isActiveConnection ? "#06b6d4" : (isCompleted ? "#3b82f6" : "#475569")}
                    strokeWidth={isActiveConnection ? "5" : (isCompleted ? "3" : "2")}
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: 1,
                      opacity: isActiveConnection ? 1 : (hoveredConcept ? 0.15 : 0.5)
                    }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                );
              });
            })}

            {/* Draw nodes */}
            {CONCEPTS.map((concept, index) => {
              const x = (concept.position.x / 100) * 800;
              const y = (concept.position.y / 100) * 600;
              const isCompleted = completedConcepts.has(concept.id);
              const highlighted = isHighlighted(concept.id);
              const isCurrent = hoveredConcept === concept.id;
              const isCenter = concept.id === 'restapi';

              // Larger node for center concept
              const nodeRadius = isCenter ? 55 : 40;

              return (
                <g
                  key={concept.id}
                  onMouseEnter={() => setHoveredConcept(concept.id)}
                  onMouseLeave={() => setHoveredConcept(null)}
                >
                  {/* Outer glow for completed or hovered */}
                  {(isCompleted || isCurrent) && (
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={nodeRadius + 15}
                      fill={isCurrent ? "#06b6d4" : "#3b82f6"}
                      opacity={isCurrent ? "0.4" : "0.2"}
                      initial={{ scale: 0 }}
                      animate={{ scale: isCurrent ? [1, 1.2, 1] : [1, 1.1, 1] }}
                      transition={{ duration: isCurrent ? 0.6 : 2, repeat: Infinity }}
                    />
                  )}

                  {/* Node circle */}
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={nodeRadius}
                    fill={highlighted ? "rgba(6, 182, 212, 0.2)" : "rgba(15, 23, 42, 0.9)"}
                    stroke={isCurrent ? "#06b6d4" : (isCompleted ? "#10b981" : (highlighted ? "#3b82f6" : "#475569"))}
                    strokeWidth={isCurrent ? "4" : (isCenter ? "3" : "2")}
                    filter="url(#glow)"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                      opacity: hoveredConcept && !highlighted ? 0.3 : 1
                    }}
                    transition={{ delay: 0.2 + index * 0.08, type: "spring" }}
                    className="cursor-pointer"
                    onClick={() => handleStartLearning(concept.id)}
                  />

                  {/* Category label - positioned outside node */}
                  <motion.text
                    x={x}
                    y={y - nodeRadius - 8}
                    textAnchor="middle"
                    fill={highlighted || isCurrent ? "#06b6d4" : "#64748b"}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredConcept && !highlighted ? 0.3 : 0.8 }}
                    transition={{ delay: 0.4 + index * 0.08 }}
                  >
                    {concept.category.toUpperCase()}
                  </motion.text>

                  {/* Concept name */}
                  <motion.text
                    x={x}
                    y={y + 5}
                    textAnchor="middle"
                    fill={isCurrent ? "#06b6d4" : (isCompleted ? "#10b981" : (highlighted ? "#3b82f6" : "#e2e8f0"))}
                    fontSize={isCenter ? "16" : "13"}
                    fontWeight="bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredConcept && !highlighted ? 0.3 : 1 }}
                    transition={{ delay: 0.4 + index * 0.08 }}
                    className="cursor-pointer"
                    onClick={() => handleStartLearning(concept.id)}
                  >
                    {concept.label}
                  </motion.text>

                  {/* Completed checkmark */}
                  {isCompleted && (
                    <motion.circle
                      cx={x + nodeRadius - 10}
                      cy={y - nodeRadius + 10}
                      r="12"
                      fill="#10b981"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                    </motion.circle>
                  )}
                  {isCompleted && (
                    <motion.text
                      x={x + nodeRadius - 10}
                      y={y - nodeRadius + 14}
                      textAnchor="middle"
                      fontSize="12"
                      fill="white"
                      fontWeight="bold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    >
                      ✓
                    </motion.text>
                  )}
                </g>
              );
            })}
          </svg>
        </motion.div>
      </div>

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
              <span>All {completedConcepts.size} completed concept{completedConcepts.size !== 1 ? 's' : ''}</span>
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
    </div>
  );
}
