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


// merge each SQL listing row with its MongoDB details document (one query for all rows)
export async function attachListingDetails<T extends { listing_id: number }>(rows: T[]) {
  const collection = await getListingDetailsCollection();
  const docs = rows.length
    ? await collection.find({ listing_id: { $in: rows.map((row) => row.listing_id) } }).toArray()
    : [];
  const byId = new Map(docs.map((doc) => [doc.listing_id, doc]));

  return rows.map((row) => {
    const details = byId.get(row.listing_id);
    return {
      ...row,
      photos: details?.photos || [],
      packaging_notes: details?.packaging_notes || "",
      allergen_tags: details?.allergen_tags || [],
      food_name: details?.food_name || "",
      pickup_location: details?.pickup_location || "",
      pickup_from: details?.pickup_from || null,
    };
  });
}
