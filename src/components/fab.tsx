import { Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type Props = {
  onPress: () => void;
  label: string;
};

export function Fab({ onPress, label }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Animated.View
      style={[{ position: "absolute", bottom: 32, right: 24 }, animatedStyle]}
    >
      <Pressable
        onPressIn={() => scale.set(withSpring(0.9))}
        onPressOut={() => scale.set(withSpring(1))}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        className="h-16 w-16 items-center justify-center rounded-full bg-indigo-600 shadow-lg"
      >
        <Text className="text-3xl font-light text-white">+</Text>
      </Pressable>
    </Animated.View>
  );
}