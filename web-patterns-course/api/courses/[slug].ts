import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../db/index';
import { courses, concepts, conceptConnections } from '../../db/schema';
import { eq, inArray } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { slug } = req.query;
  if (typeof slug !== 'string') return res.status(400).json({ error: 'Invalid slug' });

  const [course] = await db.select().from(courses).where(eq(courses.slug, slug));
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const conceptList = await db
    .select()
    .from(concepts)
    .where(eq(concepts.courseId, course.id))
    .orderBy(concepts.sortOrder);

  const conceptIds = conceptList.map((c) => c.id);

  const connections =
    conceptIds.length === 0
      ? []
      : await db
          .select()
          .from(conceptConnections)
          .where(inArray(conceptConnections.fromConceptId, conceptIds));

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  return res.status(200).json({
    course,
    concepts: conceptList,
    connections,
  });
}
