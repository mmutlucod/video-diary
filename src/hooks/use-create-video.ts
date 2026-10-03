import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { trimVideo } from "expo-trim-video";

import { CLIP_DURATION_SECONDS } from "@/constants/app";
import { videoRepository } from "@/db/video-repository";
import { deleteFileIfExists, persistVideoFile, resolveVideoUri } from "@/utils/file";

import { videoKeys } from "./use-videos";

type CreateVideoInput = {
  sourceUri: string;
  sourceDuration: number;
  startTime: number;
  name: string;
  description: string;
};

const floor2 = (n: number) => Math.floor(n * 100) / 100;

export function useCreateVideo() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateVideoInput) => {
      const maxStart = Math.max(floor2(input.sourceDuration - CLIP_DURATION_SECONDS), 0);
      const start = Math.min(floor2(input.startTime), maxStart);

      const trimmed = await trimVideo({
        uri: input.sourceUri,
        start,
        end: start + CLIP_DURATION_SECONDS,
      });

      const relativePath = persistVideoFile(trimmed.uri);

      try {
        return await videoRepository.insert(db, {
          name: input.name,
          description: input.description,
          uri: relativePath,
          duration: CLIP_DURATION_SECONDS,
        });
      } catch (error) {
        deleteFileIfExists(resolveVideoUri(relativePath));
        throw error;
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: videoKeys.all }),
  });
}