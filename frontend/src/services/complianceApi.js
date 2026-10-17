import apiClient, { ApiError } from "./apiClient";

/**
 * Run Automated Compliance Audit across engineering specifications and submittals
 */
export async function runComplianceAudit(documentIds = []) {
  if (!Array.isArray(documentIds) || documentIds.length === 0) {
    throw new ApiError("Please select at least one engineering specification and vendor submittal to audit.", {
      type: "VALIDATION",
    });
  }

  const response = await apiClient.post(
    "/compliance-check",
    { document_ids: documentIds },
    { timeout: 300000 } // 5 minutes for full LLM matrix analysis
  );
  return response.data;
}

/**
 * Retrieve cached results of the latest compliance audit
 */
export async function getLastComplianceAudit() {
  const response = await apiClient.get("/compliance-check");
  return response.data;
}
