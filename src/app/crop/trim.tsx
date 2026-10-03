import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback, useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";

import { Scrubber } from "@/components/scrubber";
import { CLIP_DURATION_SECONDS } from "@/constants/app";
import { useCropStore } from "@/store/crop-store";
import { formatDuration } from "@/utils/time";

/** Sürükleme sırasında seek + store güncellemesi arasındaki en kısa süre */
const SCRUB_THROTTLE_MS = 120;

function TimeLabel() {
  const startTime = useCropStore((s) => s.startTime);
  return (
    <Text className="mt-5 text-center text-lg font-semibold text-gray-900">
      {formatDuration(startTime)} –{" "}
      {formatDuration(startTime + CLIP_DURATION_SECONDS)}
    </Text>
  );
}

export default function TrimScreen() {
  const router = useRouter();
  const sourceUri = useCropStore((s) => s.sourceUri);
  const sourceDuration = useCropStore((s) => s.sourceDuration);
  const setStartTime = useCropStore((s) => s.setStartTime);

  // İlk değer sadece açılışta okunur; render tetiklemez.
  const initialStartTime = useRef(useCropStore.getState().startTime).current;
  const startRef = useRef(initialStartTime);
  const lastCommitRef = useRef(0);

  const player = useVideoPlayer(sourceUri, (p) => {
    p.timeUpdateEventInterval = 0.1;
    p.muted = true;
    p.currentTime = initialStartTime;
    p.play();
  });

  // Seçilen pencereyi döngüde oynat.
  useEffect(() => {
    const sub = player.addListener("timeUpdate", ({ currentTime }) => {
      const start = startRef.current;
      if (currentTime >= start + CLIP_DURATION_SECONDS || currentTime < start - 0.5) {
        player.currentTime = start;
      }
    });
    return () => sub.remove();
  }, [player]);

  // Sürükleme: ref anında güncellenir, ağır işler (seek + store) kısıtlanır.
  const handleScrub = useCallback(
    (time: number) => {
      startRef.current = time;
      const now = Date.now();
      if (now - lastCommitRef.current < SCRUB_THROTTLE_MS) return;
      lastCommitRef.current = now;
      setStartTime(time);
      player.currentTime = time;
    },
    [player, setStartTime],
  );

  // Parmak kalkınca kesin değeri yaz.
  const handleScrubEnd = useCallback(
    (time: number) => {
      startRef.current = time;
      setStartTime(time);
      player.currentTime = time;
    },
    [player, setStartTime],
  );

  if (!sourceUri) {
    // Doğrudan bu ekrana gelinirse (ör. deep link) başa dön.
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-center text-gray-700">Önce bir video seçmelisin.</Text>
        <Pressable
          onPress={() => router.replace("/crop/select")}
          className="mt-4 rounded-full bg-indigo-600 px-5 py-2.5"
        >
          <Text className="font-semibold text-white">Video seç</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-5 pb-8 pt-4">
      <View className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <VideoView
          player={player}
          style={{ flex: 1 }}
          contentFit="contain"
          nativeControls={false}
        />
      </View>

      <TimeLabel />
      <Text className="mb-4 text-center text-sm text-gray-500">
        Kutuyu sürükleyerek {CLIP_DURATION_SECONDS} saniyelik bölümü seç
      </Text>

      <Scrubber
        duration={sourceDuration}
        clipDuration={CLIP_DURATION_SECONDS}
        initialStartTime={initialStartTime}
        onScrub={handleScrub}
        onScrubEnd={handleScrubEnd}
      />

      <View className="flex-1" />

      <Pressable
        onPress={() => router.push("/crop/details")}
        accessibilityRole="button"
        className="items-center rounded-full bg-indigo-600 py-4 active:bg-indigo-700"
      >
        <Text className="text-base font-semibold text-white">Devam</Text>
      </Pressable>
    </View>
  );
}