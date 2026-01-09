import { eq } from "drizzle-orm";
import { db } from "../db";
import { conversations, messages, products } from "../db/schema";

async function seedProducts() {
  console.log("Seeding products...");

  const [product1] = await db
    .insert(products)
    .values({
      name: "Gaming Laptop",
      price: "1299.99",
      description: "Brand new",
      sellerId: "sAPw8YI187YT5b7EbrJ0xqdzPt7jYSL7"
    })
    .returning();

  const [product2] = await db
    .insert(products)
    .values({
      name: "Sneaker",
      price: "150.99",
      description: "Brand new",
      sellerId: "tAe0zBmrzi97T21gzXTJov5X74GuZUwk"
    })
    .returning();

  console.log(`Created products: ${product1.name}, ${product2.name}`);
}

async function seedConversations() {
  const [conversation1] = await db
    .insert(conversations)
    .values({
      buyerId: "cagWfmI0qrx79OI961uTN5Q0NQW7x7i1",
      sellerId: "sAPw8YI187YT5b7EbrJ0xqdzPt7jYSL7",
      productId: "8533ef14-327d-4f19-8a1e-21b085839060"
    })
    .returning();

  const [conversation2] = await db
    .insert(conversations)
    .values({
      buyerId: "UQ4LZiTrYIhu4iJStCV0erN5Q4OC9FHV",
      sellerId: "tAe0zBmrzi97T21gzXTJov5X74GuZUwk",
      productId: "8ad733e4-cf47-4724-8c3b-8d913b5af4b1"
    })
    .returning();

  console.log(
    `Created conversations: ${conversation1.id}, ${conversation2.id}`
  );
}

async function seedMessages() {
  const [message1] = await db
    .insert(messages)
    .values({
      conversationId: "3159974b-7cf0-432b-98ad-41f047235573",
      senderId: "cagWfmI0qrx79OI961uTN5Q0NQW7x7i1",
      content: "Test 1"
    })
    .returning();

  const [message2] = await db
    .insert(messages)
    .values({
      conversationId: "7fd81d54-8052-411c-86d4-03f5e3794706",
      senderId: "UQ4LZiTrYIhu4iJStCV0erN5Q4OC9FHV",
      content: "Test 2"
    })
    .returning();

  console.log(`Created messages: ${message1.id}, ${message2.id}`);
}
