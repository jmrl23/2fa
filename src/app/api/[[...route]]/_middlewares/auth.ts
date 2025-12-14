import { createMiddleware } from 'hono/factory';
import jwt from 'jsonwebtoken';

export const auth = createMiddleware(async (ctx, next) => {
  const [scheme, token] = ctx.req.header('Authorization')?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    ctx.status(401);
    return ctx.json({
      error: 'Unauthorized',
    });
  }

  try {
    const secret = process.env.JWT_SECRET!;
    const payload = jwt.verify(token, secret) as { id: string };
    ctx.set('userId', payload.id);
    return next();
  } catch {
    ctx.status(401);
    return ctx.json({
      error: 'Unauthorized',
    });
  }
});
