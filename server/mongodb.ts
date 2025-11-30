import { MongoClient, Db, Collection, ObjectId } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

const DB_NAME = "medical_kit";

export async function connectToMongoDB(): Promise<Db> {
  if (db) return db;
  
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("MONGODB_URI environment variable is not set");
    throw new Error("MONGODB_URI environment variable is not set");
  }

  try {
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    await client.connect();
    db = client.db(DB_NAME);
    console.log("Connected to MongoDB successfully");
    
    await initializeCollections(db);
    
    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

async function initializeCollections(database: Db) {
  const collections = await database.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);
  
  if (!collectionNames.includes("medicines")) {
    await database.createCollection("medicines");
    await database.collection("medicines").createIndex({ categoryId: 1 });
    await database.collection("medicines").createIndex({ categoryName: 1 });
    console.log("Created 'medicines' collection with indexes");
  }
  
  if (!collectionNames.includes("categories")) {
    await database.createCollection("categories");
    await database.collection("categories").createIndex({ name: 1 }, { unique: true });
    await database.collection("categories").createIndex({ isDeleted: 1 });
    console.log("Created 'categories' collection with indexes");
  }
  
  if (!collectionNames.includes("usage_logs")) {
    await database.createCollection("usage_logs");
    console.log("Created 'usage_logs' collection");
  }
}

export async function getDB(): Promise<Db> {
  if (!db) {
    return await connectToMongoDB();
  }
  return db;
}

export async function getMedicinesCollection(): Promise<Collection> {
  const database = await getDB();
  return database.collection("medicines");
}

export async function getUsageLogsCollection(): Promise<Collection> {
  const database = await getDB();
  return database.collection("usage_logs");
}

export async function getCategoriesCollection(): Promise<Collection> {
  const database = await getDB();
  return database.collection("categories");
}

export function toObjectId(id: string): ObjectId {
  return new ObjectId(id);
}

export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("MongoDB connection closed");
  }
}