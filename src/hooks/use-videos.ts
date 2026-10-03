import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";

import { videoRepository } from "@/db/video-repository";
import { deleteFileIfExists } from "@/utils/file";

export const videoKeys = {
  all: ["videos"] as const,
  detail: (id: number) => ["videos", id] as const,
};

export function useVideos() {
  const db = useSQLiteContext();
  return useQuery({
    queryKey: videoKeys.all,
    queryFn: () => videoRepository.getAll(db),
  });
}

export function useVideo(id: number) {
  const db = useSQLiteContext();
  return useQuery({
    queryKey: videoKeys.detail(id),
    queryFn: () => videoRepository.getById(db, id),
    enabled: Number.isFinite(id),
  });
}

export function useDeleteVideo() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const video = await videoRepository.getById(db, id);
      await videoRepository.remove(db, id);
      if (video) deleteFileIfExists(video.uri);
    },
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: videoKeys.detail(id) });
      return queryClient.invalidateQueries({ queryKey: videoKeys.all });
    },
  });
}