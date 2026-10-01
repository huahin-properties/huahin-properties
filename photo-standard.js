// Browser-side mirror of functions/photo-standard.js (PHOTO MINIMUM STANDARD v1, LOCKED).
export const PHOTO_STANDARD = {
  land: { min: 1, target: 3 }, condo: { min: 2, target: 5 }, house: { min: 2, target: 6 },
  villa: { min: 2, target: 7 }, townhouse: { min: 2, target: 5 }, commercial: { min: 2, target: 5 },
};
export const DEFAULT_TYPE = "house";
export function photoStandardFor(type) { return PHOTO_STANDARD[type] || PHOTO_STANDARD[DEFAULT_TYPE]; }
