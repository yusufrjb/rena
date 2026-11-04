export type Row = Record<string, unknown>;

/** Shape of POST /ask. Every field may be missing or null depending on the question. */
export type AskResult = {
  success: boolean;
  question?: string | null;
  answer?: string | null;
  sources?: string[] | null;
  generated_sql?: string | null;
  data?: Row[] | { result?: unknown } | null;
  columns?: string[] | null;
  business_insight?: string | null;
  error?: string | null;
  report?: string | null;
  tool_used?: string | null;
};

export type ErrorKind =
  | "offline"
  | "network"
  | "http"
  | "invalid"
  | "sql"
  | "unsupported";

export type AppError = {
  kind: ErrorKind;
  title: string;
  message: string;
  detail?: string;
};

export type ChatMessage =
  | { id: string; role: "user"; content: string; createdAt: number }
  | {
      id: string;
      role: "assistant";
      createdAt: number;
      status: "loading" | "done";
      question: string;
      result?: AskResult;
      error?: AppError;
    };

export type View = "assistant" | "overview" | "history";

export type HealthStatus = "checking" | "online" | "offline";

export type DashboardKpis = {
  total_orders: number;
  total_customers: number;
  gross_sales: number;
  product_sales: number;
  average_order_value: number;
};

export type MonthlySales = {
  sales_month: string;
  gross_sales: number;
  product_sales: number;
};

export type OrderStatus = {
  order_status: string;
  total_orders: number;
};

export type CategorySales = {
  category_name: string;
  gross_sales: number;
  product_sales: number;
  total_orders: number;
};

export type SellerPerformance = {
  seller_id: string;
  seller_city: string;
  seller_state: string;
  gross_sales: number;
};

export type PaymentAnalysis = {
  payment_type: string;
  total_transactions: number;
  total_orders: number;
  total_payment: number;
};

export type MonthlyOrders = {
  sales_month: string;
  total_orders: number;
};

export type ReviewAnalysis = {
  review_score: number;
  total_reviews: number;
};

export type FreightVsProduct = {
  sales_month: string;
  product_sales: number;
  freight_total: number;
};

export type DashboardData = {
  kpis: DashboardKpis;
  monthly_sales: MonthlySales[];
  order_status: OrderStatus[];
  categories: CategorySales[];
  sellers: SellerPerformance[];
  payments: PaymentAnalysis[];
  monthly_orders: MonthlyOrders[];
  reviews: ReviewAnalysis[];
  freight_vs_product: FreightVsProduct[];
};

export type DashboardResponse = {
  success: boolean;
  data: DashboardData;
  error?: string;
};