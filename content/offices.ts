import type { Office } from "./types";

export const offices: Office[] = [
  {
    id: "karachi",
    city: "Karachi",
    country: "Pakistan",
    timeZone: "Asia/Karachi",
    address: [
      "Suite # 508, 5th Floor",
      "Shayan Iconic Towers",
      "Shaheed e Millat Rd, Karachi",
    ],
    isHeadquarters: true,
    // Approximate (Shaheed e Millat Rd). Verify against the exact building before launch.
    coordinates: { lat: 24.8762, lng: 67.0727 },
  },
  {
    id: "london",
    city: "London",
    country: "United Kingdom",
    timeZone: "Europe/London",
    address: null, // PLACEHOLDER: address to be supplied
    coordinates: { lat: 51.5072, lng: -0.1276 },
  },
  {
    id: "new-york",
    city: "New York",
    country: "United States",
    timeZone: "America/New_York",
    address: null, // PLACEHOLDER: address to be supplied
    coordinates: { lat: 40.7128, lng: -74.006 },
  },
];
