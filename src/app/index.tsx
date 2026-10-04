import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Fab } from "@/components/fab";
import { VideoCard } from "@/components/video-card";
import type { Video } from "@/db/schema";
import { useVideoCount, useVideos } from "@/hooks/use-videos";

const ANIMATED_ITEMS = 8;

const keyExtractor = (item: Video) => String(item.id);
const ItemSeparator = () => <View className="h-3" />;

export default function HomeScreen() {
  const router = useRouter();
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useVideos();
  const { data: count } = useVideoCount();

  const [layoutHeight, setLayoutHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const handlePress = useCallback(
    (id: number) =>
      router.push({ pathname: "/video/[id]", params: { id: String(id) } }),
    [router],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  useEffect(() => {
    if (layoutHeight > 0 && contentHeight > 0 && contentHeight < layoutHeight) {
      handleEndReached();
    }
  }, [layoutHeight, contentHeight, handleEndReached]);

  const renderItem = useCallback(
    ({ item, index }: { item: Video; index: number }) => (
      <Animated.View
        entering={
          index < ANIMATED_ITEMS
            ? FadeInDown.delay(index * 50).duration(300)
            : undefined
        }
      >
        <VideoCard video={item} onPress={handlePress} />
      </Animated.View>
    ),
    [handlePress],
  );

  const isEmpty = !data?.length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="flex-row items-end justify-between px-5 pb-4 pt-3">
        <View className="flex-1 pr-3">
          <Text className="text-3xl font-bold text-gray-900">Video Diary</Text>
          <Text className="mt-1 text-sm text-gray-500">
            5 saniyelik anılarını biriktir
          </Text>
        </View>

        {count ? (
          <View className="rounded-full bg-indigo-100 px-3 py-1.5">
            <Text className="text-sm font-semibold text-indigo-700">
              {count} kayıt
            </Text>
          </View>
        ) : null}
      </View>

      {isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-base text-gray-700">
            Videolar yüklenemedi.
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-4 rounded-full bg-indigo-600 px-5 py-2.5"
          >
            <Text className="font-semibold text-white">Tekrar dene</Text>
          </Pressable>
        </View>
      ) : (
        <Animated.FlatList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={ItemSeparator}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          onLayout={(e) => setLayoutHeight(e.nativeEvent.layout.height)}
          onContentSizeChange={(_, h) => setContentHeight(h)}
          contentContainerClassName={isEmpty ? "px-5 pb-28 grow" : "px-5 pb-28"}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4">
                <ActivityIndicator />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <Animated.View
              entering={FadeIn.duration(400)}
              className="flex-1 items-center justify-center px-8"
            >
              <Text className="text-lg font-semibold text-gray-800">
                Henüz video yok
              </Text>
              <Text className="mt-1 text-center text-sm text-gray-500">
                Sağ alttaki + butonuyla bir video seç ve 5 saniyelik bir bölümünü kaydet.
              </Text>
            </Animated.View>
          }
        />
      )}

      <Fab label="Yeni video ekle" onPress={() => router.push("/crop/select")} />
    </SafeAreaView>
  );
}