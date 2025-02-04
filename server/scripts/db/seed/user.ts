import { db } from "../utils";
import * as schema from "../../../db/schema";
import { faker } from "@faker-js/faker";

export async function seedUser() {
  try {
    await db.insert(schema.usersTable).values([
      {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatarUrl: faker.image.avatar(),
      },
    ]);
  } catch (err) {
    console.log(err);
  }
}
seedUser();
