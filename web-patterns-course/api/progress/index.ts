import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq } from 'drizzle-orm';
import { db } from '../../db/index';
import { progress } from '../../db/schema';
import { withAuth } from '../../lib/withAuth';

export default withAuth(async (req, res, userId) => {
  // GET /api/progress — return all completed concept IDs for the user
  if (req.method === 'GET') {
    const rows = await db
      .select({ conceptId: progress.conceptId })
      .from(progress)
      .where(eq(progress.userId, userId));
    return res.status(200).json({ completed: rows.map((r) => r.conceptId) });
  }

  // POST /api/progress — mark a concept as complete
  if (req.method === 'POST') {
    const { conceptId } = req.body as { conceptId: string };
    if (!conceptId) return res.status(400).json({ error: 'conceptId is required' });

    await db.insert(progress).values({ userId, conceptId }).onConflictDoNothing();
    return res.status(200).json({ ok: true });
  }

  // DELETE /api/progress?conceptId=xxx — unmark one concept
  // DELETE /api/progress                — reset all (restart course)
  if (req.method === 'DELETE') {
    const conceptId = req.query.conceptId as string | undefined;

    if (conceptId) {
      await db
        .delete(progress)
        .where(and(eq(progress.userId, userId), eq(progress.conceptId, conceptId)));
    } else {
      await db.delete(progress).where(eq(progress.userId, userId));
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
