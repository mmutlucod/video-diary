import { useRouter } from "expo-router";
import {
  useVideoPlayer,
  type VideoPlayer as ExpoVideoPlayer,
} from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Scrubber } from "@/components/scrubber";
import { VideoPlayer } from "@/components/video-player";
import { CLIP_DURATION_SECONDS } from "@/constants/app";
import { useBottomPadding } from "@/hooks/use-bottom-padding";
import { useCropStore } from "@/store/crop-store";
import { formatDuration } from "@/utils/time";
/** Sürükleme sırasında seek + store güncellemesi arasındaki en kısa süre */
const SCRUB_THROTTLE_MS = 120;

/** Player nesnesi bileşen dışında değiştirilir (React Compiler uyumu için). */
function seekTo(player: ExpoVideoPlayer, seconds: number) {
  player.currentTime = seconds;
}

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
  const bottomPadding = useBottomPadding();
  const sourceUri = useCropStore((s) => s.sourceUri);
  const sourceDuration = useCropStore((s) => s.sourceDuration);
  const setStartTime = useCropStore((s) => s.setStartTime);

  const [initialStartTime] = useState(() => useCropStore.getState().startTime);
  const startRef = useRef(initialStartTime);
  const lastCommitRef = useRef(0);

  const player = useVideoPlayer(sourceUri, (p) => {
    p.timeUpdateEventInterval = 0.1;
    p.muted = true;
    p.currentTime = initialStartTime;
    p.play();
  });

  useEffect(() => {
    const sub = player.addListener("timeUpdate", ({ currentTime }) => {
      const start = startRef.current;
      if (currentTime >= start + CLIP_DURATION_SECONDS || currentTime < start - 0.5) {
        seekTo(player, start);
      }
    });
    return () => sub.remove();
  }, [player]);

  const handleScrub = useCallback(
    (time: number) => {
      startRef.current = time;
      const now = Date.now();
      if (now - lastCommitRef.current < SCRUB_THROTTLE_MS) return;
      lastCommitRef.current = now;
      setStartTime(time);
      seekTo(player, time);
    },
    [player, setStartTime],
  );

  const handleScrubEnd = useCallback(
    (time: number) => {
      startRef.current = time;
      setStartTime(time);
      seekTo(player, time);
    },
    [player, setStartTime],
  );

  if (!sourceUri) {
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
    <View
      className="flex-1 bg-white px-5 pt-4"
      style={{ paddingBottom: bottomPadding }}
      >
      <VideoPlayer player={player} rounded />

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