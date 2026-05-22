import { useOutletContext } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/app/components/ui/button";
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Webhook as WebhookIcon,
  Clock,
  Plug,
  Radio,
  Inbox,
  RotateCw,
  Shield,
  Network,
  StickyNote,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  PartyPopper,
  Construction,
  Brain,
  X
} from "lucide-react";
import { NotesPanel } from "@/app/components/NotesPanel";
import { FlashcardsPanel } from "@/app/components/FlashcardsPanel";
import { useState, useEffect } from "react";

interface OutletContext {
  onComplete: (conceptId: string) => void;
  currentConcept: string | null;
  completedConcepts: Set<string>;
}

const CONCEPT_DATA = {
  restapi: {
    title: "REST API",
    subtitle: "Request-Response: You ask, the server answers",
    gradient: "from-cyan-500 to-blue-500",
    Icon: RefreshCw,
    description: "A REST API works on the synchronous request-response model: you send an HTTP request, wait, receive the response, and continue. It's the simplest model for integration between two systems.",
    keyPoints: [
      "When System A wants data from System B, A makes an HTTP request to B",
      "B processes and responds immediately (in milliseconds or seconds)",
      "A must know when to ask and actively wait for the response",
      "Fundamental limitation: if you want to know when something changed on the server, you must ask periodically (polling)"
    ],
    useCases: [
      "Simple integrations between systems",
      "CRUD operations (create, read, update, delete)",
      "When you need data on-demand, not in real-time"
    ],
    pros: [
      "Simple, universal, easy to test",
      "Every language supports it",
      "Easy to debug (request-response is visible)"
    ],
    cons: [
      "Can't receive notifications - you must ask",
      "Polling is inefficient and slow",
      "Tight coupling between systems"
    ]
  },
  webhook: {
    title: "Webhook",
    subtitle: "The server notifies you, you don't ask it",
    gradient: "from-blue-500 to-indigo-500",
    Icon: WebhookIcon,
    description: "A Webhook reverses the REST model: instead of periodically asking 'did something happen?', the server notifies you when something happens. You register a URL where you want to receive notifications.",
    keyPoints: [
      "You register a URL with a service (e.g., https://your-app.com/webhooks/stripe)",
      "When an event occurs, the service POSTs to that URL immediately",
      "No need to poll the service every second",
      "Main problem: if your app is offline when the webhook fires, you lose it - hence the need for retry mechanisms"
    ],
    useCases: [
      "Payment notifications (Stripe, PayPal)",
      "CI/CD triggered by GitHub push",
      "Data synchronization between systems",
      "Real-time notifications"
    ],
    pros: [
      "Efficient - server notifies only when needed",
      "Real-time",
      "No polling"
    ],
    cons: [
      "Your app must be online and respond quickly",
      "Hard to test locally",
      "Requires retry logic if receiver is offline"
    ]
  },
  polling: {
    title: "Polling",
    subtitle: "Periodically ask if something changed",
    gradient: "from-indigo-500 to-purple-500",
    Icon: Clock,
    description: "Polling means asking the server at regular intervals: 'has anything changed?'. It's the simplest mechanism to simulate real-time data, but also the most inefficient.",
    keyPoints: [
      "Short polling: make a request every N seconds - server responds immediately",
      "Long polling: make a request, server keeps connection open until it has something to send",
      "Simple but generates unnecessary traffic - 95% of requests might be 'nothing new'",
      "Makes sense when you don't have access to webhooks or WebSocket"
    ],
    useCases: [
      "Simple systems without WebSocket support",
      "Checking status of long-running jobs",
      "Fallback when webhooks aren't available"
    ],
    pros: [
      "Simple to implement",
      "Works with any standard HTTP server",
      "Easy to debug"
    ],
    cons: [
      "Inefficient - generates unnecessary traffic",
      "Latency (delay between polls)",
      "Stresses server with useless requests"
    ]
  },
  websocket: {
    title: "WebSocket",
    subtitle: "Persistent bidirectional connection",
    gradient: "from-purple-500 to-pink-500",
    Icon: Plug,
    description: "HTTP is unidirectional: client requests, server responds, connection closes. WebSocket establishes a persistent, bidirectional connection where both client and server can send messages anytime.",
    keyPoints: [
      "Connection starts with a special HTTP handshake (Upgrade: websocket)",
      "After that, the protocol switches: no more request-response, it's an open channel",
      "Server can send data to client without the client asking",
      "Perfect for real-time chat, collaborative tools, live dashboards, multiplayer games"
    ],
    useCases: [
      "Real-time chat (Slack, Discord)",
      "Live collaboration (Figma, Google Docs)",
      "Live data dashboards (trading, monitoring)",
      "Multiplayer browser games"
    ],
    pros: [
      "Bidirectional - server can send anytime",
      "Minimal latency (persistent connection)",
      "Efficient - no repeated HTTP handshake"
    ],
    cons: [
      "Persistent connections consume server resources",
      "More complex to implement and scale",
      "Not cacheable like HTTP"
    ]
  },
  eventdriven: {
    title: "Event-Driven Architecture",
    subtitle: "Systems communicate through events, not direct calls",
    gradient: "from-pink-500 to-rose-500",
    Icon: Radio,
    description: "In event-driven architecture, systems don't call each other directly. Instead: System A publishes an event, System B consumes it when available. This decouples systems completely.",
    keyPoints: [
      "An event is a notification that something happened: OrderPlaced, PaymentReceived, UserRegistered",
      "The producer doesn't know who consumes the event - and doesn't care",
      "A message broker (Kafka, RabbitMQ, AWS SQS) sits between producer and consumer",
      "This decouples systems: producer doesn't wait for consumer, consumer processes at its own pace"
    ],
    useCases: [
      "Systems with many independent components (microservices)",
      "Async processing (orders, payments, emails)",
      "Audit logs and analytics",
      "Integrations between systems that can't be modified"
    ],
    pros: [
      "Decoupling - systems don't know each other directly",
      "Independent scaling of each component",
      "Resilience - a failed consumer doesn't block the producer"
    ],
    cons: [
      "Harder to debug (flow isn't linear)",
      "Eventual consistency, not immediate",
      "Operational complexity (message broker to maintain)"
    ]
  },
  messagequeue: {
    title: "Message Queue",
    subtitle: "The queue that decouples producer from consumer",
    gradient: "from-rose-500 to-orange-500",
    Icon: Inbox,
    description: "A message queue is an intermediary that stores messages until they're processed. Producer puts messages in queue, consumer takes them out and processes at its own pace. They never interact directly.",
    keyPoints: [
      "Fundamental model: producer → queue → consumer",
      "Queue guarantees messages aren't lost even if consumer is offline",
      "A message is acknowledged (confirmed processed) only after successful processing",
      "Popular providers: RabbitMQ (open source), AWS SQS (managed), Kafka (extreme volume, long-term retention)"
    ],
    useCases: [
      "E-commerce order processing",
      "Bulk email sending",
      "Image/video processing (resize, transcoding)",
      "Any task that can wait and doesn't need synchronous processing"
    ],
    pros: [
      "Messages aren't lost if consumer is offline",
      "Decouples producer speed from consumer speed",
      "Scaling: multiple consumers for the same queue"
    ],
    cons: [
      "Eventual consistency (not immediate)",
      "Possible duplicate messages (if acknowledge fails)",
      "Additional infrastructure to maintain"
    ]
  },
  retry: {
    title: "Retry Logic + Exponential Backoff",
    subtitle: "What to do when an operation fails",
    gradient: "from-orange-500 to-amber-500",
    Icon: RotateCw,
    description: "In distributed systems, operations fail. Network issues, overloaded services, server restarts. Retry means automatically trying again after a failure. Exponential backoff means increasing the interval between retries.",
    keyPoints: [
      "Simple retry (try immediately) is dangerous: if server is overloaded, instant retries make it worse",
      "Exponential backoff: first retry after 1s, second after 2s, third after 4s, fourth after 8s, etc.",
      "Add jitter (random variation) so not all clients retry simultaneously",
      "After max retries, give up and send to dead letter queue for manual investigation"
    ],
    useCases: [
      "HTTP calls between microservices",
      "Processing messages from queue",
      "Webhook retries (Stripe, GitHub do this automatically)",
      "Any operation that can fail temporarily"
    ],
    pros: [
      "Resilience to temporary errors",
      "Transparent to user if retry succeeds",
      "Reduces impact of network errors"
    ],
    cons: [
      "Operation must be idempotent (retry twice = same result)",
      "Can mask real problems",
      "Complexity in implementation"
    ]
  },
  circuitbreaker: {
    title: "Circuit Breaker",
    subtitle: "Stop trying when you know it will fail",
    gradient: "from-amber-500 to-yellow-500",
    Icon: Shield,
    description: "Retry is useful for temporary errors. But if an external service is completely down for 30 minutes, trying infinitely is useless and wastes resources. Circuit Breaker solves this.",
    keyPoints: [
      "Works like an electrical circuit breaker: three states",
      "Closed (normal): requests go through",
      "Open: service is considered down, all requests fail immediately without trying",
      "Half-Open: let one test request through; if it succeeds, go to Closed; if it fails, stay Open"
    ],
    useCases: [
      "Microservices that depend on each other",
      "Calls to external APIs",
      "Any system where a failed service can cascade failures"
    ],
    pros: [
      "Prevents cascade failures",
      "Fail fast - immediate error instead of long timeout",
      "Allows external service to recover"
    ],
    cons: [
      "Additional complexity",
      "Circuit state must be shared between instances",
      "Difficult to tune thresholds"
    ]
  },
  graphql: {
    title: "GraphQL",
    subtitle: "You request exactly the data you want, nothing more",
    gradient: "from-yellow-500 to-lime-500",
    Icon: Network,
    description: "In REST, the server decides what data to send at each endpoint. Want a user profile? You get all fields, even if you only need name and avatar. GraphQL reverses control: the client specifies exactly which fields it wants.",
    keyPoints: [
      "Single endpoint (/graphql). Client sends a 'query' describing exact data structure wanted",
      "Server responds with exactly that structure - nothing extra",
      "Solves two classic REST problems: over-fetching (too much data) and under-fetching (need multiple requests)",
      "GraphQL also supports subscriptions - the WebSocket equivalent for real-time data"
    ],
    useCases: [
      "Mobile apps (limited bandwidth - request exactly what you need)",
      "Complex frontends with many data types",
      "Public APIs with diverse clients (each requests what it needs)",
      "Systems with complex interconnected data"
    ],
    pros: [
      "Eliminates over-fetching and under-fetching",
      "Single endpoint",
      "Self-documenting schema",
      "Subscriptions for real-time"
    ],
    cons: [
      "More complex to implement on server",
      "Caching harder than REST (no simple GET)",
      "Complex queries can overload server",
      "Overhead for simple APIs"
    ]
  }
};

