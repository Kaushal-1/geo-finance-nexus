
// Market indices with historical data
export const marketIndices = [
  {
    id: "sp500",
    name: "S&P 500",
    current: 4783.83,
    change: 1.23,
    changePercent: 0.68,
    trend: "up",
    history: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      value: 4700 + Math.random() * 200
    }))
  },
  {
    id: "nasdaq",
    name: "NASDAQ",
    current: 16769.33,
    change: -32.27,
    changePercent: -0.19,
    trend: "down",
    history: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      value: 16500 + Math.random() * 500
    }))
  },
  {
    id: "dow",
    name: "Dow Jones",
    current: 38097.83,
    change: 153.72,
    changePercent: 0.41,
    trend: "up",
    history: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      value: 37800 + Math.random() * 400
    }))
  },
  {
    id: "ftse",
    name: "FTSE 100",
    current: 7683.96,
    change: -27.54,
    changePercent: -0.36,
    trend: "down",
    history: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      value: 7600 + Math.random() * 200
    }))
  },
  {
    id: "nikkei",
    name: "Nikkei 225",
    current: 38487.90,
    change: 276.89,
    changePercent: 0.72,
    trend: "up",
    history: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      value: 38200 + Math.random() * 500
    }))
  }
];

// Financial centers with coordinates
export const financialCenters = [
  {
    id: "nyc",
    name: "New York",
    coordinates: [-74.0060, 40.7128],
    significance: 0.95,
    marketStatus: "open",
    performance: 0.68,
    region: "North America"
  },
  {
    id: "london",
    name: "London",
    coordinates: [-0.1276, 51.5074],
    significance: 0.9,
    marketStatus: "closed",
    performance: -0.36,
    region: "Europe"
  },
  {
    id: "tokyo",
    name: "Tokyo",
    coordinates: [139.6503, 35.6762],
    significance: 0.85,
    marketStatus: "closed",
    performance: 0.72,
    region: "Asia"
  },
  {
    id: "shanghai",
    name: "Shanghai",
    coordinates: [121.4737, 31.2304],
    significance: 0.8,
    marketStatus: "closed",
    performance: -0.54,
    region: "Asia"
  },
  {
    id: "hongkong",
    name: "Hong Kong",
    coordinates: [114.1694, 22.3193],
    significance: 0.82,
    marketStatus: "closed",
    performance: 0.31,
    region: "Asia"
  },
  {
    id: "frankfurt",
    name: "Frankfurt",
    coordinates: [8.6821, 50.1109],
    significance: 0.78,
    marketStatus: "closed",
    performance: -0.22,
    region: "Europe"
  },
  {
    id: "sydney",
    name: "Sydney",
    coordinates: [151.2093, -33.8688],
    significance: 0.75,
    marketStatus: "open",
    performance: 0.15,
    region: "Oceania"
  },
  {
    id: "singapore",
    name: "Singapore",
    coordinates: [103.8198, 1.3521],
    significance: 0.76,
    marketStatus: "closed",
    performance: -0.08,
    region: "Asia"
  },
  {
    id: "toronto",
    name: "Toronto",
    coordinates: [-79.3832, 43.6532],
    significance: 0.72,
    marketStatus: "open",
    performance: 0.45,
    region: "North America"
  },
  {
    id: "dubai",
    name: "Dubai",
    coordinates: [55.2708, 25.2048],
    significance: 0.70,
    marketStatus: "closed",
    performance: 0.87,
    region: "Middle East"
  }
];

// Timeline events with financial significance
export const timelineEvents = [
  {
    id: "fed-rate-hike",
    date: new Date("2025-05-10"),
    title: "Fed Rate Hike",
    description: "Federal Reserve increases interest rates by 0.25%",
    significance: "high",
    regions: ["North America", "Global"],
    impact: -0.3
  },
  {
    id: "ecb-policy",
    date: new Date("2025-05-08"),
    title: "ECB Policy Change",
    description: "European Central Bank announces new quantitative easing measures",
    significance: "medium",
    regions: ["Europe"],
    impact: 0.4
  },
  {
    id: "china-gdp",
    date: new Date("2025-05-05"),
    title: "China GDP Report",
    description: "China reports 5.2% GDP growth, exceeding expectations",
    significance: "high",
    regions: ["Asia"],
    impact: 0.7
  },
  {
    id: "uk-inflation",
    date: new Date("2025-05-03"),
    title: "UK Inflation Data",
    description: "UK inflation reaches 3.8%, higher than projected",
    significance: "medium",
    regions: ["Europe"],
    impact: -0.2
  },
  {
    id: "jpn-stimulus",
    date: new Date("2025-04-28"),
    title: "Japan Stimulus Package",
    description: "Japan announces $200 billion economic stimulus package",
    significance: "high",
    regions: ["Asia"],
    impact: 0.9
  }
];

// Regional market performance data
export const regionalPerformance = [
  { region: "North America", performance: 0.57, trend: "up" },
  { region: "Europe", performance: -0.29, trend: "down" },
  { region: "Asia", performance: 0.31, trend: "up" },
  { region: "Latin America", performance: -0.48, trend: "down" },
  { region: "Middle East", performance: 0.87, trend: "up" },
  { region: "Africa", performance: -0.12, trend: "down" },
  { region: "Oceania", performance: 0.15, trend: "up" }
];
