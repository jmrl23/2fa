import { sql } from 'drizzle-orm';
import { date, pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: date('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`NOW()`),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
});

export const authenticator = pgTable('authenticator', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: date('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`NOW()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id),
  name: text('name').notNull(),
  description: text('description'),
  tags: text().array().default([]),
  secret: text('secret').notNull(),
});
