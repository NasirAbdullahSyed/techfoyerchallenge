"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, MapPin, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Countries",
    href: "/countries",
    icon: Globe,
    description: "Manage countries",
  },
  {
    name: "States",
    href: "/states",
    icon: MapPin,
    description: "Manage states & provinces",
  },
];

export function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-card/80">
      {/* Logo / Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
          <LayoutDashboard className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight truncate">GeoManager</p>
          <p className="text-[10px] text-muted-foreground truncate">Country & State Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Management
        </p>
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200", !isActive && "group-hover:scale-110")} />
              <div className="min-w-0 flex-1">
                <div className="truncate">{item.name}</div>
                {!isActive && (
                  <div className="text-[10px] text-muted-foreground/60 truncate leading-tight">
                    {item.description}
                  </div>
                )}
              </div>
              {isActive && (
                <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary-foreground/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4 shrink-0">
        <p className="text-[10px] text-muted-foreground/50 text-center">
          Techfoyer Challenge — 2026
        </p>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border">
      <SidebarContent />
    </aside>
  );
}
