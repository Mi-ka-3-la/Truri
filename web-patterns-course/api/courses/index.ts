import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../db/index';
import { courses } from '../../db/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const list = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      language: courses.language,
      description: courses.description,
      structureType: courses.structureType,
      theme: courses.theme,
    })
    .from(courses)
    .orderBy(courses.createdAt);

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  return res.status(200).json(list);
}
