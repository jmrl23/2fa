import { authenticator, user } from '@/db/schema';
import { relations } from 'drizzle-orm';

export const userRelations = relations(user, ({ many }) => ({
  authenticators: many(authenticator),
}));
