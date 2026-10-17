import { useState } from "react";

function getFileIcon(filename = "", filetype = "") {
  const ext = filename.split(".").pop()?.toLowerCase() || filetype.toLowerCase();
  switch (ext) {
    case "pdf":
      return <span className="text-[#F87171] font-mono text-[10px] font-bold">PDF</span>;
    case "docx":
    case "doc":
      return <span className="text-[#38BDF8] font-mono text-[10px] font-bold">DOC</span>;
    case "xlsx":
    case "xls":
    case "csv":
      return <span className="text-[#4ADE80] font-mono text-[10px] font-bold">XLS</span>;
    case "md":
      return <span className="text-[#FBBF24] font-mono text-[10px] font-bold">MD</span>;
    case "txt":
      return <span className="text-[#969EA8] font-mono text-[10px] font-bold">TXT</span>;
    case "zip":
      return <span className="text-[#A78BFA] font-mono text-[10px] font-bold">ZIP</span>;
    case "png":
    case "jpg":
    case "jpeg":
      return <span className="text-[#F472B6] font-mono text-[10px] font-bold">IMG</span>;
    default:
      return <span className="text-text-muted font-mono text-[10px]">FILE</span>;
  }
}

export default function FileRow({
  file,
  isActive = false,
  onSelect,
  onOpenViewer,
  onAskAbout,
  onDelete,
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      onClick={() => onSelect && onSelect(file)}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
      className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer text-xs select-none transition-colors ${
        isActive
          ? "bg-[#22262B] text-text-primary border-l-2 border-[#38BDF8]"
          : "text-text-secondary hover:bg-[#1E2227] hover:text-text-primary"
      }`}
      title={`${file.filename} (${file.chunk_count || 0} chunks, ${file.document_type || "Document"})`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="w-6 h-5 rounded flex items-center justify-center bg-[#17191C] border border-[#2B3036] flex-shrink-0">
          {getFileIcon(file.filename, file.filetype)}
        </div>
        <span className="truncate font-sans text-xs">
          {file.filename}
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
        {file.chunk_count !== undefined && (
          <span className="text-[10px] font-mono text-text-muted group-hover:text-text-secondary bg-[#17191C] px-1 rounded border border-[#2B3036]">
            {file.chunk_count}c
          </span>
        )}

        {/* Hover action shortcuts */}
        {showMenu && (
          <div className="flex items-center gap-0.5 bg-[#17191C] rounded border border-[#2B3036] p-0.5 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            {onOpenViewer && (
              <button
                onClick={() => onOpenViewer(file)}
                title="Open in Viewer"
                className="p-1 hover:text-[#38BDF8] rounded hover:bg-[#22262B]"
              >
                👁
              </button>
            )}
            {onAskAbout && (
              <button
                onClick={() => onAskAbout(file)}
                title="Ask about this document"
                className="p-1 hover:text-[#4ADE80] rounded hover:bg-[#22262B]"
              >
                💬
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(file)}
                title="Remove from knowledge base"
                className="p-1 hover:text-[#F87171] rounded hover:bg-[#22262B]"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
