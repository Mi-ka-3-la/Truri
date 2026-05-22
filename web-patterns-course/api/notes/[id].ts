import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq } from 'drizzle-orm';
import { db } from '../../db/index';
import { notes } from '../../db/schema';
import { withAuth } from '../../lib/withAuth';

export default withAuth(async (req, res, userId) => {
  const noteId = req.query.id as string;

  // PATCH /api/notes/:id
  if (req.method === 'PATCH') {
    const { content } = req.body as { content: string };
    if (!content) return res.status(400).json({ error: 'content is required' });

    const [updated] = await db
      .update(notes)
      .set({ content, updatedAt: new Date() })
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .returning();

    if (!updated) return res.status(404).json({ error: 'Note not found' });
    return res.status(200).json({ note: updated });
  }

  // DELETE /api/notes/:id
  if (req.method === 'DELETE') {
    const [deleted] = await db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .returning();

    if (!deleted) return res.status(404).json({ error: 'Note not found' });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
