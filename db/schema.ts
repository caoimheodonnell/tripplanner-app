import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const categoriesTable = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  colour: text('colour').notNull().default('#4A90D9'),
  icon: text('icon').notNull().default('🗺️'),
});

export const tripsTable = sqliteTable('trips', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  userId: integer('user_id').notNull(),
  destination: text('destination').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  coverColour: text('cover_colour').notNull().default('#4A90D9'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const activitiesTable = sqliteTable('activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tripId: integer('trip_id').notNull(),
  userId: integer('user_id').notNull(),
  categoryId: integer('category_id').notNull(),
  name: text('name').notNull(),
  date: text('date').notNull(),
  durationMinutes: integer('duration_minutes'),
  count: integer('count').default(1),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const targetsTable = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  label: text('label').notNull(),
  period: text('period').notNull(),
  userId: integer('user_id').notNull(),
  targetValue: real('target_value').notNull(),
  unit: text('unit').notNull(),
  categoryId: integer('category_id'),
  createdAt: text('created_at').notNull(),
});

export const usersTable = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  sessionToken: text('session_token'), 
  createdAt: text('created_at').notNull(),
});