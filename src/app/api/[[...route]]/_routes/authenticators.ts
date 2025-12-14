import { auth } from '@/app/api/[[...route]]/_middlewares/auth';
import { validator } from '@/app/api/[[...route]]/_middlewares/validator';
import { authenticator } from '@/db/schema';
import { db } from '@/lib/db';
import {
  createAuthenticator,
  deleteAuthenticator,
  listAuthenticators,
  updateAuthenticatorBody,
  updateAuthenticatorSelector,
} from '@/schemas/authenticator';
import { and, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import z from 'zod';

export const app = new Hono<{
  Variables: {
    userId: string;
  };
}>();

app.post('/', auth, validator('json', createAuthenticator), async (ctx) => {
  const { name, description, tags, secret } = await ctx.req.json<
    z.infer<typeof createAuthenticator>
  >();
  const [createdAuthenticaticator] = await db
    .insert(authenticator)
    .values({
      name,
      description,
      tags,
      secret,
      userId: ctx.get('userId'),
    })
    .returning({
      id: authenticator.id,
      name: authenticator.name,
      createdAt: authenticator.createdAt,
      updatedAt: authenticator.updatedAt,
      description: authenticator.description,
      tags: authenticator.tags,
      secret: authenticator.secret,
    });

  ctx.status(201);
  return ctx.json({
    data: createdAuthenticaticator,
  });
});

app.get('/', auth, validator('query', listAuthenticators), async (ctx) => {
  const query: z.infer<typeof listAuthenticators> = ctx.req.query();
  const authenticators = await db
    .select({
      id: authenticator.id,
      name: authenticator.name,
      createdAt: authenticator.createdAt,
      updatedAt: authenticator.updatedAt,
      description: authenticator.description,
      tags: authenticator.tags,
      secret: authenticator.secret,
    })
    .from(authenticator)
    .where(eq(authenticator.userId, ctx.get('userId')))
    .orderBy(desc(authenticator.createdAt))
    .offset(query.skip ?? 0)
    .limit(query.take ?? 100);

  return ctx.json({
    data: authenticators,
  });
});

app.patch(
  '/:id',
  auth,
  validator('param', updateAuthenticatorSelector),
  validator('json', updateAuthenticatorBody),
  async (ctx) => {
    const id = ctx.req.param('id');
    const { name, description, tags } = await ctx.req.json<
      z.infer<typeof updateAuthenticatorBody>
    >();

    const [updatedAuthenticator] = await db
      .update(authenticator)
      .set({
        name,
        description,
        tags,
      })
      .where(
        and(
          eq(authenticator.userId, ctx.get('userId')),
          eq(authenticator.id, id),
        ),
      )
      .returning({
        id: authenticator.id,
        name: authenticator.name,
        createdAt: authenticator.createdAt,
        updatedAt: authenticator.updatedAt,
        description: authenticator.description,
        tags: authenticator.tags,
        secret: authenticator.secret,
      });

    return ctx.json({
      data: updatedAuthenticator,
    });
  },
);

app.delete(
  '/:id',
  auth,
  validator('param', deleteAuthenticator),
  async (ctx) => {
    const id = ctx.req.param('id');
    const [removedAuthenticator] = await db
      .delete(authenticator)
      .where(eq(authenticator.id, id))
      .returning({
        id: authenticator.id,
        name: authenticator.name,
        createdAt: authenticator.createdAt,
        updatedAt: authenticator.updatedAt,
        description: authenticator.description,
        tags: authenticator.tags,
        secret: authenticator.secret,
      });

    return ctx.json({
      data: removedAuthenticator,
    });
  },
);
