import apiClient, { ApiError } from "./apiClient";

/**
 * Fetch fetched emails list from local store
 */
export async function fetchEmails() {
  const response = await apiClient.get("/emails");
  return response.data?.emails || [];
}

/**
 * Manually trigger IMAP email synchronization
 */
export async function syncEmails() {
  const response = await apiClient.post("/email/sync");
  return response.data;
}

/**
 * Ingest a specific email message and attachments into ChromaDB
 */
export async function ingestEmail(uid) {
  if (!uid) {
    throw new ApiError("Email UID required for ingestion.", { type: "VALIDATION" });
  }
  const response = await apiClient.post(`/email/ingest/${encodeURIComponent(uid)}`);
  return response.data;
}

/**
 * Get email poller status and statistics
 */
export async function getEmailStatus() {
  const response = await apiClient.get("/email/status");
  return response.data;
}
