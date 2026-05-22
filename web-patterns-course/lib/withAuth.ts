import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, extractToken } from './auth';

type AuthedHandler = (
  req: VercelRequest,
  res: VercelResponse,
  userId: string,
) => Promise<void | VercelResponse>;

export function withAuth(handler: AuthedHandler) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const token = extractToken(req.headers.authorization);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const payload = await verifyToken(token);
    if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });

    return handler(req, res, payload.userId);
  };
}
