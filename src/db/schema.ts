import { resolveVideoUri } from "@/utils/file";

export type Video = {
  id: number;
  name: string;
  description: string;
  uri: string;
  /** Saniye cinsinden klip süresi */
  duration: number;
  /** Unix epoch (ms) */
  createdAt: number;
};

/** `uri` alanı DB'ye yazılırken göreli yol ("videos/123.mp4") olmalı. */
export type NewVideo = Omit<Video, "id" | "createdAt">;

export type VideoRow = {
  id: number;
  name: string;
  description: string;
  uri: string;
  duration: number;
  created_at: number;
};

export const toVideo = (row: VideoRow): Video => ({
  id: row.id,
  name: row.name,
  description: row.description,
  uri: resolveVideoUri(row.uri),
  duration: row.duration,
  createdAt: row.created_at,
});