import { user } from '@/db/schema';
import { db } from '@/lib/db';
import { changePasswordUser, signInUser, signUpUser } from '@/schemas/user';
import { zValidator as validator } from '@hono/zod-validator';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import jwt from 'jsonwebtoken';
import z from 'zod';
import { auth } from '../_middlewares/auth';

export const app = new Hono<{
  Variables: {
    userId: string;
  };
}>();

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;

async function verifyRecaptcha(token: string) {
  const response = await fetch(
    'https://www.google.com/recaptcha/api/siteverify',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${RECAPTCHA_SECRET}&response=${token}`,
    },
  );
  const data = await response.json();
  return data.success;
}

app.post(
  '/change-password',
  auth,
  validator('json', changePasswordUser),
  async (ctx) => {
    const { currentPassword, newPassword } = await ctx.req.json<
      z.infer<typeof changePasswordUser>
    >();
    const userId = ctx.get('userId');

    const existing = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: {
        id: true,
        password: true,
      },
    });

    if (!existing) {
      ctx.status(404);
      return ctx.json({
        error: 'User not found',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      existing.password,
    );

    if (!isPasswordValid) {
      ctx.status(401);
      return ctx.json({
        error: 'Invalid current password',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(user)
      .set({
        password: hashedPassword,
      })
      .where(eq(user.id, userId));

    ctx.status(200);
    return ctx.json({
      data: 'Password updated successfully',
    });
  },
);

app.post('/', validator('json', signUpUser), async (ctx) => {
  const { username, password, recaptchaToken } = await ctx.req.json<
    z.infer<typeof signUpUser>
  >();

  if (!recaptchaToken) {
    ctx.status(400);
    return ctx.json({ error: 'Recaptcha token is required' });
  }

  const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
  if (!isRecaptchaValid) {
    ctx.status(400);
    return ctx.json({ error: 'Invalid recaptcha' });
  }

  const existing = await db.query.user.findFirst({
    where: eq(user.username, username),
    columns: { id: true },
  });

  if (existing) {
    ctx.status(401);
    return ctx.json({
      error: 'Username already taken',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [createdUser] = await db
    .insert(user)
    .values({
      username,
      password: hashedPassword,
    })
    .returning({
      username: user.username,
    });

  ctx.status(201);
  return ctx.json({
    data: {
      user: createdUser,
    },
  });
});

app.post(
  '/sign-in',
  validator('json', signInUser),

  async (ctx) => {
    const { username, password, recaptchaToken } = await ctx.req.json<
      z.infer<typeof signInUser>
    >();

    if (!recaptchaToken) {
      ctx.status(400);
      return ctx.json({ error: 'Recaptcha token is required' });
    }

    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      ctx.status(400);
      return ctx.json({ error: 'Invalid recaptcha' });
    }

    const existing = await db.query.user.findFirst({
      where: eq(user.username, username),
      columns: {
        id: true,
        password: true,
      },
    });

    if (!existing) {
      ctx.status(401);
      return ctx.json({
        error: 'User not found',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, existing.password);
    if (!isPasswordValid) {
      ctx.status(401);
      return ctx.json({
        error: 'Invalid password',
      });
    }

    const token = jwt.sign({ id: existing.id }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });
    ctx.status(200);
    return ctx.json({
      data: token,
    });
  },
);
