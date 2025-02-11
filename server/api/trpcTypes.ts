import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "./root.js";

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export type VideoData = NonNullable<
  RouterOutputs["videos"]["getVideos"][number]
>;
export type LikedVideo = NonNullable<
  RouterOutputs["videos"]["getLikedVideos"][number]
>;
export type LikedListing = NonNullable<
  RouterOutputs["listings"]["getLikedListings"][number]
>;

export type PublicProfileData = NonNullable<
  RouterOutputs["user"]["getPublicProfileData"]
>;

export type ConversationData = NonNullable<
  RouterOutputs["chat"]["getUserConversations"][number]
>;
export type ConversationMessage = NonNullable<
  RouterOutputs["chat"]["getConversationMessages"][number]
>;
export type AgentListing = NonNullable<
  RouterOutputs["listings"]["getListingsByAgent"][number]
>;

export type SimilarVideoResult = NonNullable<
  RouterOutputs["videos"]["getSimilarVideos"][number]
>;

export type AdItem = NonNullable<RouterOutputs["ads"]["getUserAds"][number]>;

export type AdMetrics = NonNullable<RouterOutputs["ads"]["getAdMetrics"]>;
