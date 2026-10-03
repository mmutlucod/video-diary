import { useEffect, useMemo, useRef, useState } from "react";
import { type LayoutChangeEvent, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const MIN_WINDOW_WIDTH = 48;
const TRACK_HEIGHT = 56;

type Props = {
  /** Kaynak videonun toplam süresi (sn) */
  duration: number;
  /** Seçilecek klibin süresi (sn) */
  clipDuration: number;
  /** Açılıştaki başlangıç (sn). Sonraki değişiklikler buradan izlenmez. */
  initialStartTime: number;
  /** Sürüklerken sık sık çağrılır; ağır iş yapma */
  onScrub: (startTime: number) => void;
  /** Parmak kalkınca kesin değerle bir kez çağrılır */
  onScrubEnd: (startTime: number) => void;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function Scrubber({
  duration,
  clipDuration,
  initialStartTime,
  onScrub,
  onScrubEnd,
}: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const x = useSharedValue(0);
  const dragStartX = useSharedValue(0);

  // Callback'ler her render'da değişse bile gesture yeniden oluşmasın.
  const onScrubRef = useRef(onScrub);
  const onScrubEndRef = useRef(onScrubEnd);
  onScrubRef.current = onScrub;
  onScrubEndRef.current = onScrubEnd;

  const initialStartRef = useRef(initialStartTime);

  const selectableRange = Math.max(duration - clipDuration, 0);
  const windowWidth = Math.max(
    (trackWidth * clipDuration) / Math.max(duration, clipDuration),
    MIN_WINDOW_WIDTH,
  );
  const maxX = Math.max(trackWidth - windowWidth, 0);

  // Sadece genişlik ölçülünce konumla; sürükleme sırasında dokunma.
  useEffect(() => {
    x.value =
      selectableRange > 0 ? (initialStartRef.current / selectableRange) * maxX : 0;
  }, [selectableRange, maxX, x]);

  const pan = useMemo(() => {
    const toTime = (pos: number) =>
      maxX > 0 ? (pos / maxX) * selectableRange : 0;

    return Gesture.Pan()
      .runOnJS(true)
      .onStart(() => {
        dragStartX.value = x.value;
      })
      .onUpdate((e) => {
        const next = clamp(dragStartX.value + e.translationX, 0, maxX);
        x.value = next;
        onScrubRef.current(toTime(next));
      })
      .onEnd(() => {
        onScrubEndRef.current(toTime(x.value));
      });
  }, [maxX, selectableRange, x, dragStartX]);

  const windowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const onLayout = (e: LayoutChangeEvent) =>
    setTrackWidth(e.nativeEvent.layout.width);

  return (
    <View
      onLayout={onLayout}
      style={{ height: TRACK_HEIGHT }}
      className="w-full justify-center overflow-hidden rounded-xl bg-gray-200"
    >
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[{ width: windowWidth, height: TRACK_HEIGHT }, windowStyle]}
          className="rounded-xl border-4 border-indigo-600 bg-indigo-500/30"
          accessibilityRole="adjustable"
          accessibilityLabel="Klip başlangıcını seç"
        />
      </GestureDetector>
    </View>
  );
}