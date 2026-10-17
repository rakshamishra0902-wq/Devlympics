/**
 * Backward-compatibility proxy for src/services
 * All network operations are now routed through the modular services in src/services/
 */
import apiClient, { ApiError } from "../services/apiClient";
import {
  fetchDocuments,
  uploadDocument as svcUploadDocument,
  deleteDocument as svcDeleteDocument,
  getDocumentContent as svcGetDocumentContent,
  fetchStats,
} from "../services/documentsApi";
import {
  askKnowledgeBase,
  askImageQuestion as svcAskImageQuestion,
  agentAsk as svcAgentAsk,
  agentDeleteConfirmed as svcAgentDeleteConfirmed,
} from "../services/askApi";
import {
  runComplianceAudit,
  getLastComplianceAudit,
} from "../services/complianceApi";
import {
  fetchEmails,
  syncEmails as svcSyncEmails,
  ingestEmail as svcIngestEmail,
  getEmailStatus as svcGetEmailStatus,
} from "../services/emailsApi";

export { ApiError };
export default apiClient;

export const askQuestion = (question, documentType = null, provider = "qwen", documentId = null) =>
  askKnowledgeBase(question, { documentType, provider, documentId });

export const askImageQuestion = svcAskImageQuestion;
export const runComplianceCheck = (documentIds) => runComplianceAudit(documentIds);
export const getLastComplianceCheck = getLastComplianceAudit;
export const uploadDocument = svcUploadDocument;
export const getDocuments = async () => {
  const docs = await fetchDocuments();
  return { data: { documents: docs } };
};
export const getStats = async () => {
  const stats = await fetchStats();
  return { data: stats };
};
export const deleteDocument = svcDeleteDocument;
export const getEmails = async () => {
  const emails = await fetchEmails();
  return { data: { emails } };
};
export const syncEmails = svcSyncEmails;
export const ingestEmail = svcIngestEmail;
export const getEmailStatus = async () => {
  const status = await svcGetEmailStatus();
  return { data: status };
};
export const agentAsk = svcAgentAsk;
export const agentDeleteConfirmed = svcAgentDeleteConfirmed;
export const getDocumentContent = svcGetDocumentContent;