import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { Suspense } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DB_NAME } from "@/constants/app";
import { migrateDb } from "@/db/migrations";

// Component dışında: re-render'da yeniden oluşmaz.
// Veri yalnızca bizim mutation'larımızla değiştiği için staleTime sonsuz.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity, retry: false },
  },
});

/**
 * İkon rengi, durum çubuğunun arkasında ne olduğuna göre seçilir:
 * - top > 0: uygulama çubuğun altına uzanıyor, arkada açık zeminimiz var -> koyu ikon
 * - top === 0: bandı sistem/cihaz çiziyor (genelde siyah) -> açık ikon
 */
function AdaptiveStatusBar() {
  const { top } = useSafeAreaInsets();
  if (__DEV__) console.log("safe area top inset:", top);
  return <StatusBar style={top > 0 ? "dark" : "light"} />;
}

function DbFallback() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AdaptiveStatusBar />
      <Suspense fallback={<DbFallback />}>
        <SQLiteProvider databaseName={DB_NAME} onInit={migrateDb} useSuspense>
          <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="crop" options={{ presentation: "modal" }} />
              <Stack.Screen
                name="video/[id]"
                options={{
                  headerShown: true,
                  title: "",
                  headerBackTitle: "Geri",
                  headerShadowVisible: false,
                }}
              />
              <Stack.Screen
                name="video/edit/[id]"
                options={{
                  headerShown: true,
                  presentation: "modal",
                  title: "Düzenle",
                  headerShadowVisible: false,
                }}
              />
            </Stack>
          </QueryClientProvider>
        </SQLiteProvider>
      </Suspense>
    </GestureHandlerRootView>
  );
}