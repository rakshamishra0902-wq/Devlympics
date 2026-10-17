export default function TitleBar({
  onOpenCommandPalette,
  onOpenQuickOpen,
  onToggleSidebar,
  nodeStatus = "online",
  projectName = "Data Centre EPC — Primary Substation",
}) {
  return (
    <header className="h-10 bg-[#17191C] border-b border-[#2B3036] flex items-center justify-between px-3 select-none flex-shrink-0 z-30 font-sans text-xs">
      {/* Left: Brand & Sidebar toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          title="Toggle Sidebar (Ctrl+B)"
          className="text-text-secondary hover:text-text-primary p-1 rounded hover:bg-[#22262B] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          {/* AEGIS AI Shield Logo */}
          <div className="w-5 h-5 rounded bg-gradient-to-br from-[#38BDF8] to-[#0284C7] flex items-center justify-center font-mono font-black text-black text-[11px] shadow-sm">
            ⛨
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold tracking-wider text-text-primary uppercase text-[12px]">
              AEGIS AI
            </span>
            <span className="hidden md:inline text-[10px] text-text-muted font-mono">
              v1.0 • Autonomous Engineering Governance
            </span>
          </div>
        </div>

        <span className="text-text-muted hidden sm:inline">|</span>

        {/* Current Workspace / Project Name */}
        <div className="hidden sm:flex items-center gap-1.5 text-text-secondary text-xs">
          <span className="text-[11px] text-text-muted">Project:</span>
          <span className="font-medium text-text-primary bg-[#22262B] px-2 py-0.5 rounded border border-[#2B3036] text-[11px]">
            {projectName}
          </span>
        </div>
      </div>

      {/* Center: Global Command Launcher */}
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={onOpenCommandPalette}
          className="w-full h-7 px-3 bg-[#111315] hover:bg-[#1B1E22] border border-[#2B3036] hover:border-[#38BDF8] rounded flex items-center justify-between text-text-muted text-xs transition-colors"
          title="Open Command Palette (Ctrl+Shift+P)"
        >
          <span className="flex items-center gap-2 truncate">
            <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="truncate">AEGIS AI: Type a command or search...</span>
          </span>
          <kbd className="hidden lg:inline-block font-mono text-[10px] bg-[#22262B] text-text-secondary px-1.5 py-0.5 rounded border border-[#2B3036]">
            Ctrl+Shift+P
          </kbd>
        </button>
      </div>

      {/* Right: Local Inference Node State & Settings */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Node status indicator */}
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#111315] border border-[#2B3036] text-[11px] font-mono text-text-secondary"
          title="Local Air-Gapped Inference Node (Qwen 2.5 / CUDA)"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              nodeStatus === "online" ? "bg-[#4ADE80] animate-pulse" : "bg-[#FBBF24]"
            }`}
          />
          <span className="hidden md:inline">Local Node:</span>
          <span className={nodeStatus === "online" ? "text-[#4ADE80]" : "text-[#FBBF24]"}>
            {nodeStatus === "online" ? "CUDA Ready" : "Standby"}
          </span>
        </div>

        {/* Quick Open Doc button */}
        <button
          onClick={onOpenQuickOpen}
          className="hidden sm:flex items-center gap-1 text-text-secondary hover:text-text-primary px-2 py-1 rounded hover:bg-[#22262B] transition-colors text-xs"
          title="Search Documents (Ctrl+P)"
        >
          <span>Go to File</span>
          <kbd className="font-mono text-[10px] text-text-muted bg-[#22262B] px-1 rounded border border-[#2B3036]">
            Ctrl+P
          </kbd>
        </button>
      </div>
    </header>
  );
}
