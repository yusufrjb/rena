import React from "react";
import Link from "next/link";
import {
  ClockIcon,
  CodeIcon,
  DatabaseIcon,
  PanelIcon,
  RenaGlyph,
  SendIcon,
  SparkIcon,
  TableIcon,
} from "@/app/components/icons";
import { ThemeSwitcher } from "@/app/components/theme-switcher";
import { SUGGESTED_QUESTIONS } from "@/app/lib/suggested-questions";

const FEATURES = [
  { title: "Interactive Business Dashboard", Icon: PanelIcon, wide: true,
    text: "Eight charts and five KPI cards cover sales, orders, categories, sellers, payments, reviews and freight, all read from the Olist dataset in PostgreSQL." },
  { title: "AI-Powered Data Analysis", Icon: SparkIcon, wide: false,
    text: "Every answer comes with a written explanation and a business insight, so you see what the numbers mean." },
  { title: "Natural Language to SQL", Icon: CodeIcon, wide: false,
    text: "Ask in plain language. The assistant writes read-only SQL, runs it, and shows the query so you can check it." },
  { title: "Business Performance Insights", Icon: TableIcon, wide: false,
    text: "Results arrive as tables with detailed reports, not just a sentence." },
  { title: "Query History", Icon: ClockIcon, wide: false,
    text: "Return to any question from your current session and see its answer again." },
];

const STEPS = [
  { title: "Explore business data", text: "Start on the dashboard to see sales, orders, customers and reviews at a glance." },
  { title: "Ask in natural language", text: "Type a question, or pick a suggested one, in the AI Assistant next to your charts." },
  { title: "Get data-backed answers", text: "Read the answer and insight, inspect the result table, and review the SQL behind it." },
];

// Opened in a real browser tab to wake the sleeping Blitz Free backend.
const BACKEND_HEALTH_URL = "https://rena.yusufrjb.blitz.cloud/health";

const NAV = [
  { href: "#features", label: "Features" },
  { href: "#preview", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
];

const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-on-primary shadow-soft transition-colors hover:bg-primary-hover";
const btnSecondary =
  "inline-flex items-center justify-center rounded-lg border border-border-strong bg-panel px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-subtle";

function Brand({ light = false }: { light?: boolean }): React.JSX.Element {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="RENA home">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-on-primary">
        <RenaGlyph className="h-[18px] w-[18px]" />
      </span>
      <span className={`text-sm font-semibold ${light ? "text-white" : "text-ink"}`}>RENA</span>
    </Link>
  );
}

function Bar({ w, className = "" }: { w: string; className?: string }): React.JSX.Element {
  return <span className={`block h-2 rounded-full bg-border ${className}`} style={{ width: w }} />;
}