export function BalanceSheet() {
  const { onComplete, currentConcept, completedConcepts } = useOutletContext<OutletContext>();
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  const [isFlashcardsPanelOpen, setIsFlashcardsPanelOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectionContext, setSelectionContext] = useState("");

  const conceptData = currentConcept && currentConcept in CONCEPT_DATA
    ? CONCEPT_DATA[currentConcept as keyof typeof CONCEPT_DATA]
    : null;

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 0) {
      // Preserve line breaks and formatting
      const formattedText = text.replace(/\n+/g, '\n\n');
      setSelectedText(formattedText);
      setSelectionContext(conceptData?.title || "");
    } else {
      // Clear selection if no text is selected
      setSelectedText("");
    }
  };

  // Listen for selection changes globally
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      // If no text is selected, clear the tooltip
      if (!text || text.length === 0) {
        setSelectedText("");
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  if (!conceptData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl"
        >
          <div className="mb-8">
            <motion.div
              className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-2xl"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Construction className="w-16 h-16 text-white" />
            </motion.div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Start Building Your Knowledge Wall
            </h2>
            <p className="text-xl text-slate-300">
              Select a concept from the left to begin your learning journey.
              Each completed concept adds a brick to your wall.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 text-cyan-400">
            <BookOpen className="w-6 h-6" />
            <span className="text-lg font-medium">Choose a topic to get started</span>
            <ArrowRight className="w-6 h-6 animate-pulse" />
          </div>
        </motion.div>
      </div>
    );
  }

  const isCompleted = completedConcepts.has(currentConcept!);
  const IconComponent = conceptData.Icon;

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-auto p-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onMouseUp={handleTextSelection}
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-r ${conceptData.gradient} flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h1 className={`text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${conceptData.gradient}`}>
                      {conceptData.title}
                    </h1>
                    <p className="text-xl text-slate-300 mt-2">{conceptData.subtitle}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsNotesPanelOpen(!isNotesPanelOpen);
                      if (!isNotesPanelOpen) setIsFlashcardsPanelOpen(false);
                    }}
                    className={`${
                      isNotesPanelOpen
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    }`}
                  >
                    <StickyNote className="w-4 h-4 mr-2" />
                    Notes
                  </Button>
                  <Button
                    onClick={() => {
                      setIsFlashcardsPanelOpen(!isFlashcardsPanelOpen);
                      if (!isFlashcardsPanelOpen) setIsNotesPanelOpen(false);
                    }}
                    className={`${
                      isFlashcardsPanelOpen
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    }`}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Cards
                  </Button>
                </div>
              </div>
            </div>

            {/* Main description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-white/10 cursor-text select-text group hover:border-cyan-500/30 transition-all"
              title="Highlight any text to add it to your notes"
            >
              <p className="text-lg text-slate-200 leading-relaxed">
                {conceptData.description}
              </p>
            </motion.div>

            {/* Key Points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-cyan-400" />
                Key Concepts
                <span className="text-xs font-normal text-slate-400 ml-2">
                  (Highlight to add to notes)
                </span>
              </h3>
              <div className="space-y-3">
                {conceptData.keyPoints.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-3 bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 cursor-text select-text group hover:border-cyan-500/30 transition-all"
                    title="Highlight this text to add it to your notes"
                  >
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${conceptData.gradient} mt-2 flex-shrink-0`} />
                    <p className="text-slate-200">{point}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Use Cases, Pros, Cons Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 mb-8"
            >
              {/* Use Cases */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 cursor-text select-text group hover:border-cyan-500/30 transition-all">
                <h4 className="text-lg font-bold text-cyan-400 mb-4 uppercase tracking-wider text-sm">
                  Use Cases
                </h4>
                <ul className="space-y-2">
                  {conceptData.useCases.map((useCase, index) => (
                    <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-cyan-400 flex-shrink-0">→</span>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pros */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 cursor-text select-text group hover:border-cyan-500/30 transition-all">
                <h4 className="text-lg font-bold text-green-400 mb-4 uppercase tracking-wider text-sm">
                  Advantages
                </h4>
                <ul className="space-y-2">
                  {conceptData.pros.map((pro, index) => (
                    <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-green-400 flex-shrink-0">+</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 cursor-text select-text group hover:border-cyan-500/30 transition-all">
                <h4 className="text-lg font-bold text-red-400 mb-4 uppercase tracking-wider text-sm">
                  Limitations
                </h4>
                <ul className="space-y-2">
                  {conceptData.cons.map((con, index) => (
                    <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-red-400 flex-shrink-0">−</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center"
        >
          <Button
            onClick={() => onComplete(currentConcept!)}
            disabled={isCompleted}
            className={`px-8 py-6 text-lg font-bold rounded-xl transition-all duration-300 ${
              isCompleted
                ? 'bg-green-500/20 text-green-300 cursor-not-allowed'
                : `bg-gradient-to-r ${conceptData.gradient} hover:scale-105 hover:shadow-2xl shadow-lg text-white`
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-6 h-6 mr-2" />
                Concept Mastered!
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-2" />
                Mark as Complete & Add Brick
              </>
            )}
          </Button>
        </motion.div>

            {/* Completion Celebration */}
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 text-center"
              >
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mb-4"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: 2
                  }}
                >
                  <PartyPopper className="w-8 h-8 text-white" />
                </motion.div>
                <div className="text-lg text-green-400 font-bold">
                  Great work! You've added a brick to your knowledge wall.
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  Check the header to see your progress
                </div>
              </motion.div>
            )}

            {/* Selection tooltip */}
            <AnimatePresence>
              {selectedText && !isNotesPanelOpen && !isFlashcardsPanelOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="fixed bottom-8 right-8 z-40"
                >
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-75"></div>
                    <div className="relative bg-slate-900 border border-cyan-500/50 rounded-xl p-4 shadow-2xl max-w-md">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                          <StickyNote className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-white mb-1">
                            Text Selected
                          </div>
                          <div className="text-xs text-slate-400">
                            Open Notes panel to save this as a note
                          </div>
                        </div>
                        <Button
                          onClick={() => setSelectedText("")}
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 -mt-1 -mr-1 text-slate-400 hover:text-white hover:bg-white/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-slate-300 bg-white/5 p-3 rounded-lg border border-white/10 italic max-h-32 overflow-y-auto">
                        "{selectedText.length <= 200 ? selectedText : selectedText.substring(0, 200) + '...'}"
                      </div>
                      {selectedText.length > 200 && (
                        <div className="text-xs text-slate-500 mt-1">
                          Full text ({selectedText.length} chars) will be saved
                        </div>
                      )}
                      <Button
                        onClick={() => setIsNotesPanelOpen(true)}
                        className="w-full mt-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Notes
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <NotesPanel
        isOpen={isNotesPanelOpen}
        onClose={() => setIsNotesPanelOpen(false)}
        selectedText={selectedText}
        currentTopic={conceptData?.title || ""}
        onTextCleared={() => setSelectedText("")}
      />

      <FlashcardsPanel
        isOpen={isFlashcardsPanelOpen}
        onClose={() => setIsFlashcardsPanelOpen(false)}
      />
    </div>
  );
}
