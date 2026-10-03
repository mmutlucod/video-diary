import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";

import type { Video } from "@/db/schema";
import {
  videoRepository,
  type VideoCursor,
  type VideoPage,
} from "@/db/video-repository";
import { deleteFileIfExists } from "@/utils/file";

export const videoKeys = {
  all: ["videos"] as const,
  list: ["videos", "list"] as const,
  count: ["videos", "count"] as const,
  detail: (id: number) => ["videos", id] as const,
};

// Sabit referans: select sonucu gereksiz yere yeniden hesaplanmaz.
const flattenPages = (data: InfiniteData<VideoPage>): Video[] =>
  data.pages.flatMap((page) => page.items);

export function useVideos() {
  const db = useSQLiteContext();
  return useInfiniteQuery({
    queryKey: videoKeys.list,
    queryFn: ({ pageParam }) => videoRepository.getPage(db, pageParam),
    initialPageParam: null as VideoCursor | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: flattenPages,
  });
}

export function useVideoCount() {
  const db = useSQLiteContext();
  return useQuery({
    queryKey: videoKeys.count,
    queryFn: () => videoRepository.count(db),
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