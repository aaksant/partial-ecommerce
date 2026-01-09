import dotenv from "dotenv";
import { auth } from "../lib/auth";
import { db } from "../db";
import { users } from "../db/schema";

dotenv.config();

async function seedUsers() {
  const usersToCreate = [
    { name: "Charlie Kirk", email: "ckirk@example.com", role: "buyer" },
    { name: "Mario", email: "mario@example.com", role: "buyer" },
    { name: "Jason", email: "jsons@example.com", role: "seller" },
    { name: "Diana", email: "diana@example.com", role: "seller" }
  ];

  await Promise.all(
    usersToCreate.map(async ({ name, email, role }) => {
      await auth.api.signUpEmail({
        body: {
          name: name,
          email: email,
          password: "rawpassword123",
          role: role
        }
      });
    })
  );
}

async function authSeed() {
  try {
    console.log("Cleaning up data");
    await db.delete(users);

    console.log("Creating auth users...");
    await seedUsers();
    console.log("Auth users created");
  } catch (error) {
    console.log("AUTH SEED FAILED: ", error);
    process.exit(1);
  }
}

authSeed();
