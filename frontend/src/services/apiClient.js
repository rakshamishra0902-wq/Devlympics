import axios from "axios";

/**
 * AEGIS AI Centralized API Client
 * Autonomous Engineering Governance and Intelligence System
 *
 * Implements:
 * - Robust error classification (offline/unavailable vs validation vs server vs processing)
 * - Safe error payloads with expandable technical diagnostics
 * - No sensitive data / credential / document body leaks to logs
 * - Configurable timeouts for local LLM inference
 */

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export class ApiError extends Error {
  constructor(message, { status = null, code = null, type = "UNKNOWN", detail = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.type = type; // 'UNAVAILABLE' | 'TIMEOUT' | 'VALIDATION' | 'PROCESSING' | 'SERVER' | 'UNKNOWN'
    this.detail = detail;
    this.timestamp = new Date().toISOString();
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    "X-Client-Application": "AEGIS-AI-Workbench",
  },
});

// Normalize responses and guard against internal backend error status shapes in 200 responses
apiClient.interceptors.response.use(
  (response) => {
    // Some backend routes return 200 with { status: "error", message: "..." }
    if (response.data && response.data.status === "error") {
      const message = response.data.message || "Operation rejected by backend security/processing check.";
      const error = new ApiError(message, {
        status: response.status,
        type: "PROCESSING",
        detail: response.data.reason || response.data.message,
      });
      return Promise.reject(error);
    }
    return response;
  },
  (error) => {
    // Network / Offline / Timeout categorization
    if (!error.response) {
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        return Promise.reject(
          new ApiError("Request timed out. Local inference model took too long to respond.", {
            code: "TIMEOUT",
            type: "TIMEOUT",
            detail: error.message,
          })
        );
      }
      return Promise.reject(
        new ApiError("Backend unavailable. Ensure the AEGIS AI FastAPI service is active on port 8000.", {
          code: "NETWORK_ERROR",
          type: "UNAVAILABLE",
          detail: error.message,
        })
      );
    }

    const { status, data } = error.response;
    let message = data?.detail || data?.message || error.message || "An unexpected error occurred.";
    let type = "SERVER";

    if (status === 422 || status === 400) {
      type = "VALIDATION";
      message = typeof data?.detail === "string" ? data.detail : "Validation error: Check parameters or document format.";
    } else if (status === 404) {
      type = "NOT_FOUND";
      message = "The requested document or resource was not found.";
    } else if (status >= 500) {
      type = "SERVER";
      message = "AEGIS AI server error during processing.";
    }

    const safeDetail = typeof data === "object" ? JSON.stringify(data) : data;
    return Promise.reject(
      new ApiError(message, {
        status,
        type,
        detail: safeDetail,
      })
    );
  }
);

export default apiClient;
