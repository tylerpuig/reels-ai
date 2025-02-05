export default {
  expo: {
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      apiUrl: process.env.API_URL,
      appUrl: process.env.APP_URL,
      decor8ApiKey: process.env.DECOR8_API_KEY,
    },
  },
};
