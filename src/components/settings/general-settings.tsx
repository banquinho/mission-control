"use client";

import { useEffect, useState } from "react";
import { type AppSettings, DEFAULT_APP_SETTINGS } from "@/types/settings";

const STORAGE_KEY = "mission-control-settings";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
  "Pacific/Auckland",
];

function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_APP_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_APP_SETTINGS;
}

function saveSettings(settings: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-200 outline-none transition-colors hover:border-zinc-700 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500";

export function GeneralSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  function handleSave() {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-zinc-100">
        General Preferences
      </h2>
      <p className="mt-0.5 text-xs text-zinc-500">
        These preferences are stored locally in your browser.
      </p>

      <div className="mt-5 space-y-5">
        <Field label="Theme">
          <select
            className={inputClass}
            value={settings.theme}
            onChange={(e) =>
              setSettings({
                ...settings,
                theme: e.target.value as AppSettings["theme"],
              })
            }
          >
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </Field>

        <Field label="Timezone">
          <select
            className={inputClass}
            value={settings.timezone}
            onChange={(e) =>
              setSettings({ ...settings, timezone: e.target.value })
            }
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </Field>

        <label className="flex items-center gap-3 cursor-pointer">
          <span
            role="switch"
            aria-checked={settings.notifications}
            onClick={() =>
              setSettings({
                ...settings,
                notifications: !settings.notifications,
              })
            }
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
              settings.notifications ? "bg-zinc-100" : "bg-zinc-700"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full transition-transform ${
                settings.notifications
                  ? "translate-x-[18px] bg-zinc-950"
                  : "translate-x-[3px] bg-zinc-400"
              }`}
            />
          </span>
          <span className="text-sm text-zinc-300">Enable notifications</span>
        </label>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSave}
          className="rounded-md bg-zinc-100 px-3.5 py-1.5 text-xs font-medium text-zinc-950 transition-colors hover:bg-white"
        >
          Save
        </button>
        {saved && (
          <span className="text-xs text-zinc-500">Preferences saved.</span>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-zinc-400">{label}</label>
      {children}
    </div>
  );
}
