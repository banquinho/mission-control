export interface AppSettings {
  theme: "dark" | "system";
  notifications: boolean;
  timezone: string;
}

export interface OpenClawSettings {
  mode: "mock" | "live";
  sshHost?: string;
  sshPort?: number;
  remoteCwd?: string;
  timeoutMs?: number;
  cliPrefix?: string;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: "dark",
  notifications: true,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};
