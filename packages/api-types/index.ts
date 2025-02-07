import type { AppRouter } from "../../server/api/root"; // Only importing the type
import type { ListingInfo } from "../../server/db/types";

import type {
  VideoSubmitData,
  ListingFormData,
} from "../../server/api/schemas";

// Export only types, no actual implementation
export type { AppRouter };
export type { ListingInfo };
export type { VideoSubmitData, ListingFormData };
