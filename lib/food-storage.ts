export const PROVIDER_LISTINGS_KEY = "mealmesh-provider-listings";

const legacyDemoItems = new Map<number, string>([
  [1, "Vegetable Biryani"],
  [2, "Fresh Seasonal Fruits"],
  [3, "Fresh Bread"],
]);

export function readProviderListings<T extends { id: number; name: string }>() : T[] {
  try {
    const raw = localStorage.getItem(PROVIDER_LISTINGS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const cleaned = (parsed as T[]).filter((item) => {
      const legacyName = legacyDemoItems.get(Number(item.id));
      return !(legacyName && item.name === legacyName);
    });
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(PROVIDER_LISTINGS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveProviderListings<T>(items: T[]) {
  localStorage.setItem(PROVIDER_LISTINGS_KEY, JSON.stringify(items));
}
