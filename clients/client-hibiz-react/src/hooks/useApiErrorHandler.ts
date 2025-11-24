import { useError } from "@/components/store/useError";
import toast from "react-hot-toast";

/** Shape your API usually returns. Adjust if needed. */
export interface ApiEnvelope<T = any> {
  status?: "ok" | "error";
  message?: string;
  data?: T;
}

export class ApiError extends Error {
  statusCode?: number;
  details?: unknown;
  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

type HandleOpts = {
  /** Custom success toast (omit = no toast). */
  successMessage?: string;
  /** Disable opening the global error modal for this call. */
  suppressModal?: boolean;
  /** Treat 201/204 as success with optional toast. */
  enableNoContentToast?: boolean;
  /** Override default status→message mapping. */
  statusMessageMap?: Partial<Record<number, string>>;
};

/**
 * Centralized error-enabled response handler.
 * Pass your `fetch`/apiRpc Response here.
 */
export const useApiErrorHandler = () => {
  const setError = useError((state) => state.setError);
  const setOpenErrorModal = useError((state) => state.setOpenErrorModal);
  const setErrorWithStatus = useError((state) => state.setErrorWithStatus);

  const openModal = (msg: string) => {
    setError(msg);
    setOpenErrorModal(true);
  };

  const extractMessage = async (
    res: Response,
  ): Promise<{ message: string; body?: any }> => {
    console.log("Response:", res);
    try {
      const cloned = res.clone();
      const body = await cloned.json();
      const msg =
        body?.message ||
        body?.error ||
        body?.msg ||
        (typeof body === "string" ? body : "") ||
        `Request failed with status ${res.status}`;
      return { message: String(msg), body };
    } catch {
      // fallback to text
      try {
        const text = await res.clone().text();
        return { message: text || `Request failed with status ${res.status}` };
      } catch {
        return { message: `Request failed with status ${res.status}` };
      }
    }
  };

  /**
   * Handle a Response. Returns parsed JSON on success, throws ApiError on failure.
   * Use inside query/mutation functions: `const json = await handle(response, { successMessage: "Saved" })`
   */
  const handle = async <T = any>(
    response: Response,
    opts: HandleOpts = {},
  ): Promise<T> => {
    const {
      successMessage,
      suppressModal = false,
      enableNoContentToast = false,
      statusMessageMap = {},
    } = opts;

    // 204 No Content
    if (response.status === 204) {
      if (enableNoContentToast && successMessage) toast.success(successMessage);
      // @ts-expect-error allow void return for 204
      return undefined as T;
    }

    // 2xx success (200/201/202 etc.)
    if (response.ok) {
      const json = (await response.json().catch(() => ({}))) as T;
      if (successMessage) toast.success(successMessage);
      return json;
    }

    // Error branch: build message
    const { message: rawMsg, body } = await extractMessage(response);
    const status = response.status;

    // For 401/403 → trigger re-auth modal with phone/password fields
    if (status === 401) {
      const authMsg = "You are not authenticated. Please login again.";
      setErrorWithStatus(authMsg, status);
      const error = new ApiError(authMsg, status, body);
      throw error;
    }

    // Status-aware messaging for all other codes
    const defaultMap: Record<number, string> = {
      400: "Bad request. Please check the input and try again.",
      408: "Request timeout. Please try again.",
      403: "You do not have permission to perform this action.",
      429: "Too many requests. Please wait and try again.",
      500: "Server error. Please try again later.",
      502: "Bad gateway. Please try again.",
      503: "Service unavailable. Please try again soon.",
      504: "Gateway timeout. Please try again.",
    };

    const mapped =
      statusMessageMap[status] ||
      defaultMap[status] ||
      (rawMsg?.trim() ? rawMsg : `Request failed with status ${status}`);

    if (!suppressModal) openModal(mapped);

    const error = new ApiError(mapped, status, body);
    throw error;
  };

  /**
   * Convenience helper for APIs that return { status, message, data } envelopes.
   * - Treats envelope.status === "error" as an error even if HTTP 200.
   * - Returns envelope.data on success.
   */
  const handleEnvelope = async <T = any>(
    response: Response,
    opts: HandleOpts = {},
  ): Promise<T> => {
    const json = await handle<ApiEnvelope<T>>(response, opts);
    if (json?.status && json.status !== "ok") {
      const msg = json.message || "Operation failed.";
      if (!opts.suppressModal) {
        openModal(msg);
      }
      throw new ApiError(msg, 200, json);
    }
    // Prefer `data` if present; otherwise return the whole json.
    return (json?.data ?? (json as unknown as T)) as T;
  };

  return { handle, handleEnvelope };
};
