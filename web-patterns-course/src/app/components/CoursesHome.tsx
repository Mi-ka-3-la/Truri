import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowRight, BookOpen, CheckCircle, Lightning } from '@phosphor-icons/react';
import { COURSES } from '@/lib/courses';

export function CoursesHome() {
  const navigate = useNavigate();

  const getCompleted = (slug: string) => {
    try {
      const saved = localStorage.getItem(`completed_${slug}`);
      return saved ? (JSON.parse(saved) as string[]).length : 0;
    } catch {
      return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl px-8 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
          <Lightning className="w-5 h-5 text-white" weight="duotone" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">Scio</span>
        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest ml-1 mt-0.5">
          learn by concept
        </span>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-8 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14 text-center"
        >
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Cursurile tale
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Fiecare curs e o harta de concepte. Inveti in orice ordine, marchezi progresul, iei notite.
          </p>
        </motion.div>

        {/* Course cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COURSES.map((course, i) => {
            const completed = getCompleted(course.slug);
            const total = course.concepts.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            const firstGradient = course.concepts[0]?.gradient ?? 'from-slate-500 to-slate-600';

            return (
              <motion.div
                key={course.slug}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/courses/${course.slug}`)}
                className="group relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-7 cursor-pointer hover:border-white/25 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Subtle gradient glow on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${firstGradient} opacity-0 group-hover:opacity-5 transition-opacity`} />

                {/* Top row */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${firstGradient} flex items-center justify-center shadow-lg`}
                  >
                    <BookOpen className="w-6 h-6 text-white" weight="duotone" />
                  </div>
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-widest bg-slate-800/50 px-2 py-1 rounded-md">
                    {course.language === 'ro' ? 'Română' : 'English'}
                  </span>
                </div>

                {/* Title & description */}
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {course.title}
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  {course.description}
                </p>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500 font-mono">{total} concepte</span>
                    {completed > 0 && (
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-400" weight="duotone" />
                        {completed}/{total} completate
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${firstGradient} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 + 0.3, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* CTA row */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {course.concepts.slice(0, 4).map((c) => (
                      <span
                        key={c.id}
                        className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-full border border-white/10"
                      >
                        {c.label}
                      </span>
                    ))}
                    {course.concepts.length > 4 && (
                      <span className="text-xs text-slate-500 px-2 py-0.5">
                        +{course.concepts.length - 4} mai multe
                      </span>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
