import { db } from './client';
import {
  activitiesTable,
  categoriesTable,
  targetsTable,
  tripsTable,
  usersTable,
} from './schema';

export async function seedIfEmpty() {
 
// check if categories already exist
const existingCats = await db.select().from(categoriesTable);
if (existingCats.length > 0) return;


  

  // add default categories
  const categories = await db
    .insert(categoriesTable)
    .values([
      { name: 'Sightseeing', colour: '#3B82F6', icon: 'map-outline' },
      { name: 'Food', colour: '#F59E0B', icon: 'restaurant-outline' },
      { name: 'Relax', colour: '#10B981', icon: 'sunny-outline' },
    ])
    .returning();

 // create test user
  await db.insert(usersTable).values({
    name: 'Test User',
    email: 'test@test.com',
    password: '1234',
    createdAt: new Date().toISOString(),
  });

  const [user] = await db.select().from(usersTable);

 // create sample trip
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

  // add example activities
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