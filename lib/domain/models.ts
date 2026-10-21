export type Purpose = "COMMUTE" | "VULNERABLE" | "EMERGENCY" | "TOURISM" | "RELIGIOUS";
export type IssueType = "POTHOLE" | "CONSTRUCTION" | "WATERLOGGING" | "ACCIDENT" | "BLOCKED_ROAD" | "STREETLIGHT";
export type ReportStatus = "SUBMITTED" | "UNDER_REVIEW" | "VERIFIED";
export type Screen = "planner" | "routes" | "navigate" | "explore" | "reports" | "saved" | "profile";

export type PassengerRequirements = {
  senior: boolean;
  pregnant: boolean;
  patient: boolean;
  children: boolean;
  wheelchair: boolean;
};

export type TravelerContext = {
  purpose: Purpose;
  requirements: PassengerRequirements;
  weights: { time: number; smoothness: number; safety: number; medical: number; poi: number };
  maxDetourKm: number;
};

export type RouteOption = {
  id: string;
  title: string;
  etaMinutes: number;
  distanceKm: number;
  rsqi: number;
  hazards: number;
  constructionZones: number;
  hospitals: number;
  restStops: number;
  matchScore: number;
  detourMinutes: number;
  segments: number[];
  explanation: string;
  badge: string;
};

export type Poi = {
  id: string;
  name: string;
  category: "TEMPLE" | "SCENIC" | "HERITAGE" | "REST" | "HOSPITAL";
  rating: number;
  distanceKm: number;
  detourMinutes: number;
  accessible: boolean;
  subtitle: string;
};

export type RoadReport = {
  id: string;
  type: IssueType;
  location: string;
  description: string;
  status: ReportStatus;
  createdAt: string;
  demo: boolean;
};

export type AppSettings = {
  darkMode: boolean;
  accessibilityMode: boolean;
  voiceGuidance: boolean;
  offlineMode: boolean;
  locationPermission: "unknown" | "granted" | "denied";
};
