import { MongoClient } from "mongodb";

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

export function getMongoClient() {
  if (!clientPromise) {
    client = new MongoClient(process.env.MONGODB_URI as string);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getListingDetailsCollection() {
  const mongoClient = await getMongoClient();
  return mongoClient.db("mealmesh").collection("listing_details");
}
 
