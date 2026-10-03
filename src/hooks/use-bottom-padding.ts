import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useBottomPadding(): number {
  const { bottom } = useSafeAreaInsets();
  return Math.max(bottom, 16) + 16;
}