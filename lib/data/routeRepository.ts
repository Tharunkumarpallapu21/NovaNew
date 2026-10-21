import AsyncStorage from "@react-native-async-storage/async-storage";
import { demoPois, demoReports, demoRoutes } from "@/lib/data/mockData";
import type { AppSettings, Poi, RoadReport, RouteOption } from "@/lib/domain/models";

const REPORTS_KEY = "contextroute.reports";
const SETTINGS_KEY = "contextroute.settings";

export type DataResult<T> = { data: T; source: "demo" | "cached"; liveAvailable: boolean };

export const routeRepository = {
  async getRoutes(): Promise<DataResult<RouteOption[]>> { await pause(450); return { data: demoRoutes, source: "demo", liveAvailable: false }; },
  async getPois(): Promise<DataResult<Poi[]>> { await pause(280); return { data: demoPois, source: "demo", liveAvailable: false }; },
  async getReports(): Promise<DataResult<RoadReport[]>> {
    const saved = await AsyncStorage.getItem(REPORTS_KEY);
    return { data: saved ? JSON.parse(saved) : demoReports, source: saved ? "cached" : "demo", liveAvailable: false };
  },
  async saveReport(report: RoadReport): Promise<void> {
    const current = await this.getReports();
    await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify([report, ...current.data]));
  },
  async getSettings(): Promise<AppSettings | null> { const raw = await AsyncStorage.getItem(SETTINGS_KEY); return raw ? JSON.parse(raw) : null; },
  async saveSettings(settings: AppSettings): Promise<void> { await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); },
};

function pause(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }
