import type {
  ListingFormData,
  VideoSubmitData,
} from "../../../packages/api-types";

const baseListingFormData: ListingFormData = {
  description: "",
  price: 0,
  address: "",
  city: "",
  state: "",
  zip: "",
  beds: 0,
  baths: 0,
  sqft: 0,
  agentPhone: "",
  agentAgency: "",
};

const baseVideoFormData: VideoSubmitData = {
  title: "",
  description: "",
  videoUrl: "",
};

export function getBaseListingFormData(): ListingFormData {
  return JSON.parse(JSON.stringify(baseListingFormData));
}

export function getBaseVideoFormData(): VideoSubmitData {
  return JSON.parse(JSON.stringify(baseVideoFormData));
}
