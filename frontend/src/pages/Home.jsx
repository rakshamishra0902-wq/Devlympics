import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/StatCard";
import { fetchStats } from "../services/documentsApi";

/**
 * AEGIS AI Workbench Home Overview
 * Autonomous Engineering Governance and Intelligence System
 * Air-gapped on-premises engineering intelligence for confidential EPC & defence infrastructure.
 */
export default function Home() {
  const [stats, setStats] = useState({ total_documents: 0, total_chunks: 0, deviations_found: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats()
      .then((res) => setStats(res))
      .catch(() => {
        // Stats fallback
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* ── Header & AEGIS AI System Identification ── */}
      <div className="border border-[#2B3036] bg-[#17191C] rounded p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
            AEGIS AI Enclave Active
          </span>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono text-text-secondary bg-[#22262B] border border-[#2B3036]">
            Confidential EPC • Defence • Critical Infrastructure
          </span>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20">
            100% On-Premises Local Inference
          </span>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#38BDF8] to-[#0284C7] flex items-center justify-center font-mono font-black text-black text-sm shadow">
            ⛨
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
              AEGIS AI Workbench
            </h1>
            <p className="text-xs font-mono text-[#38BDF8]">
              Autonomous Engineering Governance and Intelligence System
            </p>
          </div>
        </div>

        <p className="text-text-secondary text-xs leading-relaxed max-w-4xl mt-2">
          Air-gapped on-premises engineering intelligence platform safeguarding Piping &amp; Instrument Diagrams (P&amp;IDs),
          technical specifications, vendor equipment submittals, and site correspondence on local GPU hardware —
          with strict cryptographic boundary isolation and zero external network transmission.
        </p>
      </div>

      {/* ── Headline Technical Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Technical Documents Ingested" value={stats.total_documents} index={0} />
        <StatCard label="Chunks in Knowledge Base" value={stats.total_chunks} index={1} />
        <StatCard label="Compliance Deviations Flagged" value={stats.deviations_found} index={2} />
      </div>

      {/* ── Direct Workspace Actions ── */}
      <div className="border border-[#2B3036] bg-[#17191C] rounded p-5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted mb-3">
          Core Engineering Operations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => navigate("/ask")}
            className="p-3.5 rounded bg-[#1B1E22] border border-[#2B3036] hover:border-[#38BDF8] hover:bg-[#22262B] transition-all text-left group"
          >
            <div className="text-base mb-1.5 group-hover:scale-105 transition-transform">💬</div>
            <div className="font-semibold text-xs text-text-primary mb-1">Ask Documents</div>
            <div className="text-[11px] text-text-secondary">Grounded RAG Q&amp;A with strict semantic distance citations</div>
          </button>

          <button
            onClick={() => navigate("/compliance")}
            className="p-3.5 rounded bg-[#1B1E22] border border-[#2B3036] hover:border-[#FBBF24] hover:bg-[#22262B] transition-all text-left group"
          >
            <div className="text-base mb-1.5 group-hover:scale-105 transition-transform">⚖️</div>
            <div className="font-semibold text-xs text-text-primary mb-1">Compliance Audit</div>
            <div className="text-[11px] text-text-secondary">Automated spec vs. vendor submittal comparison matrix</div>
          </button>

          <button
            onClick={() => navigate("/documents")}
            className="p-3.5 rounded bg-[#1B1E22] border border-[#2B3036] hover:border-[#4ADE80] hover:bg-[#22262B] transition-all text-left group"
          >
            <div className="text-base mb-1.5 group-hover:scale-105 transition-transform">📁</div>
            <div className="font-semibold text-xs text-text-primary mb-1">Document Vault</div>
            <div className="text-[11px] text-text-secondary">Multi-format sandboxed parsing, chunking, and ChromaDB indexing</div>
          </button>

          <button
            onClick={() => navigate("/emails")}
            className="p-3.5 rounded bg-[#1B1E22] border border-[#2B3036] hover:border-[#38BDF8] hover:bg-[#22262B] transition-all text-left group"
          >
            <div className="text-base mb-1.5 group-hover:scale-105 transition-transform">✉️</div>
            <div className="font-semibold text-xs text-text-primary mb-1">Site Correspondence</div>
            <div className="text-[11px] text-text-secondary">IMAP sync monitoring and on-demand sandbox ingestion</div>
          </button>
        </div>
      </div>
    </div>
  );
}
