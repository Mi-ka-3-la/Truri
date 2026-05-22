import { Outlet, useLocation } from "react-router";
import { LearningHeader } from "@/app/components/LearningHeader";
import { ConceptNav } from "@/app/components/ConceptNav";
import { CompletionToast } from "@/app/components/CompletionToast";
import { useState, useEffect } from "react";

const CONCEPTS = [
  { id: 'restapi', label: 'REST API' },
  { id: 'webhook', label: 'Webhook' },
  { id: 'polling', label: 'Polling' },
  { id: 'websocket', label: 'WebSocket' },
  { id: 'eventdriven', label: 'Event-Driven' },
  { id: 'messagequeue', label: 'Message Queue' },
  { id: 'retry', label: 'Retry Logic' },
  { id: 'circuitbreaker', label: 'Circuit Breaker' },
  { id: 'graphql', label: 'GraphQL' },
];

export function Root() {
  const location = useLocation();
  const isOverviewPage = location.pathname === '/';

  const [completedConcepts, setCompletedConcepts] = useState<Set<string>>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('completedConcepts');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [currentConcept, setCurrentConcept] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [lastCompleted, setLastCompleted] = useState<{ name: string; number: number } | null>(null);

  // Save to localStorage whenever completedConcepts changes
  useEffect(() => {
    localStorage.setItem('completedConcepts', JSON.stringify([...completedConcepts]));
  }, [completedConcepts]);

  const handleComplete = (conceptId: string) => {
    if (!completedConcepts.has(conceptId)) {
      setCompletedConcepts(prev => new Set([...prev, conceptId]));
      const concept = CONCEPTS.find(c => c.id === conceptId);
      if (concept) {
        setLastCompleted({
          name: concept.label,
          number: completedConcepts.size + 1
        });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    }
  };

  const handleResetCourse = () => {
    setCompletedConcepts(new Set());
    setCurrentConcept(null);
    localStorage.removeItem('completedConcepts');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Only show header when not on overview page */}
      {!isOverviewPage && (
        <LearningHeader
          completedCount={completedConcepts.size}
          totalCount={CONCEPTS.length}
          onResetCourse={handleResetCourse}
        />
      )}
      <div className="flex flex-1 overflow-hidden">
        {/* Only show sidebar when not on overview page */}
        {!isOverviewPage && (
          <ConceptNav
            currentConcept={currentConcept}
            completedConcepts={completedConcepts}
            onConceptSelect={setCurrentConcept}
          />
        )}
        <main className="flex-1 overflow-auto">
          <Outlet context={{
            onComplete: handleComplete,
            currentConcept,
            completedConcepts,
            onResetCourse: handleResetCourse,
            onConceptSelect: setCurrentConcept
          }} />
        </main>
      </div>
      {lastCompleted && (
        <CompletionToast
          show={showToast}
          conceptName={lastCompleted.name}
          brickNumber={lastCompleted.number}
        />
      )}
    </div>
  );
}
