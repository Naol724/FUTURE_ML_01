import { ArrowRight, BarChart3, Download, Gauge, LineChart, UploadCloud, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const valueProps = [
  {
    icon: Gauge,
    title: "Accuracy you can verify",
    body: "Every forecast ships with MAE, RMSE and R² on a strict out-of-time holdout — no cherry-picked numbers.",
  },
  {
    icon: Zap,
    title: "Automation end-to-end",
    body: "Upload a CSV and the pipeline handles preprocessing, feature engineering, training and evaluation.",
  },
  {
    icon: Download,
    title: "Exportable reports",
    body: "Download the full forecast as CSV, or export the interactive chart as PNG for slide decks.",
  },
];

const steps = [
  {
    icon: UploadCloud,
    title: "Upload your history",
    body: "Drop in a CSV of historical sales. We validate the schema before anything is sent.",
    image: "/images/retail-inventory.jpg",
    alt: "Retail store aisle with products on shelves",
  },
  {
    icon: LineChart,
    title: "Train the model",
    body: "A Random Forest ensemble learns seasonality, promotions and store-level demand patterns.",
    image: "/images/analytics-dashboard.jpg",
    alt: "Analytics charts and dashboards on a computer screen",
  },
  {
    icon: BarChart3,
    title: "Act on the forecast",
    body: "Explore actual vs. predicted demand, review metrics, and export what your team needs.",
    image: "/images/business-planning.jpg",
    alt: "Business analytics graphs used for planning",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Full-bleed hero — dark solid wash so copy stays readable over the photo */}
      <section className="relative isolate min-h-[78vh] overflow-hidden bg-navy md:min-h-[85vh]">
        <Image
          src="/images/hero-warehouse.jpg"
          alt="Warehouse shelves stocked for inventory planning"
          fill
          priority
          quality={65}
          sizes="100vw"
          className="object-cover object-center opacity-45"
        />
        {/* Full dark wash + left emphasis — prevents photo from washing out text */}
        <div className="absolute inset-0 bg-navy/70" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/40"
          aria-hidden="true"
        />

        <div className="container relative z-10 flex min-h-[78vh] flex-col justify-center py-20 md:min-h-[85vh] md:py-24">
          <div className="max-w-2xl rounded-2xl bg-navy/55 p-6 backdrop-blur-[2px] sm:p-8 md:bg-transparent md:p-0 md:backdrop-blur-none">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-accent">
              Forecastly
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.08] text-white drop-shadow-sm md:text-6xl lg:text-7xl">
              Sales &amp; demand forecasting for real inventory decisions
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90 md:text-lg">
              Turn historical sales into trusted demand forecasts — so your team can plan stock,
              staffing and budgets with confidence.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-7 text-base font-semibold text-accent-foreground shadow-glow transition-all duration-300 hover:brightness-110"
              >
                Start forecasting
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/about"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-7 text-base font-medium text-white transition-colors hover:bg-white/15"
              >
                How it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-b border-border bg-background py-16 md:py-20"
        aria-labelledby="value-props-heading"
      >
        <div className="container">
          <h2 id="value-props-heading" className="max-w-2xl text-3xl font-bold md:text-4xl">
            Built for operators who need numbers they can trust
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Chronological validation, automated training, and reports your team can use the same day.
          </p>
          <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {valueProps.map((prop) => (
              <li key={prop.title}>
                <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <prop.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold">{prop.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{prop.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Photo + text side-by-side — text never sits on top of the photo */}
      <section className="bg-surface py-16 md:py-24" aria-labelledby="steps-heading">
        <div className="container">
          <div className="mb-12 max-w-2xl">
            <h2 id="steps-heading" className="text-3xl font-bold md:text-4xl">
              From spreadsheet to forecast
            </h2>
            <p className="mt-3 text-muted-foreground">Three steps. No data science team required.</p>
          </div>

          <ol className="space-y-14 md:space-y-20">
            {steps.map((step, index) => {
              const reversed = index % 2 === 1;
              return (
                <li
                  key={step.title}
                  className={`grid items-center gap-8 md:grid-cols-2 md:gap-12 ${
                    reversed ? "md:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
                    <Image
                      src={step.image}
                      alt={step.alt}
                      fill
                      quality={60}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="relative z-10">
                    <span className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-navy text-accent">
                      <step.icon className="size-5" aria-hidden="true" />
                    </span>
                    <p className="mb-2 font-display text-sm font-semibold uppercase tracking-wider text-accent">
                      Step {index + 1}
                    </p>
                    <h3 className="text-2xl font-bold md:text-3xl">{step.title}</h3>
                    <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* CTA — solid navy first; photo is decorative and heavily dimmed */}
      <section className="relative isolate overflow-hidden bg-navy py-20 md:py-28">
        <Image
          src="/images/business-planning.jpg"
          alt=""
          fill
          quality={50}
          loading="lazy"
          sizes="100vw"
          className="object-cover object-center opacity-20"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-navy/80" aria-hidden="true" />
        <div className="container relative z-10 text-center text-white">
          <h2 className="text-3xl font-bold md:text-5xl">Ready to see your forecast?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Load the sample dataset or upload your own sales history — store-level predictions and
            transparent accuracy metrics in minutes.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-7 text-base font-semibold text-accent-foreground transition-all hover:brightness-110"
          >
            Open the dashboard
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
