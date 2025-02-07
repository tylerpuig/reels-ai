import { z } from "zod";

export const videoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  videoUrl: z.string(),
});

export type VideoSubmitData = z.infer<typeof videoSchema>;
// Zod schema for validation
export const listingSchema = z.object({
  // Home Info
  description: z.string(),

  // Listing Details
  price: z.number().positive("Price must be positive"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "State must be 2 characters"),
  zip: z.string().min(5, "ZIP code must be at least 5 characters"),
  beds: z.number().positive("Beds must be positive"),
  baths: z.number().positive("Baths must be positive"),
  sqft: z.number().positive("Square footage must be positive"),
  agentPhone: z.string().optional(),
  agentAgency: z.string().optional(),
});

export type ListingFormData = z.infer<typeof listingSchema>;
