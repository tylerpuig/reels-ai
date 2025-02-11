import { db } from "../../../db/index.js";
import * as schema from "../../../db/schema.js";
import { type AdInsertion } from "../../../db/types.js";

async function seedDatabase() {
  const userId = "531fba3c-0502-4259-99cb-c1ad3548640a";

  const videoIds = [8, 6];

  // Create some sample ads
  const ads: AdInsertion[] = [
    {
      userId,
      videoId: videoIds[0],
      title: "471 McVaney Road",
      description:
        "Promoting a home that's been on the market for over a year, this home boasts a stunning interior with a modern kitchen, a spacious living room, and a luxurious master bedroom.",
      bidAmount: "5.5", // $5.50 per 1000 impressions
      dailyBudget: "100.0",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    {
      userId,
      videoId: videoIds[1],
      title: "2012 Ferguson Street",
      description: "New listing that is expected to sell in the next 30 days.",
      bidAmount: "7.25",
      dailyBudget: "150.0",
      startDate: new Date(),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    },
  ];

  // Insert ads and store their IDs
  const insertedAds = [];
  for (const ad of ads) {
    const [result] = await db.insert(schema.adsTable).values(ad).returning();
    insertedAds.push(result);
  }

  // Generate daily impressions for the past 7 days for each ad
  const now = new Date();
  for (const ad of insertedAds) {
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Generate random impressions between 500-2000 and clicks between 10-100
      const impressions = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;
      const clicks = Math.floor(Math.random() * (100 - 10 + 1)) + 10;

      await db.insert(schema.adDailyImpressionsTable).values({
        adId: ad.id,
        date: date.toLocaleDateString(),
        impressions,
        clicks,
      });
    }
  }

  console.log("Database seeded successfully!");
}

// Execute the seed function
seedDatabase().catch(console.error);
