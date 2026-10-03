import type { SQLiteDatabase } from "expo-sqlite";

import { PAGE_SIZE } from "@/constants/app";
import { resolveVideoUri } from "@/utils/file";

import { toVideo, type NewVideo, type Video, type VideoRow } from "./schema";

export type VideoCursor = { createdAt: number; id: number };

export type VideoPage = {
  items: Video[];
  nextCursor: VideoCursor | null;
};

export const videoRepository = {
  async getPage(
    db: SQLiteDatabase,
    cursor: VideoCursor | null,
    limit: number = PAGE_SIZE,
  ): Promise<VideoPage> {
    const rows = cursor
      ? await db.getAllAsync<VideoRow>(
          `SELECT * FROM videos
           WHERE (created_at, id) < (?, ?)
           ORDER BY created_at DESC, id DESC
           LIMIT ?`,
          cursor.createdAt,
          cursor.id,
          limit + 1,
        )
      : await db.getAllAsync<VideoRow>(
          `SELECT * FROM videos
           ORDER BY created_at DESC, id DESC
           LIMIT ?`,
          limit + 1,
        );

    const hasMore = rows.length > limit;
    const items = (hasMore ? rows.slice(0, limit) : rows).map(toVideo);
    const last = items[items.length - 1];

    return {
      items,
      nextCursor:
        hasMore && last ? { createdAt: last.createdAt, id: last.id } : null,
    };
  },

  async count(db: SQLiteDatabase): Promise<number> {
    const row = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) AS count FROM videos",
    );
    return row?.count ?? 0;
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