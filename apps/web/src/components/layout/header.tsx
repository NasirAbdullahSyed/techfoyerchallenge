"use client";

import { usePathname } from "next/navigation";
import { Moon, Sun, Menu, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { SidebarContent } from "./sidebar";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname.includes("/countries/") && pathname.includes("/edit"))
    return [{ label: "Countries", href: "/countries" }, { label: "Edit Country" }];
  if (pathname.includes("/states/") && pathname.includes("/edit"))
    return [{ label: "States", href: "/states" }, { label: "Edit State" }];
  if (pathname === "/countries/new")
    return [{ label: "Countries", href: "/countries" }, { label: "New Country" }];
  if (pathname === "/states/new")
    return [{ label: "States", href: "/states" }, { label: "New State" }];
  if (pathname === "/countries") return [{ label: "Countries" }];
  if (pathname === "/states") return [{ label: "States" }];

  const segment = pathname.split("/").filter(Boolean)[0];
  return [{ label: segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "Dashboard" }];
}

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const breadcrumbs = getBreadcrumbs(pathname);
  const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.label ?? "Dashboard";

  return (
    <header className="flex h-16 items-center gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-4 md:px-6 shrink-0">
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
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            )}
            {i === breadcrumbs.length - 1 ? (
              <span className="font-semibold text-foreground truncate">
                {crumb.label}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      <Separator orientation="vertical" className="h-5 hidden sm:block" />

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="rounded-full shrink-0"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </header>
  );
}

// Keep pageTitle accessible for screen readers if needed
export { getBreadcrumbs };
