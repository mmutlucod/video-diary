import { useRouter } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { VideoCard } from "@/components/video-card";
import type { Video } from "@/db/schema";
import { useVideos } from "@/hooks/use-videos";

const keyExtractor = (item: Video) => String(item.id);
const ItemSeparator = () => <View className="h-3" />;

export default function HomeScreen() {
  const router = useRouter();
  const { data, isPending, isError, refetch } = useVideos();

  const handlePress = useCallback(
    (id: number) =>
      router.push({ pathname: "/video/[id]", params: { id: String(id) } }),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Video }) => (
      <VideoCard video={item} onPress={handlePress} />
    ),
    [handlePress],
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-5 pb-3 pt-2">
        <Text className="text-3xl font-bold text-gray-900">Video Diary</Text>
        <Text className="mt-1 text-sm text-gray-500">
          {data?.length ? `${data.length} kayıt` : "5 saniyelik anılarını biriktir"}
        </Text>
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
        <FlatList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerClassName="px-5 pb-28 grow"
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8">
              <Text className="text-lg font-semibold text-gray-800">
                Henüz video yok
              </Text>
              <Text className="mt-1 text-center text-sm text-gray-500">
                Sağ alttaki + butonuyla bir video seç ve 5 saniyelik bir bölümünü kaydet.
              </Text>
            </View>
          }
        />
      )}

      <Pressable
        onPress={() => router.push("/crop/select")}
        accessibilityRole="button"
        accessibilityLabel="Yeni video ekle"
        className="absolute bottom-8 right-6 h-16 w-16 items-center justify-center rounded-full bg-indigo-600 shadow-lg active:bg-indigo-700"
      >
        <Text className="text-3xl font-light text-white">+</Text>
      </Pressable>
    </SafeAreaView>
  );
}