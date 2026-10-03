import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text } from "react-native";

import { useCropStore } from "@/store/crop-store";

export default function CropLayout() {
  const router = useRouter();
  const reset = useCropStore((s) => s.reset);

  useEffect(() => reset, [reset]);

  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
        headerRight: () => (
          <Pressable
            onPress={() => router.dismissTo("/")}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Kapat"
          >
            <Text className="text-base text-indigo-600">Kapat</Text>
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="select" options={{ title: "1/3 · Video seç" }} />
      <Stack.Screen name="trim" options={{ title: "2/3 · Bölümü seç" }} />
      <Stack.Screen name="details" options={{ title: "3/3 · Detaylar" }} />
    </Stack>
  );
}