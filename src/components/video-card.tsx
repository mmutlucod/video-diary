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
      className="flex-row items-center rounded-2xl border border-gray-200 bg-white p-3 active:bg-gray-50"
    >
      <View className="h-14 w-14 items-center justify-center rounded-xl bg-indigo-100">
        <Text className="text-xl text-indigo-600">▶</Text>
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
    </Pressable>
  );
}

export const VideoCard = memo(VideoCardBase);