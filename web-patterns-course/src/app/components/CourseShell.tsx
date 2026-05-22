import { Outlet, useParams, useLocation, useNavigate } from 'react-router';
import { createContext, useContext, useState, useEffect } from 'react';
import { getCourse, type CourseData, type ConceptNode } from '@/lib/courses';
import { LearningHeader } from '@/app/components/LearningHeader';
import { ConceptNavFull } from '@/app/components/ConceptNav';
import { CompletionToast } from '@/app/components/CompletionToast';

export interface CourseCtx {
  course: CourseData;
  concepts: ConceptNode[];
  currentConceptId: string | null;
  setCurrentConceptId: (id: string | null) => void;
  completedConcepts: Set<string>;
  markComplete: (id: string) => void;
  resetCourse: () => void;
}

const CourseContext = createContext<CourseCtx | null>(null);

export function useCourseCtx(): CourseCtx {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourseCtx must be used inside CourseShell');
  return ctx;
}

export function CourseShell() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const course = getCourse(slug!);

  const [currentConceptId, setCurrentConceptId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [lastCompleted, setLastCompleted] = useState<{ name: string; number: number } | null>(null);
  const [completedConcepts, setCompletedConcepts] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`completed_${slug}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(`completed_${slug}`, JSON.stringify([...completedConcepts]));
  }, [completedConcepts, slug]);

  if (!course) {
    navigate('/');
    return null;
  }

  const markComplete = (id: string) => {
    if (completedConcepts.has(id)) return;
    setCompletedConcepts((prev) => new Set([...prev, id]));
    const concept = course.concepts.find((c) => c.id === id);
    if (concept) {
      setLastCompleted({ name: concept.label, number: completedConcepts.size + 1 });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const resetCourse = () => {
    setCompletedConcepts(new Set());
    setCurrentConceptId(null);
    localStorage.removeItem(`completed_${slug}`);
  };

  const isLearnPage = location.pathname.endsWith('/learn');

  return (
    <CourseContext.Provider
      value={{
        course,
        concepts: course.concepts,
        currentConceptId,
        setCurrentConceptId,
        completedConcepts,
        markComplete,
        resetCourse,
      }}
    >
      <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        {isLearnPage && (
          <LearningHeader
            courseTitle={course.title}
            completedCount={completedConcepts.size}
            totalCount={course.concepts.length}
            onResetCourse={resetCourse}
          />
        )}
        <div className="flex flex-1 overflow-hidden">
          {isLearnPage && (
            <ConceptNavFull
              concepts={course.concepts}
              courseTitle={course.title}
              currentConceptId={currentConceptId}
              completedConcepts={completedConcepts}
              onConceptSelect={setCurrentConceptId}
            />
          )}
          <main className="flex-1 overflow-auto">
            <Outlet />
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
    </CourseContext.Provider>
  );
}
