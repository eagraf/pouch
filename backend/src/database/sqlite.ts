import sqlite3 from 'sqlite3';

const DB_FILENAME = './database.sqlite';

export async function withDBConnection<T>(callback: (db: sqlite3.Database) => Promise<T>): Promise<T> {
  const db = new sqlite3.Database(DB_FILENAME);

  try {
    return await callback(db);
  } finally {
    db.close();
  }
}
