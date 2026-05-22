import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '../../db/index';
import { notes } from '../../db/schema';
import { withAuth } from '../../lib/withAuth';

export default withAuth(async (req, res, userId) => {
  // GET /api/notes?conceptId=xxx
  if (req.method === 'GET') {
    const conceptId = req.query.conceptId as string | undefined;
    const rows = await db
      .select()
      .from(notes)
      .where(
        conceptId
          ? and(eq(notes.userId, userId), eq(notes.conceptId, conceptId))
          : eq(notes.userId, userId),
      )
      .orderBy(asc(notes.createdAt));
    return res.status(200).json({ notes: rows });
  }

  // POST /api/notes
  if (req.method === 'POST') {
    const { conceptId, content } = req.body as { conceptId: string; content: string };
    if (!conceptId || !content) {
      return res.status(400).json({ error: 'conceptId and content are required' });
    }
    const [note] = await db
      .insert(notes)
      .values({ userId, conceptId, content })
      .returning();
    return res.status(201).json({ note });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
