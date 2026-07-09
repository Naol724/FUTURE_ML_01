"use client";

import { Menu, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/about", label: "Methodology" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-bold"
          aria-label="Forecastly home"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-navy text-accent dark:bg-accent-soft">
            <TrendingUp className="size-4" aria-hidden="true" />
          </span>
          Forecastly
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-accent-soft text-accent"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-muted md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="animate-fade-in border-t border-border bg-background px-6 py-3 md:hidden"
          aria-label="Mobile navigation"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm font-medium",
                pathname === link.href
                  ? "bg-accent-soft text-accent"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
