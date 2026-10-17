import { useState, useEffect, useRef } from "react";

export default function CommandPalette({
  isOpen,
  mode = "commands", // 'commands' | 'files'
  onClose,
  documents = [],
  onExecuteCommand,
  onSelectDocument,
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const baseCommands = [
    { id: "create_doc", title: "AEGIS: Create Text Document / Note", category: "Documents", shortcut: "Ctrl+N" },
    { id: "upload_files", title: "AEGIS: Upload Files to Knowledge Base", category: "Documents", shortcut: "" },
    { id: "open_vault", title: "AEGIS: Open Document Vault", category: "Navigation", shortcut: "" },
    { id: "ask_rag", title: "AEGIS: Ask Knowledge Base (RAG Q&A)", category: "Intelligence", shortcut: "" },
    { id: "run_compliance", title: "AEGIS: Run Technical Compliance Audit", category: "Compliance", shortcut: "" },
    { id: "open_emails", title: "AEGIS: Open Site Correspondence & Emails", category: "Correspondence", shortcut: "" },
    { id: "toggle_sidebar", title: "View: Toggle Explorer Sidebar", category: "View", shortcut: "Ctrl+B" },
    { id: "toggle_panel", title: "View: Toggle Bottom Diagnostic Panel", category: "View", shortcut: "" },
    { id: "save_draft", title: "File: Save Current Draft", category: "File", shortcut: "Ctrl+S" },
    { id: "ingest_doc", title: "Ingestion: Ingest Current Document into Vector DB", category: "Ingestion", shortcut: "Ctrl+Shift+I" },
  ];

  // If in 'files' mode or query starts with '>', adjust items
  const isFilesMode = mode === "files";

  const items = isFilesMode
    ? documents
        .filter((d) => d.filename.toLowerCase().includes(query.toLowerCase()))
        .map((d) => ({
          id: `file_${d.document_id}`,
          title: d.filename,
          category: d.document_type || "Document",
          shortcut: `${d.chunk_count || 0} chunks`,
          data: d,
          isFile: true,
        }))
    : baseCommands.filter((cmd) =>
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, mode]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = items[selectedIndex];
      if (selected) {
        if (selected.isFile) {
          onSelectDocument && onSelectDocument(selected.data);
        } else {
          onExecuteCommand && onExecuteCommand(selected.id);
        }
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#191C20] border border-[#2B3036] rounded shadow-dialog overflow-hidden animate-fade-in text-xs font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Command Search Input */}
        <div className="flex items-center px-3 py-2.5 border-b border-[#2B3036] bg-[#17191C]">
          <span className="text-text-muted mr-2 font-mono text-xs">
            {isFilesMode ? "📄" : ">"}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isFilesMode
                ? "Type a document name to open..."
                : "Type a command or choose an action..."
            }
            className="w-full bg-transparent text-text-primary text-xs placeholder:text-text-muted focus:outline-none font-sans"
          />
          <span className="text-[10px] font-mono text-text-muted bg-[#22262B] px-1.5 py-0.5 rounded border border-[#2B3036]">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto py-1">
          {items.length === 0 ? (
            <div className="px-4 py-3 text-center text-text-muted italic">
              No matching {isFilesMode ? "documents" : "commands"} found.
            </div>
          ) : (
            items.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.isFile) {
                      onSelectDocument && onSelectDocument(item.data);
                    } else {
                      onExecuteCommand && onExecuteCommand(item.id);
                    }
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#22262B] text-text-primary border-l-2 border-[#38BDF8]"
                      : "text-text-secondary hover:bg-[#1E2227]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className="truncate font-medium text-text-primary">
                      {item.title}
                    </span>
                  </div>

                  {item.shortcut && (
                    <span className="text-[10px] font-mono text-text-muted bg-[#17191C] px-1.5 py-0.5 rounded border border-[#2B3036] flex-shrink-0 ml-2">
                      {item.shortcut}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-3 py-1.5 bg-[#17191C] border-t border-[#2B3036] flex items-center justify-between text-[10px] text-text-muted font-mono">
          <span>Navigate: ↑↓ • Select: ↵ • Dismiss: ESC</span>
          <span>AEGIS Command Launcher</span>
        </div>
      </div>
    </div>
  );
}
