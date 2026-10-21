import { describe, expect, it } from "vitest";
import { demoRoutes } from "../lib/data/mockData";
import { contextForPurpose, createRoadReport, defaultContext, rankRoutes } from "../lib/domain/useCases";

describe("ContextRoute domain use cases", () => {
  it("prioritizes smooth routes for vulnerable travelers", () => {
    const context = contextForPurpose("VULNERABLE", defaultContext);
    const ranked = rankRoutes(demoRoutes, { ...context, requirements: { ...context.requirements, pregnant: true } });
    expect(ranked[0].id).toBe("comfort");
    expect(ranked[0].rsqi).toBeGreaterThan(ranked.at(-1)!.rsqi);
  });

  it("creates a local-first road report", () => {
    const report = createRoadReport("POTHOLE", "Large pothole near the turn");
    expect(report.id).toMatch(/^#RPT-/);
    expect(report.status).toBe("SUBMITTED");
    expect(report.demo).toBe(true);
  });
});
