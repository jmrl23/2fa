import { zValidator } from '@hono/zod-validator';
import { ValidationTargets } from 'hono';
import { ZodType } from 'zod';

export const validator = function (
  target: keyof ValidationTargets,
  schema: ZodType,
) {
  return zValidator(target, schema, async (result, ctx) => {
    if (!result.success) {
      const issue = result.error.issues[0];
      const field = issue.path[0];
      const error = issue.message;
      ctx.status(400);
      return ctx.json({
        error: `[${field.toString()}]: ${error}`,
      });
    }
  });
};
