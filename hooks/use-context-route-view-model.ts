import { useCallback, useEffect, useMemo, useState } from "react";
import { contextForPurpose, createRoadReport, defaultContext, rankRoutes, addPoiToRoute } from "@/lib/domain/useCases";
import { routeRepository } from "@/lib/data/routeRepository";
import type { AppSettings, IssueType, Poi, RoadReport, RouteOption, Screen, TravelerContext } from "@/lib/domain/models";

const defaultSettings: AppSettings = { darkMode: false, accessibilityMode: false, voiceGuidance: true, offlineMode: false, locationPermission: "unknown" };

export function useContextRouteViewModel() {
  const [screen, setScreen] = useState<Screen>("planner");
  const [onboarding, setOnboarding] = useState(true);
  const [permissionVisible, setPermissionVisible] = useState(false);
  const [origin, setOrigin] = useState("Current Location");
  const [destination, setDestination] = useState("Bengaluru, Karnataka");
  const [context, setContext] = useState<TravelerContext>(defaultContext);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [pois, setPois] = useState<Poi[]>([]);
  const [reports, setReports] = useState<RoadReport[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [dataLabel, setDataLabel] = useState("Demo data · Live routing provider not configured");

  useEffect(() => { void (async () => { const [poiResult, reportResult, savedSettings] = await Promise.all([routeRepository.getPois(), routeRepository.getReports(), routeRepository.getSettings()]); setPois(poiResult.data); setReports(reportResult.data); if (savedSettings) setSettings(savedSettings); })(); }, []);

  const go = useCallback((next: Screen) => { setError(null); setScreen(next); }, []);
  const updateSettings = useCallback((patch: Partial<AppSettings>) => { setSettings((current) => { const next = { ...current, ...patch }; void routeRepository.saveSettings(next); return next; }); }, []);
  const choosePurpose = useCallback((purpose: TravelerContext["purpose"]) => setContext((current) => contextForPurpose(purpose, current)), []);
  const toggleRequirement = useCallback((key: keyof TravelerContext["requirements"]) => setContext((current) => ({ ...current, requirements: { ...current.requirements, [key]: !current.requirements[key] } })), []);
  const calculateRoutes = useCallback(async () => { setBusy(true); setError(null); try { const result = await routeRepository.getRoutes(); const ranked = rankRoutes(result.data, context); setRoutes(ranked); setSelectedRoute(ranked[0]); setDataLabel(result.liveAvailable ? "Live provider data" : "Demo data · Live routing provider not configured"); go("routes"); } catch { setError("We couldn't load the route. Please try again."); } finally { setBusy(false); } }, [context, go]);
  const selectRoute = useCallback((route: RouteOption) => { setSelectedRoute(route); }, []);
  const addStop = useCallback((poi: Poi) => { setSelectedRoute((current) => current ? addPoiToRoute(current, poi) : current); }, []);
  const submitReport = useCallback(async (type: IssueType, description: string) => { const report = createRoadReport(type, description); await routeRepository.saveReport(report); setReports((current) => [report, ...current]); go("reports"); }, [go]);
  const requestLocation = useCallback((allowed: boolean) => { updateSettings({ locationPermission: allowed ? "granted" : "denied" }); setPermissionVisible(false); }, [updateSettings]);
  const ranked = useMemo(() => rankRoutes(routes, context), [routes, context]);

  return { screen, go, onboarding, setOnboarding, permissionVisible, setPermissionVisible, requestLocation, origin, setOrigin, destination, setDestination, context, choosePurpose, toggleRequirement, routes: ranked, selectedRoute, selectRoute, pois, addStop, reports, submitReport, settings, updateSettings, busy, error, setError, offline, setOffline, dataLabel, calculateRoutes };
}
