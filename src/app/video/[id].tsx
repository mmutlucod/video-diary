import { VideoPlayer } from "@/components/video-player";
import { useDeleteVideo, useVideo } from "@/hooks/use-videos";
import { formatDate, formatDuration } from "@/utils/time";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer } from "expo-video";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
export default function VideoDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const videoId = Number(id);

  const { data: video, isPending } = useVideo(videoId);
  const deleteMutation = useDeleteVideo();

  const player = useVideoPlayer(video?.uri ?? null, (p) => {
    p.loop = true;
  });

  const confirmDelete = () => {
    Alert.alert("Videoyu sil", "Bu video kalıcı olarak silinecek.", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: () =>
          deleteMutation.mutate(videoId, { onSuccess: () => router.back() }),
      },
    ]);
  };

  if (isPending || deleteMutation.isSuccess) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  if (!video) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-center text-base text-gray-700">
          Video bulunamadı.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 rounded-full bg-indigo-600 px-5 py-2.5"
        >
          <Text className="font-semibold text-white">Geri dön</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerBackButtonDisplayMode: "minimal",
          headerRight: () => (
            <View className="flex-row gap-5">
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/video/edit/[id]",
                    params: { id: String(videoId) },
                  })
                }
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Videoyu düzenle"
              >
                <Text className="text-base text-indigo-600">Düzenle</Text>
              </Pressable>
              <Pressable
                onPress={confirmDelete}
                disabled={deleteMutation.isPending}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Videoyu sil"
              >
                <Text className="text-base text-red-600">Sil</Text>
              </Pressable>
            </View>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-white" contentContainerClassName="pb-10">
        <View className="px-5 pt-4">
          <VideoPlayer player={player} nativeControls rounded />
        </View>

        <Animated.View entering={FadeInDown.duration(350)} className="px-5 pt-5">
          <Text className="text-2xl font-bold text-gray-900">{video.name}</Text>
          <Text className="mt-1 text-sm text-gray-400">
            {formatDate(video.createdAt)} · {formatDuration(video.duration)}
          </Text>

          <View className="mt-4 rounded-2xl bg-gray-50 p-4">
            {video.description ? (
              <Text className="text-base leading-6 text-gray-700">
                {video.description}
              </Text>
            ) : (
              <Text className="text-base italic text-gray-400">
                Açıklama yok
              </Text>
            )}
          </View>

          {deleteMutation.isError ? (
            <Text className="mt-4 text-sm text-red-600">
              Silinemedi, tekrar dene.
            </Text>
          ) : null}
        </Animated.View>
      </ScrollView>
    </>
  );
}