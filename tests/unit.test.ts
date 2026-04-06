// tests/unit.test.ts
jest.mock('@/db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    run: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/db/schema', () => ({
  usersTable:      'usersTable',
  categoriesTable: 'categoriesTable',
  tripsTable:      'tripsTable',
  activitiesTable: 'activitiesTable',
  targetsTable:    'targetsTable',
}));

import { db } from '@/db/client';
import { seedIfEmpty } from '@/db/seed';

const MOCK_TRIPS = [
  { id: 1, name: 'Paris Trip', destination: 'Paris', startDate: '2026-06-12', endDate: '2026-06-18', coverColour: '#4A90D9', notes: '', createdAt: '2026-01-01T00:00:00.000Z' },
];

function setupMockDb() {
  let selectCallCount = 0;

  (db.select as jest.Mock).mockImplementation(() => ({
    from: jest.fn().mockImplementation(() => {
      selectCallCount++;
      if (selectCallCount === 1) return Promise.resolve([]);          // trips check → empty, proceed
      if (selectCallCount === 2) return Promise.resolve([{ id: 1 }]); // fetch user after insert
      if (selectCallCount === 3) return Promise.resolve([{ id: 1 }]); // fetch trip after insert
      return Promise.resolve([{ id: 1 }]);
    }),
  }));

  (db.insert as jest.Mock).mockReturnValue({
    values: jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]),
    }),
  });
}

describe('seedIfEmpty – unit tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    setupMockDb();
  });

  test('inserts into the categories table on first run', async () => {
    await seedIfEmpty();
    expect(db.insert).toHaveBeenCalledWith('categoriesTable');
  });

  test('inserts into the users table on first run', async () => {
    await seedIfEmpty();
    expect(db.insert).toHaveBeenCalledWith('usersTable');
  });

  test('inserts into the trips table on first run', async () => {
    await seedIfEmpty();
    expect(db.insert).toHaveBeenCalledWith('tripsTable');
  });

  test('inserts into the activities table on first run', async () => {
    await seedIfEmpty();
    expect(db.insert).toHaveBeenCalledWith('activitiesTable');
  });

  test('inserts into the targets table on first run', async () => {
    await seedIfEmpty();
    expect(db.insert).toHaveBeenCalledWith('targetsTable');
  });

  test('does not insert anything if trips already exist', async () => {
    (db.select as jest.Mock).mockImplementation(() => ({
      from: jest.fn().mockResolvedValue(MOCK_TRIPS),
    }));

    await seedIfEmpty();

    expect(db.insert).not.toHaveBeenCalled();
  });
});