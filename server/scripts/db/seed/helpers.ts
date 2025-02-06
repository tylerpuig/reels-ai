import { faker } from "@faker-js/faker";
import * as DBTypes from "../../../db/types.js";

export function generateListing(
  userId: string,
  agentName: string
): DBTypes.ListingInsertion {
  // Generate random number of beds between 1 and 4
  const beds = Math.floor(Math.random() * 4) + 1;

  // Generate baths based on beds (equal to beds, up to +2 more, or 1 less)
  const bathDiff = Math.floor(Math.random() * 4) - 1; // -1 to +2
  const baths = Math.max(1, beds + bathDiff); // Ensure at least 1 bath

  // Generate square footage based on number of beds
  const baseSqft = 750; // Base square footage for 1 bedroom
  const sqft = baseSqft + beds * faker.number.int({ min: 400, max: 800 });

  // Generate price based on square footage and location
  const pricePerSqft = faker.number.int({ min: 300, max: 800 });
  const price = sqft * pricePerSqft;

  // List of upscale cities and their states
  const locations = [
    { city: "Beverly Hills", state: "CA", zip: "90210" },
    { city: "Greenwich", state: "CT", zip: "06830" },
    { city: "Aspen", state: "CO", zip: "81611" },
    { city: "Palm Beach", state: "FL", zip: "33480" },
    { city: "Scottsdale", state: "AZ", zip: "85262" },
  ];

  const location = faker.helpers.arrayElement(locations);

  // List of luxury street names
  const streetNames = [
    "Maple",
    "Oak",
    "Palm",
    "Ocean",
    "Lake",
    "Mountain",
    "Valley",
    "Park",
    "Forest",
    "Sunset",
  ];
  const streetTypes = ["Street", "Avenue", "Boulevard", "Drive", "Lane"];

  const listing: DBTypes.ListingInsertion = {
    price: price,
    address: `${faker.number.int({
      min: 1,
      max: 999,
    })} ${faker.helpers.arrayElement(streetNames)} ${faker.helpers.arrayElement(
      streetTypes
    )}`,
    city: location.city,
    state: location.state,
    zip: location.zip,
    beds,
    baths,
    sqft: sqft,
    description: generateDescription(beds, baths),
    userId,
    agentName,
    // agent: generateAgent(),
  };

  return listing;
}

function generateDescription(beds: number, baths: number) {
  const features = [
    "open concept living space",
    "gourmet kitchen",
    "premium appliances",
    "spacious primary suite",
    "hardwood floors",
    "vaulted ceilings",
    "custom cabinetry",
    "marble countertops",
    "floor-to-ceiling windows",
    "smart home technology",
  ];

  const outdoorFeatures = [
    "mature landscaping",
    "covered patio",
    "swimming pool",
    "outdoor kitchen",
    "fire pit",
    "zen garden",
    "mountain views",
    "private courtyard",
  ];

  // Select 3 random indoor features and 2 outdoor features
  const selectedFeatures = faker.helpers.arrayElements(features, 3);
  const selectedOutdoor = faker.helpers.arrayElements(outdoorFeatures, 2);

  return (
    `Stunning ${beds} bedroom, ${baths} bath home featuring ${selectedFeatures.join(
      ", "
    )}. ` +
    `The backyard offers a peaceful retreat with ${selectedOutdoor.join(
      " and "
    )}.`
  );
}

function generateAgent() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  const agencies = [
    "Luxury Real Estate Group",
    "Premier Properties",
    "Elite Estates",
    "Platinum Living Realty",
    "Crown Jewel Properties",
  ];

  return {
    name: `${firstName} ${lastName}`,
    photo: "/api/placeholder/200/200", // Using placeholder API instead of external URL
    phone: faker.phone.number({
      style: "national",
    }),
    agency: faker.helpers.arrayElement(agencies),
  };
}
