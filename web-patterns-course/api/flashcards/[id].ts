import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq } from 'drizzle-orm';
import { db } from '../../db/index';
import { flashcards } from '../../db/schema';
import { withAuth } from '../../lib/withAuth';

export default withAuth(async (req, res, userId) => {
  const cardId = req.query.id as string;

  // PATCH /api/flashcards/:id
  if (req.method === 'PATCH') {
    const { front, back } = req.body as { front?: string; back?: string };
    if (!front && !back) {
      return res.status(400).json({ error: 'front or back is required' });
    }
    const [updated] = await db
      .update(flashcards)
      .set({ ...(front && { front }), ...(back && { back }) })
      .where(and(eq(flashcards.id, cardId), eq(flashcards.userId, userId)))
      .returning();

    if (!updated) return res.status(404).json({ error: 'Flashcard not found' });
    return res.status(200).json({ flashcard: updated });
  }

  // DELETE /api/flashcards/:id
  if (req.method === 'DELETE') {
    const [deleted] = await db
      .delete(flashcards)
      .where(and(eq(flashcards.id, cardId), eq(flashcards.userId, userId)))
      .returning();

    if (!deleted) return res.status(404).json({ error: 'Flashcard not found' });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
