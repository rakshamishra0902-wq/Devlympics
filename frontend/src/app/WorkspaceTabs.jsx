export default function WorkspaceTabs({
  tabs = [],
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
}) {
  return (
    <div className="h-9 bg-[#17191C] border-b border-[#2B3036] flex items-center justify-between select-none overflow-x-auto flex-shrink-0 z-10 text-xs">
      <div className="flex items-center h-full flex-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group flex items-center gap-2 h-full px-3.5 border-r border-[#2B3036] cursor-pointer transition-colors max-w-[220px] ${
                isActive
                  ? "bg-[#111315] text-text-primary border-t-2 border-t-[#38BDF8]"
                  : "bg-[#17191C] text-text-secondary hover:bg-[#1C1F23] hover:text-text-primary"
              }`}
              title={tab.title}
            >
              {/* Tab Icon */}
              <span className="text-xs flex-shrink-0">
                {tab.icon || "📄"}
              </span>

              {/* Tab Title */}
              <span className="truncate text-xs font-sans">
                {tab.title}
              </span>

              {/* Dirty / unsaved draft dot */}
              {tab.dirty && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] flex-shrink-0"
                  title="Unsaved changes"
                />
              )}

              {/* Close Button */}
              {tab.closable !== false && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="w-4 h-4 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-[#2B3036] opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                  title="Close tab"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* New Tab Quick launcher button */}
      {onNewTab && (
        <div className="px-2 flex-shrink-0 border-l border-[#2B3036] flex items-center">
          <button
            onClick={onNewTab}
            title="Open Module / New Tab"
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-[#22262B] transition-colors text-xs"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
