import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";

import { videoRepository } from "@/db/video-repository";
import type { VideoFormValues } from "@/schemas/video-schema";

import { videoKeys } from "./use-videos";

type UpdateVideoInput = VideoFormValues & { id: number };

export function useUpdateVideo() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name, description }: UpdateVideoInput) =>
      videoRepository.update(db, id, { name, description }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: videoKeys.all }),
  });
}