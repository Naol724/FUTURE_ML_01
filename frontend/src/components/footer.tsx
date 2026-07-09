import { TrendingUp } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-accent" aria-hidden="true" />
          <span className="font-display font-semibold text-foreground">Forecastly</span>
          <span aria-hidden="true">·</span>
          <span>Future Interns — ML Task 01</span>
        </div>
        <nav className="flex items-center gap-4" aria-label="Footer navigation">
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/about" className="hover:text-foreground">
            Methodology
          </Link>
          <a
            href="https://github.com/Naol724/FUTURE_ML_01"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
