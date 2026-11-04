// shared helpers for turning /api/listings rows into what the pages display

export type ApiListing = {
  listing_id: number;
  category_name: string;
  quantity: string;
  unit: string;
  usable_by: string;
  status: string;
  created_at?: string;
  provider_name?: string;
  provider_org?: string | null;
  claim_id?: number | null;
  claim_status?: string | null;
  recipient_name?: string | null;
  photos?: string[];
  packaging_notes?: string;
  food_name?: string;
  pickup_location?: string;
  pickup_from?: string | null;
};

export type ListingStatus = "Available" | "Claimed" | "Collected" | "Expired";

export type DisplayListing = {
  id: number;
  name: string;
  category: string;
  quantity: string;
  pickupTime: string;
  location: string;
  status: ListingStatus;
  emoji: string;
  description?: string;
  imageData?: string;
  recipientName?: string | null;
};

export const listingStatusLabels: Record<string, ListingStatus> = {
  available: "Available",
  claimed: "Claimed",
  delivered: "Collected",
  expired: "Expired",
};

export const categoryEmojis: Record<string, string> = {
  "Cooked Meals": "🍛",
  Produce: "🥦",
  Bakery: "🍞",
  Dairy: "🥛",
  "Packaged Goods": "📦",
  Other: "🥗",
};

export function formatPickupTime(usableBy: string, pickupFrom?: string | null) {
  const deadline = new Date(usableBy).toLocaleString();
  return pickupFrom ? `${new Date(pickupFrom).toLocaleString()} – ${deadline}` : `Collect by ${deadline}`;
}

export function toDisplayListing(row: ApiListing): DisplayListing {
  return {
    id: row.listing_id,
    name: row.food_name || row.category_name,
    category: row.category_name,
    quantity: `${Number(row.quantity)} ${row.unit}`,
    pickupTime: formatPickupTime(row.usable_by, row.pickup_from),
    location: row.pickup_location || row.provider_org || row.provider_name || "",
    status: listingStatusLabels[row.status] || "Available",
    emoji: categoryEmojis[row.category_name] || "🥗",
    description: row.packaging_notes,
    imageData: row.photos?.[0],
    recipientName: row.recipient_name,
  };
}
