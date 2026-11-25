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
    id: "scotland",
    city: "Scotland",
    country: "United Kingdom",
    timeZone: "Europe/London",
    address: ["Scotland, United Kingdom"], // full street address to be supplied
    coordinates: { lat: 55.9, lng: -3.6 },
  },
  {
    id: "texas",
    city: "Texas",
    country: "United States",
    timeZone: "America/Chicago", // Central time (most of Texas)
    address: ["Texas, United States"], // full street address to be supplied
    coordinates: { lat: 31.0, lng: -99.3 },
  },
];
