// app/_layout.tsx
import "../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState, useEffect } from "react";
import { trpc } from "../trpc/client";
import superjson from "superjson";
import {
  Theme,
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { supabase } from "~/lib/supabase";
import { Session } from "@supabase/supabase-js";
import Auth from "@/components/auth/Auth";
import { View } from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useSessionStore } from "@/hooks/useSession";
import { APP_URL } from "../constants/app";
import { VideoProvider } from "@/hooks/useVideoContext";

SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from "expo-router";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export default function RootLayout() {
  const { session, setSession } = useSessionStore();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: APP_URL + "/trpc",
          headers: async () => {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            return {
              Authorization: session ? `Bearer ${session.access_token}` : "",
            };
          },
        }),
      ],
      transformer: superjson,
    })
  );

  if (!loaded) return null;

  // If no session, show auth screen
  if (!session) {
    return (
      <ThemeProvider value={DARK_THEME}>
        <View style={{ flex: 1 }}>
          <Auth />
        </View>
      </ThemeProvider>
    );
  }

  // Otherwise show main app
  return (
    <ThemeProvider value={DARK_THEME}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <VideoProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
              <Stack.Screen
                name="(modals)/viewprofile/[id]"
                options={{
                  headerShown: false,
                  title: "View Profile",
                  presentation: "card",
                  animation: "slide_from_right",
                  gestureEnabled: true,
                  gestureDirection: "horizontal",
                }}
              />
              <Stack.Screen
                name="(modals)/listing/[id]"
                options={{
                  headerShown: false,
                  title: "View Listing",
                  presentation: "card",
                  animation: "slide_from_right",
                  gestureEnabled: true,
                  gestureDirection: "horizontal",
                }}
              />
              <Stack.Screen
                name="(modals)/editprofile/index"
                options={{
                  headerShown: false,
                  title: "Edit Profile",
                  presentation: "card",
                  animation: "slide_from_right",
                  gestureEnabled: true,
                  gestureDirection: "horizontal",
                }}
              />
              <Stack.Screen
                name="(modals)/chat/[id]"
                options={{
                  headerShown: false,
                  title: "Chat",
                  presentation: "card",
                  animation: "slide_from_right",
                  gestureEnabled: true,
                  gestureDirection: "horizontal",
                }}
              />
            </Stack>
            <StatusBar style="auto" />
          </VideoProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ThemeProvider>
  );
}
