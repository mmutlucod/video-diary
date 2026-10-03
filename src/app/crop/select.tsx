import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { CLIP_DURATION_SECONDS } from "@/constants/app";
import { useBottomPadding } from "@/hooks/use-bottom-padding";
import { useCropStore } from "@/store/crop-store";
import { formatDuration } from "@/utils/time";
export default function SelectScreen() {
  const router = useRouter();
  const bottomPadding = useBottomPadding();
  const sourceUri = useCropStore((s) => s.sourceUri);
  const sourceDuration = useCropStore((s) => s.sourceDuration);
  const setSource = useCropStore((s) => s.setSource);

  const [isPicking, setIsPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickVideo = async () => {
    setError(null);
    setIsPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        allowsEditing: false,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      const seconds = (asset.duration ?? 0) / 1000;

      if (seconds <= 0) {
        setError("Video süresi okunamadı. Başka bir video dene.");
        return;
      }
      if (seconds < CLIP_DURATION_SECONDS) {
        setError(
          `Video en az ${CLIP_DURATION_SECONDS} saniye olmalı (seçilen: ${formatDuration(seconds)}).`,
        );
        return;
      }
      setSource(asset.uri, seconds);
    } catch {
      setError("Galeri açılamadı. İzinleri kontrol edip tekrar dene.");
    } finally {
      setIsPicking(false);
    }
  };

  const hasSource = Boolean(sourceUri);

  return (
    <View
      className="flex-1 bg-white px-5 pt-6"
      style={{ paddingBottom: bottomPadding }}
      >
      <Pressable
        onPress={pickVideo}
        disabled={isPicking}
        accessibilityRole="button"
        className="items-center justify-center rounded-3xl border-2 border-dashed border-indigo-300 bg-indigo-50 py-16 active:bg-indigo-100"
      >
        {isPicking ? (
          <ActivityIndicator />
        ) : (
          <>
            <Text className="text-4xl">🎬</Text>
            <Text className="mt-3 text-base font-semibold text-indigo-700">
              {hasSource ? "Başka bir video seç" : "Galeriden video seç"}
            </Text>
          </>
        )}
      </Pressable>

      {hasSource ? (
        <Text className="mt-4 text-center text-sm text-gray-600">
          Video seçildi · süre {formatDuration(sourceDuration)}
        </Text>
      ) : null}

      {error ? (
        <Text className="mt-4 text-center text-sm text-red-600">{error}</Text>
      ) : null}

      <View className="flex-1" />

      <Pressable
        onPress={() => router.push("/crop/trim")}
        disabled={!hasSource}
        accessibilityRole="button"
        className={`items-center rounded-full py-4 ${
          hasSource ? "bg-indigo-600 active:bg-indigo-700" : "bg-gray-300"
        }`}
      >
        <Text className="text-base font-semibold text-white">Devam</Text>
      </Pressable>
    </View>
  );
}