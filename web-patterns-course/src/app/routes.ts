import { createBrowserRouter } from 'react-router';
import { CoursesHome } from '@/app/components/CoursesHome';
import { CourseShell } from '@/app/components/CourseShell';
import { CourseOverview } from '@/app/components/pages/CourseOverview';
import { ConceptView } from '@/app/components/pages/ConceptView';
import { NotFound } from '@/app/components/pages/NotFound';

export const router = createBrowserRouter([
  { index: true, Component: CoursesHome },
  {
    path: 'courses/:slug',
    Component: CourseShell,
    children: [
      { index: true, Component: CourseOverview },
      { path: 'learn', Component: ConceptView },
    ],
  },
  { path: '*', Component: NotFound },
]);
