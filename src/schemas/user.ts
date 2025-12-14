import z from 'zod';

export const signInUser = z.object({
  username: z.string().min(5).max(32),
  password: z.string().min(8).max(128),
  recaptchaToken: z.string().optional(),
});

export const signUpUser = z.object({
  username: z.string().min(5).max(32),
  password: z.string().min(8).max(128),
  recaptchaToken: z.string().optional(),
});

export const changePasswordUser = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});
