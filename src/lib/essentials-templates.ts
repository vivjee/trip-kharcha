import type { ChecklistCategory, ChecklistItem, TripType } from '@/types/trip';

export interface CategoryMeta {
  id: ChecklistCategory;
  label: string;
  emoji: string;
  color: string;
}

export const CHECKLIST_CATEGORIES: CategoryMeta[] = [
  { id: 'wearables', label: 'Wearables', emoji: '👕', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'essentials', label: 'Carry-ons & Gear', emoji: '🎒', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'electronics', label: 'Electronics', emoji: '⚡', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'health', label: 'Health & Hygiene', emoji: '🧼', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { id: 'first_aid', label: 'First Aid', emoji: '🩹', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'food', label: 'Food & Snacks', emoji: '🍱', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'hi_protein', label: 'Hi-Protein Food', emoji: '🥜', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'utensils', label: 'Utensils & Cooking', emoji: '🍳', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'lodging', label: 'Lodging & Tents', emoji: '⛺', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'apps_tech', label: 'Apps & Tech', emoji: '🧭', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { id: 'other', label: 'Other Items', emoji: '📦', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export interface TripTypeMeta {
  type: TripType;
  title: string;
  emoji: string;
  image: string;
  badge: string;
  tagline: string;
  description: string;
}

export const TRIP_TYPES: TripTypeMeta[] = [
  {
    type: 'day_hike',
    title: 'Day Hike',
    emoji: '🚶‍♂️',
    image: '/images/trip-types/day_hike.webp',
    badge: 'Daytime Only',
    tagline: 'Light daytime trail outing',
    description: 'Daytime hike without overnight stay. Light backpack with water, snacks, offline maps, and comfortable footwear.',
  },
  {
    type: 'night_camp',
    title: 'Night Camp',
    emoji: '⛺',
    image: '/images/trip-types/night_camp.webp',
    badge: 'Overnight Camp',
    tagline: 'Bonfire, tents, and cooked food',
    description: 'Campout under the stars with tents, sleeping bags, cooking utensils, dekchi, music system, and warm layers.',
  },
  {
    type: 'short_trek',
    title: 'Short Trek',
    emoji: '🥾',
    image: '/images/trip-types/short_trek.webp',
    badge: '2–4 Days',
    tagline: 'Quick 2 to 4 days mountain trail',
    description: 'Compact trekking kit with essential mountain gear, hiking sticks, basic first aid, and energetic snacks.',
  },
  {
    type: 'long_trek',
    title: 'Long Trip / Trek',
    emoji: '🎒',
    image: '/images/trip-types/long_trek.webp',
    badge: 'Multi-Day Journey',
    tagline: 'Multi-day travels, road trips & expeditions',
    description: 'Comprehensive packing checklist for extended travel, road trips, and multi-day treks: versatile weather layers, personal care, electronics, nutrition, travel first aid, and journey essentials.',
  },
];

interface RawItem {
  name: string;
  category: ChecklistCategory;
  quantity?: string;
}

const DAY_HIKE_ITEMS: RawItem[] = [
  // Wearables
  { name: 'Jacket', category: 'wearables', quantity: '1' },
  { name: 'Long Socks', category: 'wearables', quantity: '1 pair' },
  { name: 'Hiking Shoes', category: 'wearables', quantity: '1 pair' },
  { name: 'Handkerchief', category: 'wearables' },
  { name: 'Topi / Warm Cap', category: 'wearables', quantity: '1' },
  { name: 'Goggles / Sunglasses', category: 'wearables', quantity: '1' },
  // Carry-ons
  { name: 'Daypack Backpack', category: 'essentials', quantity: '1' },
  { name: 'Water Bottle', category: 'essentials', quantity: '1L' },
  { name: 'Tissue Paper', category: 'essentials' },
  { name: 'Lighter', category: 'essentials', quantity: '1' },
  // Electronics
  { name: 'Phone', category: 'electronics', quantity: '1' },
  { name: 'Portable Speaker', category: 'electronics', quantity: '1' },
  // Health
  { name: 'Vaseline / Lip Balm', category: 'health' },
  // Food
  { name: 'Dry Fruits', category: 'food' },
  { name: 'Fresh Fruits', category: 'food' },
  { name: 'Biscuits', category: 'food' },
  // Apps & Tech
  { name: 'Offline Maps (Maps.me / Google)', category: 'apps_tech' },
  { name: 'Compass App', category: 'apps_tech' },
  { name: 'Distance / Step Counter', category: 'apps_tech' },
  { name: 'Altimeter App', category: 'apps_tech' },
  { name: 'Offline Songs Playlist', category: 'apps_tech' },
  { name: 'Karaoke Tracks', category: 'apps_tech' },
];

const NIGHT_CAMP_ITEMS: RawItem[] = [
  // Wearables
  { name: 'Warm Jacket', category: 'wearables', quantity: '1' },
  { name: 'Topi / Beanie', category: 'wearables', quantity: '1' },
  { name: 'Goggles / Sunglasses', category: 'wearables', quantity: '1' },
  { name: 'Camp Slippers (light)', category: 'wearables', quantity: '1 pair' },
  // Carry-ons
  { name: 'Backpack / Duffel Bag', category: 'essentials', quantity: '1' },
  { name: 'Tissue Paper Roll', category: 'essentials', quantity: '1' },
  { name: 'Lighters / Matchbox', category: 'essentials', quantity: '1' },
  { name: 'Citizenship / ID Card', category: 'essentials' },
  { name: 'Water Bottles / Jar', category: 'essentials', quantity: '8L' },
  // Electronics
  { name: 'Phone & Charger', category: 'electronics', quantity: '1' },
  { name: 'Music System / Bluetooth Speaker', category: 'electronics', quantity: '1' },
  { name: 'Extra Batteries / Power Bank', category: 'electronics' },
  { name: 'Headlamp / Flashlight', category: 'electronics', quantity: '1' },
  // Health
  { name: 'Toothbrush & Paste', category: 'health' },
  { name: 'Hair & Body Oil', category: 'health' },
  { name: 'Hand Sanitizer', category: 'health' },
  // Lodging
  { name: 'Camping Tent', category: 'lodging', quantity: '1' },
  { name: 'Sleeping Bags', category: 'lodging' },
  { name: 'Sleeping Mat', category: 'lodging' },
  // Utensils
  { name: 'Camp Knife', category: 'utensils', quantity: '1' },
  { name: 'Dekchi / Cooking Pot', category: 'utensils', quantity: '1' },
  { name: 'Drinking Glasses / Mugs', category: 'utensils' },
  { name: 'Paper Plates / Bowls', category: 'utensils' },
  { name: 'Spoons & Spatula', category: 'utensils' },
  // Food
  { name: 'Cooked Food / Marinated Food', category: 'food' },
  { name: 'Onion + Coriander + Green Chilly (Chopped)', category: 'food' },
  { name: 'Salt & Spices', category: 'food' },
  { name: 'Sandwich Bread & Spreads', category: 'food' },
  { name: 'Lemon', category: 'food' },
  { name: 'Green Tea Items & Bags', category: 'food' },
  { name: 'Chiura (Beaten Rice)', category: 'food' },
  { name: 'Fresh Fruits', category: 'food' },
  { name: 'Dry Fruits & Nuts', category: 'food' },
];

const SHORT_TREK_ITEMS: RawItem[] = [
  // Wearables
  { name: 'Warm Trekking Jacket', category: 'wearables', quantity: '1' },
  { name: 'Wind Cheater', category: 'wearables', quantity: '1' },
  { name: 'Quick-dry T-Shirts', category: 'wearables', quantity: '2' },
  { name: 'Trek Pants / Tracks', category: 'wearables', quantity: '1' },
  { name: 'Inner Thermal Trouser', category: 'wearables', quantity: '1' },
  { name: 'Undergarments', category: 'wearables', quantity: '2' },
  { name: 'Trekking Socks (thick)', category: 'wearables', quantity: '2 pairs' },
  { name: 'Trekking Shoes', category: 'wearables', quantity: '1 pair' },
  { name: 'Light Raincoat / Poncho', category: 'wearables', quantity: '1' },
  { name: 'Quick-dry Towel (small)', category: 'wearables', quantity: '1' },
  { name: 'Trekking Gloves', category: 'wearables', quantity: '1 pair' },
  { name: 'Sun Cap / Topi', category: 'wearables', quantity: '1' },
  { name: 'UV Sunglasses', category: 'wearables', quantity: '1' },
  { name: 'Cash (ATMs rare on trails)', category: 'wearables' },
  // Carry-ons
  { name: 'Trekking Backpack (35-45L)', category: 'essentials', quantity: '1' },
  { name: 'Sleeping Bag (compact)', category: 'essentials', quantity: '1' },
  { name: 'Hiking Poles / Sticks', category: 'essentials', quantity: '2' },
  { name: 'Water Bottles', category: 'essentials', quantity: '2L' },
  { name: 'Toilet Paper Roll', category: 'essentials', quantity: '1' },
  { name: 'Wet Tissues', category: 'essentials' },
  { name: 'Lighter', category: 'essentials', quantity: '1' },
  { name: 'Light Cup / Mug & Spoon', category: 'essentials', quantity: '1' },
  // Electronics
  { name: 'Phone', category: 'electronics', quantity: '1' },
  { name: 'Charger & Cables', category: 'electronics' },
  { name: 'Power Bank (10,000–20,000 mAh)', category: 'electronics', quantity: '1' },
  { name: 'Headlamp / Torch', category: 'electronics', quantity: '1' },
  // Health
  { name: 'Toothbrush & Paste (small)', category: 'health' },
  { name: 'Face Wash & Soap Strips', category: 'health' },
  { name: 'Sunscreen (SPF 50+)', category: 'health' },
  { name: 'Moisturizer / Cold Cream', category: 'health' },
  { name: 'Hand Sanitizer', category: 'health' },
  // First Aid
  { name: 'Crepe Bandage & Adhesive Tape', category: 'first_aid' },
  { name: 'Tiger Balm / Vicks', category: 'first_aid' },
  { name: 'Pudin Hara (Stomach Relief)', category: 'first_aid' },
  { name: 'Cetamol (Paracetamol)', category: 'first_aid' },
  { name: 'Moov / Pain Relief Gel', category: 'first_aid' },
  // Food & Nutrition
  { name: 'Chocolate & Energy Bars', category: 'food' },
  { name: 'Glucose / Biscuits', category: 'food' },
  { name: 'Muesli & Granola', category: 'food' },
  { name: 'Peanuts & Mixed Dry Fruits', category: 'hi_protein' },
  { name: 'Himalayan Chhurpi (long-lasting chew)', category: 'hi_protein' },
  // Apps & Tech
  { name: 'Offline Trail Maps (Maps.me)', category: 'apps_tech' },
  { name: 'Compass & Altimeter App', category: 'apps_tech' },
  { name: 'PeakLens (Mountain Identifier)', category: 'apps_tech' },
  { name: 'Distance & GPS Tracker', category: 'apps_tech' },
  { name: 'Offline Songs Playlist', category: 'apps_tech' },
];

const LONG_TREK_ITEMS: RawItem[] = [
  // Wearables
  { name: 'Down Jacket / Heavy Jacket', category: 'wearables', quantity: '1' },
  { name: 'Wind Cheater Jacket', category: 'wearables', quantity: '1' },
  { name: 'T-Shirts (Quick Dry)', category: 'wearables', quantity: '4' },
  { name: 'Trek Pants / Tracks', category: 'wearables', quantity: '2' },
  { name: 'Inner Thermal Trousers', category: 'wearables', quantity: '2' },
  { name: 'Undergarments', category: 'wearables', quantity: '4' },
  { name: 'Trekking Socks (long, thick woolen)', category: 'wearables', quantity: '4 pairs' },
  { name: 'Slippers (light camp use)', category: 'wearables', quantity: '1 pair' },
  { name: 'Trekking Shoes (broken in)', category: 'wearables', quantity: '1 pair' },
  { name: 'Raincoat / Poncho (light)', category: 'wearables', quantity: '1' },
  { name: 'Quick-dry Towel (small)', category: 'wearables', quantity: '1' },
  { name: 'Handkerchief', category: 'wearables', quantity: '2' },
  { name: 'Fleece / Windproof Gloves', category: 'wearables', quantity: '1 pair' },
  { name: 'Sun Cap', category: 'wearables', quantity: '1' },
  { name: 'Warm Topi / Beanie', category: 'wearables', quantity: '1' },
  { name: 'Neck Muffler / Buff', category: 'wearables', quantity: '1' },
  { name: 'Polarized Sunglasses', category: 'wearables', quantity: '1' },
  { name: 'Swimming Slacks (if dipping in hot springs)', category: 'wearables' },
  { name: 'Helmet (for mountain biking / passes)', category: 'wearables' },
  { name: 'Cash (ample local cash for tea houses)', category: 'wearables' },
  // Carry-ons & Essentials
  { name: 'Large Trekking Backpack (50-70L)', category: 'essentials', quantity: '1' },
  { name: 'Down Sleeping Bag (-5°C to -15°C)', category: 'essentials', quantity: '1' },
  { name: 'Sleeping Mat', category: 'essentials', quantity: '2' },
  { name: 'Hiking Sticks / Trekking Poles', category: 'essentials', quantity: '2' },
  { name: 'Insulated Water Bottles (1L)', category: 'essentials', quantity: '2' },
  { name: 'Toilet Paper Roll', category: 'essentials', quantity: '1' },
  { name: 'Wet Tissues Pack', category: 'essentials' },
  { name: 'Windproof Lighter', category: 'essentials', quantity: '1' },
  { name: 'Butane Gas Canister', category: 'essentials' },
  { name: 'Portable Camping Stove', category: 'essentials' },
  { name: 'Light Stainless Steel Mug', category: 'essentials', quantity: '1' },
  { name: 'Light Spoon & Fork', category: 'essentials', quantity: '1' },
  { name: 'Trek Bowl', category: 'essentials', quantity: '1' },
  { name: 'Steel Food Cover', category: 'essentials', quantity: '1' },
  { name: 'Bike Cushion & Hooks', category: 'essentials' },
  // Electronics
  { name: 'Phone', category: 'electronics', quantity: '1' },
  { name: 'Fast Charger & Braided Cable', category: 'electronics', quantity: '1' },
  { name: 'High-Capacity Power Bank (light)', category: 'electronics', quantity: '1' },
  { name: 'Torch / High-Lumen Headlamp', category: 'electronics', quantity: '1' },
  { name: 'Bluetooth Speaker', category: 'electronics', quantity: '1' },
  { name: 'Spare Batteries', category: 'electronics' },
  // Health & Hygiene
  { name: 'Toothbrush & Travel Toothpaste', category: 'health' },
  { name: 'Shampoo Sachets', category: 'health', quantity: '4' },
  { name: 'Bath Soap (small travel bar)', category: 'health', quantity: '1' },
  { name: 'Face Wash (small)', category: 'health', quantity: '1' },
  { name: 'Vaseline / Cold Cream (small)', category: 'health', quantity: '1' },
  { name: 'Sanitizer (small pocket bottle)', category: 'health', quantity: '1' },
  { name: 'Coconut Oil (for dry skin/scalp)', category: 'health' },
  { name: 'Deodorant Roll-on', category: 'health' },
  { name: 'Sunscreen (High SPF / UV block)', category: 'health' },
  { name: 'Moisturizer / Body Lotion', category: 'health' },
  { name: 'Pocket Comb', category: 'health', quantity: '1' },
  // First Aid & Altitude Safety
  { name: 'White Bandage Rolls', category: 'first_aid', quantity: '2' },
  { name: 'Adhesive Medical Tape', category: 'first_aid', quantity: '1' },
  { name: 'Elastic Crepe Bandage (for sprains)', category: 'first_aid', quantity: '1' },
  { name: 'Tiger Balm (for headaches/muscle ache)', category: 'first_aid', quantity: '1' },
  { name: 'Pudin Hara (stomach/digestion pearls)', category: 'first_aid' },
  { name: 'Cetamol / Paracetamol (for fever/pain)', category: 'first_aid' },
  { name: 'Diamox (Acetazolamide - Altitude Sickness)', category: 'first_aid' },
  { name: 'Moov / Pain Relief Ointment', category: 'first_aid' },
  // Food & Energy
  { name: 'Chocolate Energy Bars (Snickers/Mars)', category: 'food' },
  { name: 'Biscuits & Energy Cookies', category: 'food' },
  { name: 'Muesli & Instant Oats', category: 'food' },
  { name: 'Shakkhar (Jaggery / Raw Cane Sugar)', category: 'food' },
  // Hi-Protein Foods
  { name: 'Hemp Seeds (Roasted Protein)', category: 'hi_protein' },
  { name: 'Roasted Peanuts', category: 'hi_protein' },
  { name: 'Sukuti / Dry Meat', category: 'hi_protein' },
  { name: 'Himalayan Chhurpi (Hard Cheese)', category: 'hi_protein' },
  { name: 'Mixed Dry Fruits (Walnuts, Almonds, Kishmish)', category: 'hi_protein' },
  // Apps & Tech
  { name: 'Offline Topo Maps (Maps.me / OSM)', category: 'apps_tech' },
  { name: 'Compass App', category: 'apps_tech' },
  { name: 'Digital Altimeter & Barometer App', category: 'apps_tech' },
  { name: 'PeakLens (Himalayan Peak AR Finder)', category: 'apps_tech' },
  { name: 'Distance / Elevation Counter', category: 'apps_tech' },
  { name: 'Relive (3D Outdoor Video Journey)', category: 'apps_tech' },
  { name: 'Animal Identifier App', category: 'apps_tech' },
  { name: 'Bird Sound Identifier App', category: 'apps_tech' },
  { name: 'Flora & Plants Identifier App', category: 'apps_tech' },
  { name: 'Offline Songs & Audiobooks', category: 'apps_tech' },
  { name: 'Karaoke Tracks', category: 'apps_tech' },
  { name: 'Pre-activated Telecom Data Packs', category: 'apps_tech' },
  { name: 'Ncell / NTC Sim Card with Mountain Coverage', category: 'apps_tech' },
];

export function getRawItemsForTripType(tripType: TripType): RawItem[] {
  switch (tripType) {
    case 'day_hike':
      return DAY_HIKE_ITEMS;
    case 'night_camp':
      return NIGHT_CAMP_ITEMS;
    case 'short_trek':
      return SHORT_TREK_ITEMS;
    case 'long_trek':
    default:
      return LONG_TREK_ITEMS;
  }
}

export function generateDefaultChecklist(tripType: TripType): ChecklistItem[] {
  const raw = getRawItemsForTripType(tripType);
  return raw.map((item, index) => ({
    id: `chk-${tripType}-${index + 1}-${Math.random().toString(36).slice(2, 6)}`,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    isChecked: false,
    isCustom: false,
  }));
}

export function getChecklistStats(checklist: ChecklistItem[] = []) {
  const total = checklist.length;
  const packed = checklist.filter((item) => item.isChecked).length;
  const percentage = total > 0 ? Math.round((packed / total) * 100) : 0;
  return {
    total,
    packed,
    pending: total - packed,
    percentage,
  };
}

export function getTripTypeMeta(tripType?: TripType): TripTypeMeta {
  const match = TRIP_TYPES.find((t) => t.type === tripType);
  return match || TRIP_TYPES[3]; // default to long_trek
}
