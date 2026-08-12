import { redis } from "../lib/db";
import type { ProjectionSettings } from "../lib/types";

const PROJECTION_SETTINGS_KEY = "projection:settings";

const DEFAULT_SETTINGS: ProjectionSettings = {
  currentAge: 40,
  targetAge: 60,
  startingCapital: 0,
  monthlyContribution: 0,
  annualReturn: 8,
  startDate: new Date().toISOString().slice(0, 7),
  monthlyContributions: {},
  updatedAt: new Date().toISOString(),
};

export type ProjectionSettingsInput = Omit<ProjectionSettings, "updatedAt">;

export class ProjectionService {
  async getSettings(): Promise<ProjectionSettings> {
    const saved = await redis.get<Partial<ProjectionSettings>>(PROJECTION_SETTINGS_KEY);
    return { ...DEFAULT_SETTINGS, ...saved, monthlyContributions: saved?.monthlyContributions ?? {} };
  }

  async saveSettings(input: ProjectionSettingsInput): Promise<ProjectionSettings> {
    const settings: ProjectionSettings = {
      ...input,
      updatedAt: new Date().toISOString(),
    };
    await redis.set(PROJECTION_SETTINGS_KEY, settings);
    return settings;
  }

  async resetSettings(): Promise<ProjectionSettings> {
    await redis.del(PROJECTION_SETTINGS_KEY);
    return this.getSettings();
  }
}

export const projectionService = new ProjectionService();
