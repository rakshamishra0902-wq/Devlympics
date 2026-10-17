export default function StatusBar({
  nodeOnline = true,
  documentCount = 0,
  chunkCount = 0,
  activeScope = "All Documents",
  onOpenPanel,
}) {
  return (
    <footer className="h-6 bg-[#17191C] border-t border-[#2B3036] flex items-center justify-between px-3 select-none flex-shrink-0 z-30 font-mono text-[11px] text-text-secondary">
      {/* Left: Node status & indexing metrics */}
      <div className="flex items-center gap-3">
        {/* Node status button */}
        <button
          onClick={onOpenPanel}
          className="flex items-center gap-1.5 hover:text-text-primary transition-colors"
          title="Air-gapped local model: qwen2.5:3b"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              nodeOnline ? "bg-[#4ADE80]" : "bg-[#FBBF24]"
            }`}
          />
          <span>Local Node: {nodeOnline ? "qwen2.5:3b (Ready)" : "Offline"}</span>
        </button>

        <span className="text-[#2B3036]">|</span>

        {/* Knowledge base stats */}
        <div className="flex items-center gap-1.5" title="ChromaDB persistent collection">
          <span className="text-[#38BDF8]">⛁</span>
          <span>
            {documentCount} Docs · {chunkCount} Chunks
          </span>
        </div>

        <span className="text-[#2B3036] hidden sm:inline">|</span>

        {/* Active scope */}
        <div className="hidden sm:flex items-center gap-1.5 text-text-muted">
          <span>Scope:</span>
          <span className="text-text-primary">{activeScope}</span>
        </div>
      </div>

      {/* Right: Enclave format, encoding, ready state */}
      <div className="flex items-center gap-3">
        <span className="hidden md:inline text-text-muted">UTF-8</span>
        <span className="text-[#2B3036] hidden md:inline">|</span>
        <span className="hidden sm:inline text-text-muted">Air-Gapped Enclave</span>
        <span className="text-[#2B3036] hidden sm:inline">|</span>
        <div className="flex items-center gap-1 text-[#4ADE80]">
          <span>●</span>
          <span>Ready</span>
        </div>
      </div>
    </footer>
  );
}
