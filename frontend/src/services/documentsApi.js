import apiClient, { ApiError } from "./apiClient";

const activeUploads = new Set();

/**
 * Fetch indexed documents list
 */
export async function fetchDocuments() {
  const response = await apiClient.get("/documents");
  return response.data?.documents || [];
}

/**
 * Upload and ingest document with in-flight duplicate guard
 */
export async function uploadDocument(file, onProgress) {
  if (!file) {
    throw new ApiError("No file selected for upload.", { type: "VALIDATION" });
  }

  // File size guard (50MB)
  const MAX_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new ApiError(`File size exceeds 50MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`, {
      type: "VALIDATION",
    });
  }

  // Duplicate in-flight upload guard
  const uploadKey = `${file.name}_${file.size}_${file.lastModified}`;
  if (activeUploads.has(uploadKey)) {
    throw new ApiError(`Upload of "${file.name}" is already in progress.`, {
      type: "VALIDATION",
    });
  }

  activeUploads.add(uploadKey);

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await apiClient.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 600000, // 10 minutes for large/OCR-heavy docs
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      },
    });
    return response.data;
  } finally {
    activeUploads.delete(uploadKey);
  }
}

/**
 * Delete a document from ChromaDB and disk
 */
export async function deleteDocument(documentId) {
  const response = await apiClient.delete(`/documents/${encodeURIComponent(documentId)}`);
  return response.data;
}

/**
 * Get raw text content of all chunks for a document
 */
export async function getDocumentContent(documentId) {
  const response = await apiClient.get(`/documents/${encodeURIComponent(documentId)}/content`);
  return response.data;
}

/**
 * Get direct URL to download/stream the original uploaded file
 */
export function getDocumentFileUrl(documentId) {
  const baseURL = apiClient.defaults.baseURL || "http://localhost:8000";
  return `${baseURL}/documents/${encodeURIComponent(documentId)}/file`;
}

/**
 * Get system stats (total docs, total chunks, deviations)
 */
export async function fetchStats() {
  const response = await apiClient.get("/stats");
  return response.data;
}

/**
 * Get audit logs
 */
export async function fetchAuditLogs(limit = 50) {
  const response = await apiClient.get(`/audit-log?limit=${limit}`);
  return response.data?.logs || [];
}
