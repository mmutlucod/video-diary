import type { SQLiteDatabase } from "expo-sqlite";

import { resolveVideoUri } from "@/utils/file";

import { toVideo, type NewVideo, type Video, type VideoRow } from "./schema";

export const videoRepository = {
  async getAll(db: SQLiteDatabase): Promise<Video[]> {
    const rows = await db.getAllAsync<VideoRow>(
      "SELECT * FROM videos ORDER BY created_at DESC",
    );
    return rows.map(toVideo);
  },

  async getById(db: SQLiteDatabase, id: number): Promise<Video | null> {
    const row = await db.getFirstAsync<VideoRow>(
      "SELECT * FROM videos WHERE id = ?",
      id,
    );
    return row ? toVideo(row) : null;
  },

  async insert(db: SQLiteDatabase, input: NewVideo): Promise<Video> {
    const createdAt = Date.now();
    const result = await db.runAsync(
      "INSERT INTO videos (name, description, uri, duration, created_at) VALUES (?, ?, ?, ?, ?)",
      input.name,
      input.description,
      input.uri,
      input.duration,
      createdAt,
    );
    return {
      ...input,
      uri: resolveVideoUri(input.uri),
      id: result.lastInsertRowId,
      createdAt,
    };
  },
    async update(
    db: SQLiteDatabase,
    id: number,
    input: Pick<NewVideo, "name" | "description">,
  ): Promise<void> {
    await db.runAsync(
      "UPDATE videos SET name = ?, description = ? WHERE id = ?",
      input.name,
      input.description,
      id,
    );
  },

  async remove(db: SQLiteDatabase, id: number): Promise<void> {
    await db.runAsync("DELETE FROM videos WHERE id = ?", id);
  },
};