
"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getDashboardOverview } from "@/app/lib/api";
import type { DashboardData } from "@/app/lib/types";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-8)",
  "var(--chart-5)",
  "var(--chart-7)",
  "var(--chart-6)",
];

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

const fullCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);

const numberFormat = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

const formatMonth = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });

const readable = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

function Section({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-xl border border-border bg-panel p-4 sm:p-5 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-xs text-muted">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function ChartEmpty(): React.JSX.Element {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted">
      No data available
    </div>
  );
}

function KpiCard({
  label,
  value,
  description,
  accent,
}: {
  label: string;
  value: string;
  description: string;
  accent: string;
}): React.JSX.Element {
  return (
    <div className="relative min-w-0 bg-panel p-4 pl-5">
      <span aria-hidden="true" className="absolute inset-y-4 left-0 w-0.5 rounded-r-full" style={{ backgroundColor: accent }} />
      <p className="truncate text-xs font-medium text-muted">{label}</p>
      <p className="mt-1.5 truncate text-xl font-semibold tabular-nums tracking-tight text-ink" title={value}>
        {value}
      </p>
      <p className="mt-1 truncate text-xs tabular-nums text-muted-soft" title={description}>
        {description}
      </p>
    </div>
  );
}

const tip = {
  contentStyle: {
    borderRadius: 10,
    border: "1px solid var(--color-border-strong)",
    backgroundColor: "var(--color-panel)",
    color: "var(--color-body)",
    boxShadow: "0 8px 24px rgb(0 0 0 / 0.25)",
    fontSize: 12,
    padding: "8px 12px",
  },
  cursor: { fill: "var(--color-subtle)", stroke: "var(--color-border-strong)" },
  labelStyle: { color: "var(--color-ink)", fontWeight: 600, marginBottom: 4 },
} as const;

