import { useCallback, useEffect, useMemo, useState } from "react";
import * as Location from "expo-location";
import {
  contextForPurpose,
  createRoadReport,
  defaultContext,
  rankRoutes,
  addPoiToRoute,
} from "@/lib/domain/useCases";
import { routeRepository } from "@/lib/data/routeRepository";
import type {
  AppSettings,
  IssueType,
  Poi,
  RoadReport,
  RouteOption,
  Screen,
  TravelerContext,
} from "@/lib/domain/models";

const defaultSettings: AppSettings = {
  darkMode: false,
  accessibilityMode: false,
  voiceGuidance: true,
  offlineMode: false,
  locationPermission: "unknown",
};

export function useContextRouteViewModel() {
  const [screen, setScreen] = useState<Screen>("planner");
  const [onboarding, setOnboarding] = useState(true);
  const [permissionVisible, setPermissionVisible] = useState(true);
  const [origin, setOrigin] = useState("Current Location");
  const [destination, setDestination] = useState("Bengaluru, Karnataka");
  const [context, setContext] = useState<TravelerContext>(defaultContext);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [pois, setPois] = useState<Poi[]>([]);
  const [reports, setReports] = useState<RoadReport[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<string[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [busy, setBusy] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [poisLoading, setPoisLoading] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [poisError, setPoisError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [dataLabel, setDataLabel] = useState(
    "Demo data · Live routing provider not configured",
  );

  const loadPois = useCallback(async () => {
    setPoisLoading(true);
    setPoisError(null);
    try {
      const result = await routeRepository.getPois();
      setPois(result.data);
    } catch {
      setPoisError("We couldn't load places along this corridor.");
    } finally {
      setPoisLoading(false);
    }
  }, []);
  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    setReportsError(null);
    try {
      const result = await routeRepository.getReports();
      setReports(result.data);
    } catch {
      setReportsError("We couldn't load your saved reports.");
    } finally {
      setReportsLoading(false);
    }
  }, []);
  useEffect(() => {
    void (async () => {
      const [savedSettings, places] = await Promise.all([
        routeRepository.getSettings(),
        routeRepository.getSavedPlaces(),
      ]);
      if (savedSettings) {
        setSettings(savedSettings);
        setOffline(savedSettings.offlineMode);
      }
      setSavedPlaces(places);
    })();
    void loadPois();
    void loadReports();
  }, [loadPois, loadReports]);

  const go = useCallback((next: Screen) => {
    setError(null);
    setScreen(next);
  }, []);
  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      void routeRepository.saveSettings(next);
      return next;
    });
  }, []);
  const choosePurpose = useCallback(
    (purpose: TravelerContext["purpose"]) =>
      setContext((current) => contextForPurpose(purpose, current)),
    [],
  );
  const toggleRequirement = useCallback(
    (key: keyof TravelerContext["requirements"]) =>
      setContext((current) => ({
        ...current,
        requirements: {
          ...current.requirements,
          [key]: !current.requirements[key],
        },
      })),
    [],
  );
  const adjustWeight = useCallback(
    (key: keyof TravelerContext["weights"], delta: number) =>
      setContext((current) => ({
        ...current,
        weights: {
          ...current.weights,
          [key]: Math.max(0, Math.min(100, current.weights[key] + delta)),
        },
      })),
    [],
  );
  const adjustDetour = useCallback(
    (delta: number) =>
      setContext((current) => ({
        ...current,
        maxDetourKm: Math.max(1, Math.min(15, current.maxDetourKm + delta)),
      })),
    [],
  );
  const calculateRoutes = useCallback(
    async (overrideContext?: TravelerContext) => {
      const activeContext = overrideContext ?? context;
      if (!origin.trim() || !destination.trim()) {
        setError("Enter both an origin and destination to plan a route.");
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const result = await routeRepository.getRoutes(origin, destination);
        const ranked = rankRoutes(result.data, activeContext).map((route) => ({
          ...route,
          explanation: `${route.explanation} Trip: ${origin} to ${destination}.`,
        }));
        setRoutes(ranked);
        setSelectedRoute(ranked[0]);
        setDataLabel(
          result.liveAvailable
            ? "Live provider data"
            : `Demo data · ${origin} → ${destination} · Live routing provider not configured`,
        );
        go("routes");
      } catch {
        setError("We couldn't load the route. Please try again.");
      } finally {
        setBusy(false);
      }
    },
    [context, origin, destination, go],
  );
  const calculateEmergencyRoutes = useCallback(async () => {
    const emergencyContext = contextForPurpose("EMERGENCY", context);
    setContext(emergencyContext);
    await calculateRoutes(emergencyContext);
  }, [calculateRoutes, context]);
  const selectRoute = useCallback(
    (route: RouteOption) => setSelectedRoute(route),
    [],
  );
  const addStop = useCallback((poi: Poi) => {
    setSelectedRoute((current) => {
      if (!current) {
        setError("Select a route before adding a stop.");
        return current;
      }
      const updated = addPoiToRoute(current, poi);
      setRoutes((items) =>
        items.map((item) => (item.id === current.id ? updated : item)),
      );
      return updated;
    });
  }, []);
  const submitReport = useCallback(
    async (type: IssueType, description: string, location?: string) => {
      const report = createRoadReport(type, description, location);
      try {
        await routeRepository.saveReport(report);
        setReports((current) => [report, ...current]);
        go("reports");
      } catch {
        setReportsError(
          "Saved offline — will sync automatically when connection restores.",
        );
        setReports((current) => [report, ...current]);
        go("reports");
      }
    },
    [go],
  );
  const requestLocation = useCallback(
    async (allowed: boolean) => {
      if (!allowed) {
        updateSettings({ locationPermission: "denied" });
        setPermissionVisible(false);
        return;
      }
      try {
        const result = await Location.requestForegroundPermissionsAsync();
        const granted = result.status === "granted";
        updateSettings({ locationPermission: granted ? "granted" : "denied" });
        setPermissionVisible(false);
      } catch {
        updateSettings({ locationPermission: "denied" });
        setPermissionVisible(false);
      }
    },
    [updateSettings],
  );
  const selectSavedPlace = useCallback(
    (place: string) => {
      setDestination(place.includes(" · ") ? place.split(" · ")[1] : place);
      go("planner");
    },
    [go],
  );
  const ranked = useMemo(() => rankRoutes(routes, context), [routes, context]);

  return {
    screen,
    go,
    onboarding,
    setOnboarding,
    permissionVisible,
    setPermissionVisible,
    requestLocation,
    origin,
    setOrigin,
    destination,
    setDestination,
    context,
    choosePurpose,
    toggleRequirement,
    adjustWeight,
    adjustDetour,
    routes: ranked,
    selectedRoute,
    selectRoute,
    addStop,
    pois,
    loadPois,
    poisLoading,
    poisError,
    reports,
    loadReports,
    reportsLoading,
    reportsError,
    selectSavedPlace,
    savedPlaces,
    submitReport,
    settings,
    updateSettings,
    busy,
    error,
    setError,
    offline,
    setOffline,
    dataLabel,
    calculateRoutes,
    calculateEmergencyRoutes,
  };
}
