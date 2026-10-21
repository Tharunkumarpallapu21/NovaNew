import type { Poi, RoadReport, RouteOption } from "@/lib/domain/models";

export const DEMO_DATA_LABEL = "Demo data · Live routing provider not configured";

export const demoRoutes: RouteOption[] = [
  { id: "comfort", title: "Comfort & safety first", etaMinutes: 135, distanceKm: 78, rsqi: 94, hazards: 2, constructionZones: 0, hospitals: 4, restStops: 3, matchScore: 96, detourMinutes: 7, segments: [94, 96, 91, 95, 97, 92], badge: "Recommended", explanation: "Avoids 11 severe pothole clusters and active construction. Adds 7 min while improving road smoothness by 38%.", },
  { id: "balanced", title: "Balanced corridor", etaMinutes: 131, distanceKm: 76, rsqi: 82, hazards: 6, constructionZones: 1, hospitals: 3, restStops: 2, matchScore: 84, detourMinutes: 3, segments: [84, 79, 88, 80, 82, 85], badge: "Balanced", explanation: "A practical trade-off with moderate road quality and one minor construction zone.", },
  { id: "fastest", title: "Fastest conventional", etaMinutes: 128, distanceKm: 74, rsqi: 61, hazards: 14, constructionZones: 2, hospitals: 1, restStops: 1, matchScore: 62, detourMinutes: 0, segments: [68, 54, 47, 65, 59, 71], badge: "Fastest", explanation: "Shortest ETA, but crosses 14 severe pothole clusters and two active works zones.", },
];

export const demoPois: Poi[] = [
  { id: "labagh", name: "Lalbagh Botanical Garden", category: "SCENIC", rating: 4.2, distanceKm: 5.3, detourMinutes: 12, accessible: true, subtitle: "Park & garden · senior friendly" },
  { id: "temple", name: "ISKCON Temple", category: "TEMPLE", rating: 4.5, distanceKm: 6.2, detourMinutes: 18, accessible: true, subtitle: "Temple · accessible entry" },
  { id: "vidhana", name: "Vidhana Soudha", category: "HERITAGE", rating: 4.4, distanceKm: 6.8, detourMinutes: 16, accessible: false, subtitle: "Historical landmark" },
  { id: "rest", name: "CleanCare Rest Stop", category: "REST", rating: 4.3, distanceKm: 2.1, detourMinutes: 4, accessible: true, subtitle: "Accessible restroom · fuel" },
  { id: "hospital", name: "CityCare Emergency Hospital", category: "HOSPITAL", rating: 4.6, distanceKm: 2.3, detourMinutes: 0, accessible: true, subtitle: "24/7 emergency · trauma support" },
];

export const demoReports: RoadReport[] = [
  { id: "#RPT-2024-001", type: "POTHOLE", location: "Near MG Road, Bengaluru", description: "Large pothole on the left side of the road.", status: "UNDER_REVIEW", createdAt: "Today · 10:24 AM", demo: true },
];
