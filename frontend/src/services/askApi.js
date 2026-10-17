import apiClient from "./apiClient";

/**
 * Ask Questions using Grounded RAG
 */
export async function askKnowledgeBase(question, { documentType = null, documentId = null, provider = "qwen", signal } = {}) {
  const response = await apiClient.post(
    "/ask",
    {
      question,
      document_type: documentType === "All" ? null : documentType,
      document_id: documentId,
      provider,
    },
    {
      timeout: 180000,
      signal,
    }
  );
  return response.data;
}

/**
 * Vision / image-based QA
 */
export async function askImageQuestion(question, imageFile, documentType = null) {
  const formData = new FormData();
  formData.append("question", question);
  formData.append("image", imageFile);
  if (documentType && documentType !== "All") {
    formData.append("document_type", documentType);
  }

  const response = await apiClient.post("/ask-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  });
  return response.data;
}

/**
 * Agentic document routing (intent detection & switch/delete)
 */
export async function agentAsk(message, provider = "qwen") {
  const response = await apiClient.post(
    "/agent/ask",
    { message, provider },
    { timeout: 180000 }
  );
  return response.data;
}

/**
 * Confirmed agentic document deletion
 */
export async function agentDeleteConfirmed(documentIds) {
  const response = await apiClient.post("/agent/delete-confirmed", {
    document_ids: documentIds,
  });
  return response.data;
}
