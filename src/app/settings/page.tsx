import { ConnectionSettings } from "@/components/settings/connection-settings";
import { GeneralSettings } from "@/components/settings/general-settings";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
        Settings
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Manage your connection and application preferences.
      </p>

      <div className="mt-8">
        <ConnectionSettings />
      </div>

      <hr className="my-8 border-zinc-800" />

      <GeneralSettings />
    </div>
  );
}
