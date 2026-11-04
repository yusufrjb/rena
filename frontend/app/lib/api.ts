import type {
  AppError,
  AskResult,
  DashboardResponse,
  ErrorKind,
} from "@/app/lib/types";

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export class ApiError extends Error {
  readonly info: AppError;
  constructor(info: AppError) {
    super(info.message);
    this.name = "ApiError";
    this.info = info;
  }
}

function make(kind: ErrorKind, title: string, message: string, detail?: string): ApiError {
  return new ApiError({ kind, title, message, detail });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readDetail(body: unknown): string | undefined {
  if (!isRecord(body)) return undefined;
  const { detail, error } = body;
  if (typeof error === "string" && error) return error;
  if (typeof detail === "string" && detail) return detail;
  if (Array.isArray(detail)) {
    const parts = detail
      .map((d) => (isRecord(d) && typeof d.msg === "string" ? d.msg : null))
      .filter((s): s is string => s !== null);
    if (parts.length) return parts.join("; ");
  }
  return undefined;
}

/** Classify an error string returned by the backend for a failed /ask. */
export function classifyBackendError(message: string): AppError {
  const lower = message.toLowerCase();
  if (
    /(syntax|execut|relation|column .* does not exist|psycopg|sqlalchemy|database|query failed)/.test(lower)
  ) {
    return {
      kind: "sql",
      title: "The generated query could not be executed",
      message:
        "The AI produced SQL that failed against the database. Try rephrasing the question or making it more specific.",
      detail: message,
    };
  }
  if (/(unsupported|not supported|cannot answer|can't answer|outside|only select|not allowed|invalid sql|validation)/.test(lower)) {
    return {
      kind: "unsupported",
      title: "This question isn't supported",
      message:
        "The assistant can only answer read-only questions about the Olist e-commerce dataset. Try asking about sales, orders, categories, sellers, payments or reviews.",
      detail: message,
    };
  }
  return {
    kind: "http",
    title: "The assistant couldn't answer",
    message: "The backend reported a problem while handling this question.",
    detail: message,
  };
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_BASE}${path}`, init);
  } catch {
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    throw offline
      ? make("network", "You appear to be offline", "Check your internet connection and try again.")
      : make(
          "offline",
          "Backend is unreachable",
          `Could not reach the API at ${API_BASE}. Make sure the FastAPI server is running and that CORS allows this origin.`
        );
  }
}

export async function askQuestion(question: string, signal?: AbortSignal): Promise<AskResult> {
  const response = await request("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ question }),
    signal,
  });

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw make(
      "invalid",
      "Invalid response from server",
      "The backend returned something that isn't valid JSON.",
      `HTTP ${response.status}`
    );
  }

  if (!response.ok) {
    const detail = readDetail(body);
    const info = detail ? classifyBackendError(detail) : null;
    if (info && (info.kind === "sql" || info.kind === "unsupported")) throw new ApiError(info);
    throw make(
      "http",
      `Server error (${response.status})`,
      "The backend rejected the request.",
      detail ?? `HTTP ${response.status}`
    );
  }

  if (!isRecord(body) || typeof body.success !== "boolean") {
    throw make(
      "invalid",
      "Unexpected response format",
      "The backend response is missing the expected fields."
    );
  }

  return body as AskResult;
}

export async function checkHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`, { cache: "no-store", signal });
    if (!response.ok) return false;
    const body: unknown = await response.json();
    return isRecord(body) && body.status === "healthy";
  } catch {
    return false;
  }
}

export async function getDashboardOverview(
  signal?: AbortSignal
): Promise<DashboardResponse> {
  const response = await request("/dashboard/overview", {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw make(
      "invalid",
      "Invalid dashboard response",
      "The backend returned an invalid JSON response."
    );
  }

  if (!response.ok) {
    const detail = readDetail(body);

    throw make(
      "http",
      `Dashboard error (${response.status})`,
      "Failed to retrieve dashboard data.",
      detail ?? `HTTP ${response.status}`
    );
  }

  if (
    !isRecord(body) ||
    body.success !== true ||
    !isRecord(body.data)
  ) {
    throw make(
      "invalid",
      "Unexpected dashboard response",
      "The backend response does not match the expected dashboard format."
    );
  }

  return body as unknown as DashboardResponse;
}