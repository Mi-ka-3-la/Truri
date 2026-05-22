import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index';
import { users } from '../../db/schema';
import { withAuth } from '../../lib/withAuth';

export default withAuth(async (_req, res, userId) => {
  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.status(200).json({ user });
});
