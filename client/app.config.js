export default {
  expo: {
    ios: {
      bundleIdentifier: "com.reelsai.dev",
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      apiUrl: process.env.API_URL,
      appUrl: process.env.APP_URL,
      decor8ApiKey: process.env.DECOR8_API_KEY,
      eas: {
        projectId: "91827fa8-23ed-4bca-8bf5-c51faa8346ad",
      },
    },
    updates: {
      url: "https://u.expo.dev/91827fa8-23ed-4bca-8bf5-c51faa8346ad",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
  },
};
