"use client";

import { usePathname } from "next/navigation";
import { Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

const pageTitles: Record<string, string> = {
  "/countries": "Countries",
  "/states": "States",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];

  if (pathname.includes("/countries/") && pathname.includes("/edit"))
    return "Edit Country";
  if (pathname.includes("/states/") && pathname.includes("/edit"))
    return "Edit State";
  if (pathname.includes("/countries/new")) return "Add Country";
  if (pathname.includes("/states/new")) return "Add State";

  const segment = pathname.split("/").filter(Boolean)[0];
  return segment
    ? segment.charAt(0).toUpperCase() + segment.slice(1)
    : "Dashboard";
}

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-6">
      {/* Mobile menu button */}
      <Sheet>
        <SheetTrigger
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Page title */}
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="rounded-full"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </header>
  );
}
