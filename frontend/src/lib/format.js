// Shared display helpers.

export const formatPrice = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

// Soft studio backgrounds behind product photos, picked per product so the
// grid has gentle variety and each product keeps the same tone everywhere.
const TONES = ["#DCE3E6", "#E4E2DA", "#EBDAD0", "#ECE4D6", "#DDE3D6", "#E3DDE6"];

export const toneFor = (id = "") => {
  let hash = 0;
  for (const char of String(id)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TONES[hash % TONES.length];
};

export const LOW_STOCK = 3;

export const stockText = (stock) => {
  if (stock <= 0) return "Sold out";
  if (stock <= LOW_STOCK) return `Only ${stock} left`;
  return `${stock} in stock`;
};

export const CATEGORIES = ["Electronics", "Fashion", "Books", "Home"];
