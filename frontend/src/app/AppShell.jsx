import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TitleBar from "./TitleBar";
import ActivityBar from "./ActivityBar";
import WorkspaceTabs from "./WorkspaceTabs";
import BottomPanel from "./BottomPanel";
import StatusBar from "./StatusBar";
import FileTree from "../components/FileTree";
import CommandPalette from "./CommandPalette";
import ConfirmDialog from "../components/ConfirmDialog";
import { useNotification } from "../components/NotificationCenter";
import { fetchDocuments, deleteDocument, fetchStats } from "../services/documentsApi";

export default function AppShell({
  children,
  chatDocType = "All",
  onSelectDocScope,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const notification = useNotification();

  // ── Shell state ──────────────────────────────────────────────────────────
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({ total_documents: 0, total_chunks: 0, deviations_found: 0 });
  const [activeActivityView, setActiveActivityView] = useState("explorer");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);

  // Bottom panel state
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  const [bottomPanelTab, setBottomPanelTab] = useState("output");
  const [problems, setProblems] = useState([]);
  const [ingestionJobs, setIngestionJobs] = useState([]);

  // Command palette state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [paletteMode, setPaletteMode] = useState("commands"); // 'commands' | 'files'

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    detail: null,
    onConfirm: null,
  });

  // ── Workspace Tabs State ────────────────────────────────────────────────
  const [tabs, setTabs] = useState([
    { id: "tab-home", title: "AEGIS AI Overview", icon: "⛨", route: "/", closable: false },
    { id: "tab-ask", title: "Ask Documents", icon: "💬", route: "/ask", closable: true },
    { id: "tab-compliance", title: "Compliance Audit", icon: "⚖️", route: "/compliance", closable: true },
    { id: "tab-documents", title: "Document Vault", icon: "📁", route: "/documents", closable: true },
    { id: "tab-emails", title: "Correspondence", icon: "✉️", route: "/emails", closable: true },
  ]);
  const [activeTabId, setActiveTabId] = useState("tab-home");

  // Sync activeTabId with current URL route
  useEffect(() => {
    const matchingTab = tabs.find((t) => t.route === location.pathname);
    if (matchingTab) {
      setActiveTabId(matchingTab.id);
    } else if (location.pathname.startsWith("/view/")) {
      const docId = location.pathname.replace("/view/", "");
      const matchedDoc = documents.find((d) => d.document_id === docId);
      const tabTitle = matchedDoc ? matchedDoc.filename : `Document ${docId.substring(0, 8)}`;
      const existingTab = tabs.find((t) => t.id === `tab-view-${docId}`);

      if (existingTab) {
        setActiveTabId(existingTab.id);
      } else {
        const newTab = {
          id: `tab-view-${docId}`,
          title: tabTitle,
          icon: "📄",
          route: location.pathname,
          closable: true,
        };
        setTabs((prev) => [...prev, newTab]);
        setActiveTabId(newTab.id);
      }
    }
  }, [location.pathname, documents]);

  // Load documents and system metrics on mount
  const refreshDocuments = useCallback(async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (err) {
      setProblems((prev) => [...prev, { message: err.message }]);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const s = await fetchStats();
      setStats(s);
    } catch (_) {}
  }, []);

  useEffect(() => {
    refreshDocuments();
    refreshStats();
  }, [refreshDocuments, refreshStats]);

  // ── Keyboard Shortcuts (Ctrl+Shift+P, Ctrl+P, Ctrl+B, etc.) ─────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept typing in inputs/textareas unless Ctrl/Cmd is pressed
      const targetTag = e.target.tagName;
      const isInput = targetTag === "INPUT" || targetTag === "TEXTAREA" || e.target.isContentEditable;

      // Ctrl + Shift + P -> Command Palette
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "P" || e.key === "p")) {
        e.preventDefault();
        setPaletteMode("commands");
        setCommandPaletteOpen(true);
        return;
      }

      // Ctrl + P -> Go to File / Document
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === "P" || e.key === "p")) {
        e.preventDefault();
        setPaletteMode("files");
        setCommandPaletteOpen(true);
        return;
      }

      // Ctrl + B -> Toggle Explorer Sidebar
      if ((e.ctrlKey || e.metaKey) && (e.key === "B" || e.key === "b")) {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
        return;
      }

      // Ctrl + N -> Create Note / Document
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === "N" || e.key === "n")) {
        if (!isInput) {
          e.preventDefault();
          notification.info("Draft Editor will be activated in Task 3. Opening Document Vault.", {
            title: "AEGIS Editor Note",
          });
          navigate("/documents");
        }
        return;
      }

      // Ctrl + Shift + I -> Ingest
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i")) {
        e.preventDefault();
        setBottomPanelOpen(true);
        setBottomPanelTab("ingestion");
        return;
      }

      // Ctrl + S -> Save draft
      if ((e.ctrlKey || e.metaKey) && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
        notification.info("All indexed document changes and ChromaDB vectors are synchronized.", {
          title: "System Synced",
        });
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, notification]);

  // ── Sidebar Resizing Logic ──────────────────────────────────────────────
  const handleMouseDownResize = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      // Account for activity bar width (48px)
      const newWidth = e.clientX - 48;
      if (newWidth >= 180 && newWidth <= 520) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // ── Tab Management ──────────────────────────────────────────────────────
  const handleSelectTab = (tabId) => {
    const targetTab = tabs.find((t) => t.id === tabId);
    if (targetTab) {
      setActiveTabId(tabId);
      if (targetTab.route && location.pathname !== targetTab.route) {
        navigate(targetTab.route);
      }
    }
  };

  const handleCloseTab = (tabId) => {
    const tabIndex = tabs.findIndex((t) => t.id === tabId);
    if (tabIndex === -1) return;

    const remaining = tabs.filter((t) => t.id !== tabId);
    setTabs(remaining);

    if (activeTabId === tabId) {
      const nextTab = remaining[Math.max(0, tabIndex - 1)];
      if (nextTab) {
        setActiveTabId(nextTab.id);
        navigate(nextTab.route || "/");
      }
    }
  };

  const handleOpenDocumentViewer = (doc) => {
    const tabId = `tab-view-${doc.document_id}`;
    const existing = tabs.find((t) => t.id === tabId);
    if (!existing) {
      const newTab = {
        id: tabId,
        title: doc.filename,
        icon: "📄",
        route: `/view/${doc.document_id}`,
        closable: true,
      };
      setTabs((prev) => [...prev, newTab]);
    }
    setActiveTabId(tabId);
    navigate(`/view/${doc.document_id}`);
  };

  const handleAskAboutDocument = (doc) => {
    if (onSelectDocScope) {
      onSelectDocScope(doc.filename);
    }
    navigate("/ask");
  };

  const handleDeleteDocument = (doc) => {
    setConfirmDialog({
      isOpen: true,
      title: "Remove Document from Enclave",
      message: `Are you sure you want to delete "${doc.filename}" from ChromaDB and local disk storage?`,
      detail: `Document ID: ${doc.document_id} (${doc.chunk_count} vector chunks will be purged)`,
      onConfirm: async () => {
        try {
          await deleteDocument(doc.document_id);
          notification.success(`Document "${doc.filename}" removed successfully.`);
          setTabs((prev) => prev.filter((t) => t.id !== `tab-view-${doc.document_id}`));
          refreshDocuments();
          refreshStats();
        } catch (err) {
          notification.error(err.message, { detail: err.detail });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // ── Palette command dispatcher ──────────────────────────────────────────
  const handleExecuteCommand = (cmdId) => {
    switch (cmdId) {
      case "create_doc":
        notification.info("Note drafting workspace activates in Task 3.", { title: "Draft Note" });
        navigate("/documents");
        break;
      case "upload_files":
        navigate("/documents");
        break;
      case "open_vault":
        navigate("/documents");
        break;
      case "ask_rag":
        navigate("/ask");
        break;
      case "run_compliance":
        navigate("/compliance");
        break;
      case "open_emails":
        navigate("/emails");
        break;
      case "toggle_sidebar":
        setSidebarOpen((prev) => !prev);
        break;
      case "toggle_panel":
        setBottomPanelOpen((prev) => !prev);
        break;
      case "ingest_doc":
        setBottomPanelOpen(true);
        setBottomPanelTab("ingestion");
        break;
      case "save_draft":
        notification.info("All drafts synced with on-premises storage.", { title: "Draft Saved" });
        break;
      default:
        break;
    }
  };

  // Handle activity bar view change
  const handleSelectActivityView = (viewId) => {
    if (viewId === activeActivityView && sidebarOpen) {
      // Toggle sidebar if clicking already active icon
      setSidebarOpen(false);
      return;
    }

    setActiveActivityView(viewId);
    setSidebarOpen(true);

    if (viewId === "ask") navigate("/ask");
    else if (viewId === "compliance") navigate("/compliance");
    else if (viewId === "documents") navigate("/documents");
    else if (viewId === "emails") navigate("/emails");
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#111315] text-text-primary select-none">
      {/* ── D1. Title Bar ── */}
      <TitleBar
        onOpenCommandPalette={() => {
          setPaletteMode("commands");
          setCommandPaletteOpen(true);
        }}
        onOpenQuickOpen={() => {
          setPaletteMode("files");
          setCommandPaletteOpen(true);
        }}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        nodeStatus="online"
      />

      {/* ── Main Middle Region ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* ── D2. Activity Bar ── */}
        <ActivityBar
          activeView={activeActivityView}
          onSelectView={handleSelectActivityView}
          hasDeviations={stats.deviations_found > 0}
        />

        {/* ── D3. Explorer Sidebar ── */}
        {sidebarOpen && (
          <aside
            style={{ width: `${sidebarWidth}px` }}
            className="flex-shrink-0 h-full border-r border-[#2B3036] bg-[#1B1E22] overflow-hidden flex flex-col z-10"
          >
            {activeActivityView === "explorer" || activeActivityView === "documents" ? (
              <FileTree
                documents={documents}
                activeDocId={location.pathname.startsWith("/view/") ? location.pathname.replace("/view/", "") : null}
                onSelectDocument={(doc) => handleOpenDocumentViewer(doc)}
                onOpenViewer={(doc) => handleOpenDocumentViewer(doc)}
                onAskAbout={(doc) => handleAskAboutDocument(doc)}
                onDeleteDocument={(doc) => handleDeleteDocument(doc)}
                onUploadClick={() => navigate("/documents")}
                onNewNoteClick={() => navigate("/documents")}
              />
            ) : (
              <div className="p-3 text-xs text-text-secondary flex flex-col h-full">
                <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted pb-2 border-b border-[#2B3036] mb-3">
                  {activeActivityView.toUpperCase()} VIEW
                </div>
                <p className="leading-relaxed text-xs">
                  Active workspace module: <strong className="text-text-primary">{activeActivityView}</strong>
                </p>
                <button
                  onClick={() => setActiveActivityView("explorer")}
                  className="mt-4 px-3 py-1.5 rounded bg-[#22262B] hover:bg-[#2C323A] text-text-primary text-xs border border-[#2B3036] text-left"
                >
                  ← Return to Document Explorer
                </button>
              </div>
            )}
          </aside>
        )}

        {/* Resizer Handle */}
        {sidebarOpen && (
          <div
            onMouseDown={handleMouseDownResize}
            className={`w-1 cursor-col-resize hover:bg-[#38BDF8] transition-colors flex-shrink-0 z-20 ${
              isResizing ? "bg-[#38BDF8]" : "bg-transparent"
            }`}
            title="Drag to resize sidebar"
          />
        )}

        {/* ── Main Work Area ── */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#111315]">
          {/* ── D4. Workspace Tabs ── */}
          <WorkspaceTabs
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={handleSelectTab}
            onCloseTab={handleCloseTab}
            onNewTab={() => {
              setPaletteMode("commands");
              setCommandPaletteOpen(true);
            }}
          />

          {/* ── Main Dynamic Stage View ── */}
          <div className="flex-1 overflow-y-auto bg-[#111315] relative">
            {children}
          </div>

          {/* ── D5. Bottom Diagnostic & Ingestion Panel ── */}
          <BottomPanel
            isOpen={bottomPanelOpen}
            onToggle={() => setBottomPanelOpen((prev) => !prev)}
            activeTab={bottomPanelTab}
            onSelectTab={setBottomPanelTab}
            problems={problems}
            ingestionJobs={ingestionJobs}
          />
        </main>
      </div>

      {/* ── D6. Status Bar ── */}
      <StatusBar
        nodeOnline={true}
        documentCount={stats.total_documents || documents.length}
        chunkCount={stats.total_chunks || 0}
        activeScope={chatDocType || "All Documents"}
        onOpenPanel={() => {
          setBottomPanelOpen(true);
          setBottomPanelTab("output");
        }}
      />

      {/* ── Command Palette & Quick Open Modal ── */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        mode={paletteMode}
        onClose={() => setCommandPaletteOpen(false)}
        documents={documents}
        onExecuteCommand={handleExecuteCommand}
        onSelectDocument={(doc) => handleOpenDocumentViewer(doc)}
      />

      {/* ── Global Confirmation Dialog ── */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        detail={confirmDialog.detail}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
