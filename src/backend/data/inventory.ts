/** Shape of a single destination in the inventory. */
export interface TravelItem {
  id: number
  title: string
  location: string
  price: number   // USD per-person estimated cost
  tags: string[]  // Used by OpenAI for semantic matching
}

/**
 * Static travel inventory.
 * Add new destinations here — OpenAI sees only id/title/location/tags
 * so there is no need to re-tune the prompt when this list grows.
 */
export const inventory: TravelItem[] = [
  {
    id: 1,
    title: "High-Altitude Tea Trails",
    location: "Nuwara Eliya",
    price: 120,
    tags: ["cold", "nature", "hiking"],
  },
  {
    id: 2,
    title: "Coastal Heritage Wander",
    location: "Galle Fort",
    price: 45,
    tags: ["history", "culture", "walking"],
  },
  {
    id: 3,
    title: "Wild Safari Expedition",
    location: "Yala",
    price: 250,
    tags: ["animals", "adventure", "photography"],
  },
  {
    id: 4,
    title: "Surf & Chill Retreat",
    location: "Arugam Bay",
    price: 80,
    tags: ["beach", "surfing", "young-vibe"],
  },
  {
    id: 5,
    title: "Ancient City Exploration",
    location: "Sigiriya",
    price: 110,
    tags: ["history", "climbing", "view"],
  },
]