export function DataOverview({
  compact = false,
}: {
  compact?: boolean;
}): React.JSX.Element {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    let lastError: unknown;

    // Try twice to handle temporary connection or database failures.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      if (signal?.aborted) return;

      try {
        const result = await getDashboardOverview(signal);

        if (!result.success) {
          throw new Error(result.error ?? "Failed to load dashboard data.");
        }

        if (!signal?.aborted) {
          setData(result.data);
          setError(null);
        }

        return;
      } catch (err) {
        if (signal?.aborted) return;

        lastError = err;

        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
    }

    if (!signal?.aborted) {
      setError(
        lastError instanceof Error
          ? lastError.message
          : "Unable to retrieve dashboard data."
      );
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const timer = window.setTimeout(() => {
      void loadDashboard(controller.signal);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [loadDashboard]);

  if (loading && !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted">
            Loading business intelligence dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-xl border border-danger/20 bg-panel p-6">
          <h2 className="font-semibold text-ink">
            Unable to load dashboard
          </h2>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <button
            onClick={() => void loadDashboard()}
            disabled={loading}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-hover disabled:opacity-50"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return <ChartEmpty />;

  const { kpis } = data;

  const chartGridClass = "grid grid-cols-1 gap-4 @xl:grid-cols-6";

  return (
    <div className="@container mx-auto w-full max-w-[1500px] animate-rise space-y-6 px-4 py-5 sm:px-6">
      {/* Dashboard heading */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-link">
            Business Intelligence
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">
            E-Commerce Dashboard
          </h1>
          <p className="mt-1 text-xs text-muted">
            Olist Brazilian E-Commerce · PostgreSQL Analytics
          </p>
        </div>

        <button
          onClick={() => void loadDashboard()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-xs font-semibold text-body shadow-soft transition-colors hover:bg-subtle disabled:opacity-50"
        >
          <span className={loading ? "animate-spin" : ""}>↻</span>
          {loading ? "Refreshing..." : "Refresh data"}
        </button>
      </header>

      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-xs text-danger">
          Refresh failed: {error}. Showing the last successfully loaded data.
        </div>
      )}

      {/* KPI section */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-ink">
              Key Performance Indicators
            </h2>
            <p className="mt-0.5 text-[11px] text-muted">
              Overview of e-commerce business performance
            </p>
          </div>
          <span className="text-[11px] text-muted">
            Sales based on delivered orders
          </span>
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border shadow-soft @3xl:grid-cols-5 [&>*:last-child]:col-span-2 @3xl:[&>*:last-child]:col-span-1">
          <KpiCard
            label="Total Orders"
            value={numberFormat(kpis.total_orders)}
            description="All order statuses"
            accent="var(--chart-1)"
          />
          <KpiCard
            label="Total Customers"
            value={numberFormat(kpis.total_customers)}
            description="Distinct customers"
            accent="var(--chart-2)"
          />
          <KpiCard
            label="Gross Sales"
            value={currency(kpis.gross_sales)}
            description={fullCurrency(kpis.gross_sales)}
            accent="var(--chart-3)"
          />
          <KpiCard
            label="Product Sales"
            value={currency(kpis.product_sales)}
            description={fullCurrency(kpis.product_sales)}
            accent="var(--chart-4)"
          />
          <KpiCard
            label="Average Order Value"
            value={currency(kpis.average_order_value)}
            description={fullCurrency(kpis.average_order_value)}
            accent="var(--chart-8)"
          />
        </div>
      </section>

      {/* Variable chart layout */}
      <section className={chartGridClass}>
        {/* 1. Main chart: wide */}
        <Section
          title="Monthly Sales Trend"
          subtitle="Gross sales and product sales over time · BRL"
          className="@xl:col-span-4 order-1"
        >
          <div className="h-[280px] sm:h-[310px]">
            {data.monthly_sales.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.monthly_sales}
                  margin={{ top: 8, right: 12, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    dataKey="sales_month"
                    tickFormatter={formatMonth}
                    tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                    minTickGap={20}
                  />
                  <YAxis
                    tickFormatter={(v) => currency(Number(v))}
                    tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                    width={compact ? 72 : 85}
                  />
                  <Tooltip {...tip}
                    labelFormatter={(v) => formatMonth(String(v))}
                    formatter={(v) => fullCurrency(Number(v))}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ color: "var(--color-body)", fontSize: 12, paddingTop: 8 }} />
                  <Line
                    type="monotone"
                    dataKey="gross_sales"
                    name="Gross Sales"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="product_sales"
                    name="Product Sales"
                    stroke="var(--chart-2)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty />
            )}
          </div>
        </Section>

        {/* 2. Smaller distribution chart */}
        <Section
          title="Order Status Distribution"
          subtitle="Number of orders by current status"
          className="@xl:col-span-2 order-2"
        >
          <div className="h-[280px] sm:h-[310px]">
            {data.order_status.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.order_status}
                    dataKey="total_orders"
                    nameKey="order_status"
                    cx="50%"
                    cy="45%"
                    innerRadius="48%"
                    outerRadius="72%"
                    paddingAngle={2}
                  >
                    {data.order_status.map((item, index) => (
                      <Cell
                        key={item.order_status}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip {...tip}
                    formatter={(v) => numberFormat(Number(v))}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={56}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ color: "var(--color-body)", fontSize: 12 }}
                    formatter={(value) => readable(String(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty />
            )}
          </div>
        </Section>

        {/* 3. Product categories */}
        <Section
          title="Top Product Categories"
          subtitle="Top 10 categories ranked by gross sales · BRL"
          className="@xl:col-span-3 order-5"
        >
          <div className="h-[320px]">
            {data.categories.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.categories}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => currency(Number(v))}
                    tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="category_name"
                    width={compact ? 105 : 145}
                    tickFormatter={readable}
                    tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                  />
                  <Tooltip {...tip}
                    formatter={(v) => fullCurrency(Number(v))}
                    labelFormatter={(v) => readable(String(v))}
                  />
                  <Bar
                    dataKey="gross_sales"
                    name="Gross Sales"
                    fill="var(--chart-1)"
                    radius={[0, 5, 5, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty />
            )}
          </div>
        </Section>

        {/* 4. Sellers */}
        <Section
          title="Top Sellers"
          subtitle="Top 10 sellers ranked by gross sales · BRL"
          className="@xl:col-span-3 order-6"
        >
          <div className="h-[320px]">
            {data.sellers.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.sellers}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => currency(Number(v))}
                    tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="seller_city"
                    width={compact ? 100 : 115}
                    tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                  />
                  <Tooltip {...tip}
                    formatter={(v) => fullCurrency(Number(v))}
                    labelFormatter={(v) => String(v)}
                  />
                  <Bar
                    dataKey="gross_sales"
                    name="Gross Sales"
                    fill="var(--chart-2)"
                    radius={[0, 5, 5, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty />
            )}
          </div>
        </Section>

        {/* 5. Payment analysis */}
        <Section
          title="Payment Method Analysis"
          subtitle="Total payment value by payment type · BRL"
          className="@xl:col-span-3 order-7"
        >
          <div className="h-[320px]">
            {data.payments.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.payments}
                  margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="payment_type"
                    tickFormatter={readable}
                    tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                  />
                  <YAxis
                    tickFormatter={(v) => currency(Number(v))}
                    tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                    width={72}
                  />
                  <Tooltip {...tip}
                    formatter={(v) => fullCurrency(Number(v))}
                    labelFormatter={(v) => readable(String(v))}
                  />
                  <Bar
                    dataKey="total_payment"
                    name="Payment Value"
                    fill="var(--chart-1)"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty />
            )}
          </div>
        </Section>

        {/* 6. Reviews */}
        <Section
          title="Review Score Distribution"
          subtitle="Number of customer reviews by score"
          className="@xl:col-span-3 order-8"
        >
          <div className="h-[320px]">
            {data.reviews.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.reviews}
                  margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="review_score"
                    tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                  />
                  <YAxis
                    tickFormatter={(v) => numberFormat(Number(v))}
                    tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                  />
                  <Tooltip {...tip}
                    formatter={(v) => numberFormat(Number(v))}
                  />
                  <Bar
                    dataKey="total_reviews"
                    name="Total Reviews"
                    radius={[5, 5, 0, 0]}
                  >
                    {data.reviews.map((item) => (
                      <Cell
                        key={item.review_score}
                        fill={item.review_score <= 2 ? "var(--chart-5)" : item.review_score === 3 ? "var(--chart-3)" : "var(--chart-2)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty />
            )}
          </div>
        </Section>

        {/* 7. Monthly orders */}
        <Section
          title="Monthly Order Trend"
          subtitle="Number of delivered orders per month"
          className="@xl:col-span-3 order-3"
        >
          <div className="h-[300px]">
            {data.monthly_orders.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.monthly_orders}
                  margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="sales_month"
                    tickFormatter={formatMonth}
                    tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                    minTickGap={20}
                  />
                  <YAxis
                    tickFormatter={(v) => numberFormat(Number(v))}
                    tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                  />
                  <Tooltip {...tip}
                    labelFormatter={(v) => formatMonth(String(v))}
                    formatter={(v) => numberFormat(Number(v))}
                  />
                  <Bar
                    dataKey="total_orders"
                    name="Orders"
                    fill="var(--chart-1)"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty />
            )}
          </div>
        </Section>
        
        

        {/* 8. Wide comparison chart */}
        <Section
          title="Freight vs Product Sales"
          subtitle="Monthly product sales compared with freight value · BRL"
          className="@xl:col-span-3 order-4"
        >
          <div className="h-[280px] sm:h-[300px]">
            {data.freight_vs_product.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.freight_vs_product}
                  margin={{ top: 8, right: 12, left: 8, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="sales_month"
                    tickFormatter={formatMonth}
                    tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                    minTickGap={20}
                  />
                  <YAxis
                    tickFormatter={(v) => currency(Number(v))}
                    tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                    width={compact ? 72 : 85}
                  />
                  <Tooltip {...tip}
                    labelFormatter={(v) => formatMonth(String(v))}
                    formatter={(v) => fullCurrency(Number(v))}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ color: "var(--color-body)", fontSize: 12, paddingTop: 8 }} />
                  <Line
                    type="monotone"
                    dataKey="product_sales"
                    name="Product Sales"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="freight_total"
                    name="Freight"
                    stroke="var(--chart-3)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty />
            )}
          </div>
        </Section>
      </section>

      {/* Data definitions */}
      <footer className="rounded-xl border border-border bg-panel px-4 py-4 text-xs leading-relaxed text-muted sm:px-5">
        <p className="font-semibold text-ink">
          Data source and metric definitions
        </p>
        <p className="mt-1">
          Source: Olist public Brazilian E-Commerce dataset · PostgreSQL ·
          Schema: olist. Gross Sales = Product Sales + Freight.
          Sales, category, seller, payment, review, and monthly analyses
          use delivered orders. Total Orders includes all order statuses.
        </p>
      </footer>
    </div>
  );
}
