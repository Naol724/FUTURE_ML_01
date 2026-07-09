import { CalendarClock, Layers, Network, Ruler, Split, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How the Forecastly sales forecasting model works, in plain language.",
};

const pillars = [
  {
    icon: Split,
    title: "Chronological validation",
    body: "The data is split by time, never randomly: the model trains only on the past and is graded only on the future. This mirrors how a forecast is actually used in a business and prevents the model from 'peeking ahead', which is the most common way forecasting projects overstate their accuracy.",
  },
  {
    icon: CalendarClock,
    title: "Temporal feature engineering",
    body: "Raw dates are turned into signals the model can learn from — year, month, day of week — alongside store number and how many items were on promotion. This lets the model pick up weekly rhythms, seasonal swings and promotion-driven spikes.",
  },
  {
    icon: Network,
    title: "Ensemble model (Random Forest)",
    body: "Instead of relying on a single decision tree, the model trains dozens of trees on different views of the data and averages their answers. Individual trees make individual mistakes; the ensemble cancels them out, giving stable predictions without heavy manual tuning.",
  },
  {
    icon: Ruler,
    title: "Honest, business-standard metrics",
    body: "Every run reports MAE (average units missed), RMSE (which punishes large misses) and R² (how much of the sales variation is explained). All three are computed exclusively on future data the model never saw during training.",
  },
];

export default function AboutPage() {
  return (
    <div className="container max-w-4xl py-10 md:py-14">
      <div className="mb-10">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
          <Layers className="size-3.5" aria-hidden="true" />
          Methodology
        </p>
        <h1 className="text-3xl font-bold md:text-5xl">
          How the forecast is built
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Forecastly wraps a production machine-learning pipeline originally developed for the
          Kaggle “Store Sales — Time Series Forecasting” dataset. Here's what happens between
          uploading a CSV and seeing a forecast, explained without the jargon.
        </p>
      </div>

      <ol className="relative mb-12 space-y-6 border-l-2 border-border pl-6">
        {[
          {
            step: "Ingest & clean",
            body: "The uploaded CSV is parsed, dates are converted to real timestamps, and calendar attributes are extracted from each date.",
          },
          {
            step: "Split by time",
            body: "Roughly the first 80% of the timeline becomes training data; the most recent 20% is held back as the evaluation window.",
          },
          {
            step: "Train the ensemble",
            body: "A Random Forest Regressor (50 trees) learns the relationship between store, promotions, calendar features and sales.",
          },
          {
            step: "Evaluate & report",
            body: "The model predicts the held-back window; MAE, RMSE and R² are computed and the full forecast is exported as CSV and chart.",
          },
        ].map((item, i) => (
          <li key={item.step} className="relative">
            <span
              className="absolute -left-[31px] flex size-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <h2 className="font-semibold">{item.step}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </li>
        ))}
      </ol>

      <div className="grid gap-4 sm:grid-cols-2">
        {pillars.map((pillar) => (
          <Card key={pillar.title}>
            <CardContent className="p-6">
              <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-navy text-accent">
                <pillar.icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mb-2 font-semibold">{pillar.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-surface p-6 text-center">
        <TrendingUp className="mx-auto mb-3 size-6 text-accent" aria-hidden="true" />
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground">
          Built as Task 01 of the Future Interns Machine Learning track: an end-to-end pipeline
          from raw data to deployed product, with transparent out-of-time evaluation.
        </p>
        <Link
          href="/dashboard"
          className="mt-5 inline-flex h-10 items-center rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground transition-all hover:brightness-110"
        >
          Try it on your data
        </Link>
      </div>
    </div>
  );
}
