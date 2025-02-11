import Constants from "expo-constants";
export const APP_URL = (Constants?.expoConfig?.extra?.appUrl ?? "") as string;
export const DECOR8_API_KEY = (Constants?.expoConfig?.extra?.decor8ApiKey ??
  "") as string;
export const ELEVEN_LABS_API_KEY = (Constants?.expoConfig?.extra
  ?.elevenLabsApiKey ?? "") as string;
