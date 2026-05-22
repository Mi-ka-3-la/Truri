import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '../../db/index';
import { flashcards } from '../../db/schema';
import { withAuth } from '../../lib/withAuth';

export default withAuth(async (req, res, userId) => {
  // GET /api/flashcards?conceptId=xxx
  if (req.method === 'GET') {
    const conceptId = req.query.conceptId as string | undefined;
    const rows = await db
      .select()
      .from(flashcards)
      .where(
        conceptId
          ? and(eq(flashcards.userId, userId), eq(flashcards.conceptId, conceptId))
          : eq(flashcards.userId, userId),
      )
      .orderBy(asc(flashcards.createdAt));
    return res.status(200).json({ flashcards: rows });
  }

  // POST /api/flashcards
  if (req.method === 'POST') {
    const { conceptId, front, back } = req.body as {
      conceptId: string;
      front: string;
      back: string;
    };
    if (!conceptId || !front || !back) {
      return res.status(400).json({ error: 'conceptId, front and back are required' });
    }
    const [card] = await db
      .insert(flashcards)
      .values({ userId, conceptId, front, back })
      .returning();
    return res.status(201).json({ flashcard: card });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
