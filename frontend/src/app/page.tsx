import {
  ArrowRight,
  BarChart3,
  Download,
  Gauge,
  LineChart,
  ShieldCheck,
  UploadCloud,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const valueProps = [
  {
    icon: Gauge,
    title: "Accuracy you can verify",
    body: "Every forecast ships with MAE, RMSE and R² computed on a strict out-of-time holdout — no cherry-picked numbers.",
  },
  {
    icon: Zap,
    title: "Automation end-to-end",
    body: "Upload a CSV and the pipeline handles preprocessing, feature engineering, training and evaluation automatically.",
  },
  {
    icon: Download,
    title: "Exportable reports",
    body: "Download the full forecast as a business-ready CSV, or export the interactive chart as a PNG for slide decks.",
  },
];

const steps = [
  {
    icon: UploadCloud,
    title: "1. Upload your history",
    body: "Drag in a CSV of historical sales (date, store, promotions, sales). We validate the schema before anything is sent.",
  },
  {
    icon: LineChart,
    title: "2. Train the model",
    body: "A Random Forest ensemble learns seasonality, promotion effects and store-level patterns from your data.",
  },
  {
    icon: BarChart3,
    title: "3. Act on the forecast",
    body: "Explore actual vs. predicted demand per store, review error metrics, and export everything your team needs.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="grid-backdrop relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b from-accent/10 via-transparent to-transparent"
          aria-hidden="true"
        />
        <div className="container relative flex flex-col items-center py-20 text-center md:py-28">
          <Badge variant="accent" className="animate-fade-up mb-6">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Chronologically validated forecasts
          </Badge>
          <h1 className="animate-fade-up max-w-3xl text-4xl font-bold leading-tight md:text-6xl [animation-delay:80ms]">
            AI-powered sales &amp; demand forecasting{" "}
            <span className="bg-gradient-to-r from-accent to-navy bg-clip-text text-transparent dark:to-accent/50">
              for businesses
            </span>
          </h1>
          <p className="animate-fade-up mt-6 max-w-2xl text-lg text-muted-foreground [animation-delay:160ms]">
            Turn historical sales data into reliable demand forecasts. Upload a CSV, train an
            ensemble model in seconds, and plan inventory, staffing and budgets with confidence.
          </p>
          <div className="animate-fade-up mt-10 flex flex-col items-center gap-3 sm:flex-row [animation-delay:240ms]">
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-7 text-base font-semibold text-accent-foreground shadow-glow transition-all hover:brightness-110"
            >
              Start forecasting
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/about"
              className="inline-flex h-12 items-center rounded-xl border border-border bg-card px-7 text-base font-medium transition-colors hover:bg-muted"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="container py-16 md:py-20" aria-labelledby="value-props-heading">
        <h2 id="value-props-heading" className="sr-only">
          Why Forecastly
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {valueProps.map((prop) => (
            <Card key={prop.title} className="group hover:shadow-card-hover">
              <CardContent className="p-6">
                <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent transition-transform duration-300 group-hover:scale-110">
                  <prop.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mb-2 text-lg font-semibold">{prop.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{prop.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-surface py-16 md:py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">From spreadsheet to forecast</h2>
            <p className="mt-3 text-muted-foreground">
              Three steps. No data science team required.
            </p>
          </div>
          <ol className="grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <li key={step.title} className="rounded-2xl border border-border bg-card p-6">
                <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-navy text-accent">
                  <step.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16 md:py-24">
        <div className="grid-backdrop relative overflow-hidden rounded-2xl bg-navy px-6 py-14 text-center text-navy-foreground md:py-20">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-accent/20 via-transparent to-transparent"
            aria-hidden="true"
          />
          <h2 className="relative text-3xl font-bold md:text-4xl">Ready to see your forecast?</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-navy-foreground/70">
            Upload your first dataset and get store-level demand predictions with transparent
            accuracy metrics in minutes.
          </p>
          <Link
            href="/dashboard"
            className="relative mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-7 text-base font-semibold text-accent-foreground transition-all hover:brightness-110"
          >
            Open the dashboard
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
