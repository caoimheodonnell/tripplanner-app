import { sql } from 'drizzle-orm';
import { db } from './client';
import {
  activitiesTable,
  categoriesTable,
  targetsTable,
  tripsTable,
  usersTable,
} from './schema';

export async function seedIfEmpty() {
  
const existingCats = await db.select().from(categoriesTable);
if (existingCats.length > 0) return;

  
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      colour TEXT NOT NULL,
      icon TEXT NOT NULL
    );
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      destination TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      cover_colour TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      duration_minutes INTEGER,
      count INTEGER DEFAULT 1,
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      period TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      target_value REAL NOT NULL,
      unit TEXT NOT NULL,
      category_id INTEGER,
      created_at TEXT NOT NULL
    );
  `);

  
  const categories = await db
    .insert(categoriesTable)
    .values([
      { name: 'Sightseeing', colour: '#3B82F6', icon: 'map-outline' },
      { name: 'Food', colour: '#F59E0B', icon: 'restaurant-outline' },
      { name: 'Relax', colour: '#10B981', icon: 'sunny-outline' },
    ])
    .returning();

 
  await db.insert(usersTable).values({
    name: 'Test User',
    email: 'test@test.com',
    password: '1234',
    createdAt: new Date().toISOString(),
  });

  const [user] = await db.select().from(usersTable);

 
  await db.insert(tripsTable).values({
    name: 'Paris Trip',
    userId: user.id,
    destination: 'Paris',
    startDate: '2026-06-12',
    endDate: '2026-06-18',
    coverColour: '#4A90D9',
    createdAt: new Date().toISOString(),
  });

  const [trip] = await db.select().from(tripsTable);

  
  await db.insert(activitiesTable).values([
    {
      tripId: trip.id,
      categoryId: categories[0].id,
      name: 'Eiffel Tower',
      userId: user.id,
      date: '2026-06-12',
      durationMinutes: 120,
      createdAt: new Date().toISOString(),
    },
    {
      tripId: trip.id,
      categoryId: categories[1].id,
      name: 'Dinner in Montmartre',
      userId: user.id,
      date: '2026-06-12',
      durationMinutes: 90,
      createdAt: new Date().toISOString(),
    },
    {
      tripId: trip.id,
      categoryId: categories[2].id,
      name: 'Park walk',
      userId: user.id,
      date: '2026-06-13',
      durationMinutes: 60,
      createdAt: new Date().toISOString(),
    },
  ]);

  
  await db.insert(targetsTable).values([
    {
    label: 'Visit 3 sightseeing places',
    period: 'weekly',               
    targetValue: 3,
    userId: user.id,
    unit: 'activities',               
    categoryId: categories[0].id,     
    createdAt: new Date().toISOString(),
  },
  ]);
}