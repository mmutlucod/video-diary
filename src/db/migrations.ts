import type { SQLiteDatabase } from "expo-sqlite";


const MIGRATIONS: readonly string[] = [
  `
  CREATE TABLE videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    uri TEXT NOT NULL,
    duration REAL NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX idx_videos_created_at ON videos (created_at DESC);
  `,
];

export async function migrateDb(db: SQLiteDatabase): Promise<void> {
  await db.execAsync("PRAGMA journal_mode = WAL;");

  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const currentVersion = row?.user_version ?? 0;

  for (let v = currentVersion; v < MIGRATIONS.length; v++) {
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(MIGRATIONS[v]);
      await txn.execAsync(`PRAGMA user_version = ${v + 1}`);
    });
  }
}