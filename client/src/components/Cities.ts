export type City = {
  name: string;
  lat: number;
  lon: number;
};

export type CitiesByState = {
  [key: string]: City[];
};

export const cities: CitiesByState = {
  "California": [
    { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
    { name: "San Francisco", lat: 37.7749, lon: -122.4194 },
  ],
  "New York": [
    { name: "New York City", lat: 40.7128, lon: -74.006 },
    { name: "Buffalo", lat: 42.8864, lon: -78.8784 },
  ],
  "Texas": [
    { name: "Houston", lat: 29.7604, lon: -95.3698 },
    { name: "Dallas", lat: 32.7767, lon: -96.797 },
  ],
  "Florida": [
    { name: "Miami", lat: 25.7617, lon: -80.1918 },
    { name: "Orlando", lat: 28.5383, lon: -81.3792 },
  ],
  "Illinois": [
    { name: "Chicago", lat: 41.8781, lon: -87.6298 },
  ],
  "British Columbia": [
    { name: "Vancouver", lat: 49.2827, lon: -123.1207 },
  ],
  "Ontario": [
    { name: "Toronto", lat: 43.6510, lon: -79.3470 },
    { name: "Montreal", lat: 45.5017, lon: -73.5673 },
  ],
};