/** Layout-only preview. Shapes are placeholders; no business figures are shown. */
function ProductPreview(): React.JSX.Element {
  return (
    <figure className="mx-auto w-full max-w-5xl">
      <div className="overflow-hidden rounded-2xl border border-border-strong bg-panel shadow-[0_30px_80px_-30px_rgb(14_165_233/0.30)]">
        <div className="flex items-center gap-1.5 border-b border-border bg-subtle px-4 py-2.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="ml-3 text-xs text-muted">E-Commerce Dashboard</span>
        </div>
        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0 space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {["Total Orders", "Customers", "Gross Sales", "Product Sales", "Avg Order Value"].map((k, i) => (
                <div key={k} className={`rounded-lg border border-border p-3 ${i > 3 ? "hidden sm:block" : ""}`}>
                  <p className="truncate text-[11px] text-muted">{k}</p>
                  <Bar w="60%" className="mt-3 h-3 bg-primary-line" />
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-medium text-ink">Monthly Sales Trend</p>
              <svg viewBox="0 0 400 120" className="mt-3 h-28 w-full" aria-hidden="true">
                <path d="M0 95 C50 80 80 100 130 60 S220 70 260 40 S350 50 400 20" fill="none" stroke="var(--chart-1)" strokeWidth="2.5" />
                <path d="M0 108 C60 95 90 108 140 82 S230 90 270 66 S350 72 400 48" fill="none" stroke="var(--chart-2)" strokeWidth="2.5" />
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {["Top Product Categories", "Review Score Distribution"].map((t) => (
                <div key={t} className="rounded-lg border border-border p-4">
                  <p className="truncate text-xs font-medium text-ink">{t}</p>
                  <div className="mt-3 space-y-2">
                    <Bar w="90%" className="bg-primary-line" /><Bar w="70%" className="bg-primary-line" /><Bar w="45%" className="bg-primary-line" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-subtle/60 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-ink"><SparkIcon className="h-3.5 w-3.5 text-link" />AI Assistant</p>
            <p className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-xs text-on-primary">{SUGGESTED_QUESTIONS[2]}</p>
            <div className="space-y-2 rounded-xl border border-border bg-panel p-3 text-xs text-muted">
              <p className="font-medium text-ink">Answer</p><Bar w="95%" /><Bar w="80%" />
              <p className="pt-1 font-medium text-link">Business Insight</p><Bar w="85%" className="bg-primary-line" />
              <p className="pt-1 font-medium text-ink">Query Results · Generated SQL</p>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-muted">
        Illustrative layout. The dashboard shows live data from the Olist dataset.
      </figcaption>
    </figure>
  );
}

export function Landing(): React.JSX.Element {
  return (
    <div className="bg-bg text-body">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Brand />
          <nav aria-label="Primary" className="hidden items-center gap-6 text-sm md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="text-muted transition-colors hover:text-ink">{n.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Link href="/dashboard" className={`${btnPrimary} !px-3 !py-2 sm:!px-4`}>Explore Dashboard</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgb(14_165_233/0.16),transparent_65%)]" />
          <div className="relative mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-6xl sm:leading-[1.05]">
              Turn Business Data Into Smarter Decisions.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted">
              Explore your business performance, uncover meaningful insights, and interact with your data using AI-powered analytics.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/dashboard" className={btnPrimary}>Explore Dashboard</Link>
              <a href="#features" className={btnSecondary}>Discover Features</a>
            </div>
            <div className="mx-auto mt-6 flex max-w-xl flex-col items-center gap-3 rounded-xl border border-primary-line bg-primary-soft px-4 py-4 text-center sm:flex-row sm:gap-4 sm:text-left">
              <a
                href={BACKEND_HEALTH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-primary bg-panel px-4 py-2 text-sm font-medium text-link transition-colors hover:bg-primary hover:text-on-primary"
              >
                Prepare Live Demo
              </a>
              <p className="text-sm text-body">
                Wake up the backend before exploring the dashboard. Wait until the health endpoint reports healthy, then return here.
              </p>
            </div>
          </div>
          <div className="relative mt-14"><ProductPreview /></div>
        </section>

        <section id="features" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-20 sm:px-6">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-ink">Everything you need to understand your data</h2>
          <p className="mt-3 max-w-xl text-muted">One workspace for dashboards, questions and answers, built on the Olist Brazilian E-Commerce dataset.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {FEATURES.map(({ title, text, Icon, wide }) => (
              <article key={title} className={`rounded-xl border border-border bg-panel p-6 shadow-soft ${wide ? "md:col-span-2" : ""}`}>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-link"><Icon className="h-4.5 w-4.5" /></span>
                <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="preview" className="scroll-mt-16 border-y border-border bg-panel px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-ink">A dashboard and an assistant, side by side</h2>
            <div className="mt-10 grid gap-6 lg:grid-cols-5">
              <div className="rounded-xl border border-border bg-bg p-6 lg:col-span-3">
                <h3 className="flex items-center gap-2 text-base font-semibold text-ink"><DatabaseIcon className="h-4 w-4 text-link" />Eight charts, five KPIs</h3>
                <ul className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  {["Monthly Sales", "Order Status Distribution", "Top Product Categories", "Top Sellers", "Payment Method Analysis", "Review Score Distribution", "Monthly Order Trend", "Freight vs Product Sales"].map((c) => (
                    <li key={c} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{c}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-border bg-bg p-6 lg:col-span-2">
                <h3 className="flex items-center gap-2 text-base font-semibold text-ink"><SendIcon className="h-4 w-4 text-link" />Questions you can ask</h3>
                <ul className="mt-4 space-y-2 text-sm">
                  {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
                    <li key={q} className="rounded-lg border border-border bg-panel px-3 py-2">{q}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-ink">How it works</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t-2 border-primary pt-4">
                <span className="text-sm font-medium text-link">Step {i + 1}</span>
                <h3 className="mt-1 text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-5xl rounded-2xl bg-navy px-6 py-14 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white">See your business data in one place</h2>
            <p className="mx-auto mt-3 max-w-md text-sky-200">Open the dashboard, then ask the assistant your first question.</p>
            <Link href="/dashboard" className="mt-7 inline-flex rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:bg-sky-50">Explore Dashboard</Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-xs"><Brand /><p className="mt-3 text-sm text-muted">RENA, the Retrieval-Enhanced Network for Analytics: AI-powered business analytics for the Olist Brazilian E-Commerce dataset.</p></div>
          <div className="flex gap-12 text-sm">
            <ul className="space-y-2"><li className="font-medium text-ink">Navigate</li>
              <li><Link href="/dashboard" className="text-muted hover:text-ink">Dashboard</Link></li>
              {NAV.map((n) => (<li key={n.href}><a href={n.href} className="text-muted hover:text-ink">{n.label}</a></li>))}
            </ul>
            <ul className="space-y-2"><li className="font-medium text-ink">Features</li>
              {FEATURES.map((f) => (<li key={f.title}><a href="#features" className="text-muted hover:text-ink">{f.title}</a></li>))}
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-6xl text-xs text-muted-soft">© {new Date().getFullYear()} RENA. Data: Olist Brazilian E-Commerce Public Dataset.</p>
      </footer>
    </div>
  );
}
