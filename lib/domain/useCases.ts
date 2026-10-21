import type { IssueType, Poi, Purpose, RoadReport, RouteOption, TravelerContext } from "@/lib/domain/models";

export const defaultContext: TravelerContext = { purpose: "COMMUTE", requirements: { senior: false, pregnant: false, patient: false, children: false, wheelchair: false }, weights: { time: 55, smoothness: 25, safety: 15, medical: 5, poi: 0 }, maxDetourKm: 5 };

export function contextForPurpose(purpose: Purpose, previous: TravelerContext): TravelerContext {
  const presets: Record<Purpose, TravelerContext["weights"]> = {
    COMMUTE: { time: 75, smoothness: 10, safety: 10, medical: 5, poi: 0 },
    VULNERABLE: { time: 15, smoothness: 40, safety: 20, medical: 15, poi: 10 },
    EMERGENCY: { time: 45, smoothness: 20, safety: 15, medical: 20, poi: 0 },
    TOURISM: { time: 20, smoothness: 20, safety: 15, medical: 5, poi: 40 },
    RELIGIOUS: { time: 20, smoothness: 20, safety: 15, medical: 5, poi: 40 },
  };
  return { ...previous, purpose, weights: presets[purpose] };
}

export function rankRoutes(routes: RouteOption[], context: TravelerContext): RouteOption[] {
  const scored = routes.map((route) => {
    const vulnerabilityBonus = context.requirements.pregnant || context.requirements.senior || context.requirements.wheelchair ? route.rsqi * 0.25 : 0;
    const emergencyBonus = context.purpose === "EMERGENCY" ? route.hospitals * 3 : 0;
    const poiBonus = context.weights.poi > 20 ? route.detourMinutes < context.maxDetourKm * 4 ? 8 : 0 : 0;
    const score = route.matchScore + vulnerabilityBonus + emergencyBonus + poiBonus - (context.weights.time > 60 ? route.etaMinutes / 30 : 0);
    return { ...route, matchScore: Math.min(99, Math.round(score)) };
  });
  return [...scored].sort((a, b) => b.matchScore - a.matchScore);
}

export function addPoiToRoute(route: RouteOption, poi: Poi): RouteOption {
  return { ...route, etaMinutes: route.etaMinutes + poi.detourMinutes, distanceKm: Number((route.distanceKm + poi.distanceKm / 2).toFixed(1)), explanation: `${route.explanation} Includes ${poi.name} as a ${poi.detourMinutes}-minute detour.` };
}

export function createRoadReport(type: IssueType, description: string, location = "Near MG Road, Bengaluru"): RoadReport {
  return { id: `#RPT-${Math.floor(100000 + Math.random() * 899999)}`, type, location, description: description || "Reported road issue from the ContextRoute app.", status: "SUBMITTED", createdAt: "Just now", demo: true };
}
