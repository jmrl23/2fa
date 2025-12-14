import z from 'zod';

export const createAuthenticator = z.object({
  name: z.string().min(1).max(32),
  description: z.string().max(256).optional(),
  tags: z.string().array().max(10).optional(),
  secret: z.string().min(1),
});

export const listAuthenticators = z.object({
  take: z.coerce.number().min(1).optional(),
  skip: z.coerce.number().min(0).optional(),
});

export const updateAuthenticatorSelector = z.object({
  id: z.uuid(),
});

export const updateAuthenticatorBody = z.object({
  name: z.string().min(1).max(32).optional(),
  description: z.string().max(256).optional(),
  tags: z.string().array().max(10).optional(),
});

export const deleteAuthenticator = z.object({
  id: z.uuid(),
});
