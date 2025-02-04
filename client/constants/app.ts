import Constants from "expo-constants";
export const APP_URL = (Constants?.expoConfig?.extra?.appUrl ?? "") as string;
