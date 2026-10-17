import { useState, useEffect } from "react";
import { fetchAuditLogs } from "../services/documentsApi";

export default function BottomPanel({
  isOpen,
  onToggle,
  activeTab = "output",
  onSelectTab,
  problems = [],
  ingestionJobs = [],
}) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === "audit") {
      setLogsLoading(true);
      fetchAuditLogs(30)
        .then((logs) => setAuditLogs(logs))
        .catch(() => {})
        .finally(() => setLogsLoading(false));
    }
  }, [isOpen, activeTab]);

  if (!isOpen) {
    return (
      <div className="h-6 bg-[#17191C] border-t border-[#2B3036] flex items-center justify-between px-3 select-none flex-shrink-0 text-[11px] font-mono text-text-muted">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className="flex items-center gap-1.5 hover:text-text-primary transition-colors"
          >
            <span>▲</span>
            <span>Panel (Problems, Output, Ingestion, Audit)</span>
          </button>
          {problems.length > 0 && (
            <span className="text-[#F87171] flex items-center gap-1">
              <span>✕</span> {problems.length} Problems
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="hover:text-text-primary transition-colors text-[10px]"
        >
          Expand
        </button>
      </div>
    );
  }

  const tabs = [
    { id: "problems", label: "Problems", count: problems.length },
    { id: "output", label: "Output" },
    { id: "ingestion", label: "Ingestion Pipeline", count: ingestionJobs.length },
    { id: "audit", label: "Audit Results" },
  ];

  return (
    <div className="h-48 bg-[#191C20] border-t border-[#2B3036] flex flex-col select-none flex-shrink-0 z-20 font-sans">
      {/* Panel Tab Bar */}
      <div className="h-7 bg-[#17191C] border-b border-[#2B3036] flex items-center justify-between px-3 text-xs">
        <div className="flex items-center gap-1">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTab(t.id)}
                className={`px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5 transition-colors border-b-2 ${
                  isActive
                    ? "text-[#38BDF8] border-[#38BDF8] bg-[#191C20]"
                    : "text-text-muted border-transparent hover:text-text-primary"
                }`}
              >
                <span>{t.label}</span>
                {t.count !== undefined && t.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                      t.id === "problems" ? "bg-[#F87171]/20 text-[#F87171]" : "bg-[#2B3036] text-text-secondary"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-text-muted">
          <button
            onClick={onToggle}
            className="hover:text-text-primary p-0.5 rounded text-xs"
            title="Minimize Panel"
          >
            ▼
          </button>
        </div>
      </div>

      {/* Panel Content Stage */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed text-text-secondary">
        {/* Output Tab */}
        {activeTab === "output" && (
          <div className="space-y-1">
            <div className="text-text-muted">
              [AEGIS AI] Local Enclave Initialized. Node runtime: Air-gapped on-premises.
            </div>
            <div className="text-[#38BDF8]">
              [Inference Router] Active model: Qwen 2.5 3B (Local Ollama / CUDA acceleration enabled)
            </div>
            <div className="text-[#4ADE80]">
              [Vector Database] ChromaDB persistent store ready (collection: epc_documents).
            </div>
            <div className="text-text-muted">
              [Email Daemon] Gmail IMAP poller active (background polling interval: 5 min).
            </div>
          </div>
        )}

        {/* Problems Tab */}
        {activeTab === "problems" && (
          <div>
            {problems.length === 0 ? (
              <div className="text-text-muted italic">No active problems or contract errors detected.</div>
            ) : (
              <div className="space-y-1">
                {problems.map((p, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[#F87171]">
                    <span>✕</span>
                    <span>{p.message || p}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ingestion Tab */}
        {activeTab === "ingestion" && (
          <div>
            {ingestionJobs.length === 0 ? (
              <div className="space-y-1">
                <div className="text-text-muted">Pipeline idle. No active upload or extraction tasks.</div>
                <div className="text-[10px] text-text-muted">
                  Allowed types: .pdf, .docx, .xlsx, .xls, .csv, .txt, .md, .zip (Subprocess sandbox defense enabled)
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {ingestionJobs.map((job, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-[#111315] border border-[#2B3036] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-text-primary">{job.filename}</div>
                      <div className="text-[10px] text-text-muted">
                        Status: {job.status} • Chunks: {job.chunks || "Calculating..."}
                      </div>
                    </div>
                    <span className="text-[#4ADE80] font-mono text-[10px]">
                      {job.progress ? `${job.progress}%` : "In Progress"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === "audit" && (
          <div>
            {logsLoading ? (
              <div className="text-text-muted">Loading audit trail...</div>
            ) : auditLogs.length === 0 ? (
              <div className="text-text-muted">No audit events recorded yet.</div>
            ) : (
              <div className="space-y-1.5">
                {auditLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <span className="text-text-muted">{new Date(log.time).toLocaleTimeString()}</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#22262B] text-[10px] font-bold uppercase text-[#38BDF8]">
                      {log.action}
                    </span>
                    <span className="text-text-primary font-mono text-[11px]">
                      {JSON.stringify(log.details)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
