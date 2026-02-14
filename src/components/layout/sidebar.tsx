"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: "◉" },
  { href: "/tasks", label: "Task Queue", icon: "☰" },
  { href: "/logs", label: "Logs", icon: "▤" },
  { href: "/mailbox", label: "Mailbox", icon: "✉" },
  { href: "/datasources", label: "Data Sources", icon: "⬡" },
  { href: "/models", label: "Models", icon: "◆" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex h-14 items-center gap-2 border-b border-zinc-800 px-4">
        <span className="text-lg font-bold text-blue-400">⬢</span>
        <span className="text-sm font-bold tracking-wide text-zinc-100">
          MISSION CONTROL
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <p className="text-xs text-zinc-600">Mission Control v0.1.0</p>
      </div>
    </aside>
  );
}
