import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { MetadataForm } from "@/components/metadata-form";
import { useUpdateVideo } from "@/hooks/use-update-video";
import { useVideo } from "@/hooks/use-videos";

export default function EditVideoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const videoId = Number(id);

  const { data: video, isPending } = useVideo(videoId);
  const { mutate, isPending: isSaving, isError } = useUpdateVideo();

  if (isPending) {
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
    <MetadataForm
      initialValues={{ name: video.name, description: video.description }}
      submitLabel="Kaydet"
      pendingLabel="Kaydediliyor…"
      isPending={isSaving}
      errorMessage={isError ? "Değişiklikler kaydedilemedi. Tekrar dene." : null}
      onSubmit={(values) =>
        mutate({ id: videoId, ...values }, { onSuccess: () => router.back() })
      }
    />
  );
}