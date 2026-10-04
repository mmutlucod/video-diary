import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import type { Video } from "@/db/schema";
import { formatDate, formatDuration } from "@/utils/time";

type Props = {
  video: Video;
  onPress: (id: number) => void;
};

function VideoCardBase({ video, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(video.id)}
      accessibilityRole="button"
      accessibilityLabel={`${video.name}, ${formatDuration(video.duration)}`}
      className="flex-row items-center rounded-3xl border border-gray-100 bg-white p-3 shadow-sm active:opacity-80"
    >
      <View className="h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500">
        <Text className="text-3xl text-white">▶</Text>
      </View>

      <View className="ml-3 flex-1">
        <Text numberOfLines={1} className="text-base font-semibold text-gray-900">
          {video.name}
        </Text>
        {video.description ? (
          <Text numberOfLines={1} className="mt-0.5 text-sm text-gray-500">
            {video.description}
          </Text>
        ) : null}
        <Text className="mt-1 text-xs text-gray-400">
          {formatDate(video.createdAt)} · {formatDuration(video.duration)}
        </Text>
      </View>
      <Text className="ml-2 text-2xl text-gray-300">›</Text>
    </Pressable>
  );
}

export const VideoCard = memo(VideoCardBase);