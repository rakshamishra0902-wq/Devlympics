import { createContext, useContext, useState, useCallback, useMemo } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [expandedDetails, setExpandedDetails] = useState({});

  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setExpandedDetails((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  const notify = useCallback(
    ({
      type = "info", // 'success' | 'error' | 'warning' | 'info' | 'progress'
      title,
      message,
      detail = null,
      persistent = false,
      duration = 4500,
      progress = null,
      onRetry = null,
    }) => {
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const safeDetail = typeof detail === "object" ? JSON.stringify(detail, null, 2) : detail;

      setNotifications((prev) => {
        // Deduplicate repeated identical notifications within last 5 seconds
        const duplicateIndex = prev.findIndex(
          (n) => n.title === title && n.message === message && Date.now() - n.createdAt < 5000
        );

        if (duplicateIndex !== -1) {
          const updated = [...prev];
          updated[duplicateIndex] = {
            ...updated[duplicateIndex],
            count: (updated[duplicateIndex].count || 1) + 1,
            progress,
            createdAt: Date.now(),
          };
          return updated;
        }

        const newEntry = {
          id,
          type,
          title: title || (type === "error" ? "Operation Failed" : "Notification"),
          message,
          detail: safeDetail,
          persistent: persistent || type === "error", // errors are persistent by default
          progress,
          onRetry,
          count: 1,
          createdAt: Date.now(),
        };

        return [newEntry, ...prev.slice(0, 7)]; // cap stack
      });

      if (!persistent && type !== "error") {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }

      return id;
    },
    [dismiss]
  );

  const toggleDetail = useCallback((id) => {
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const value = useMemo(
    () => ({
      notify,
      dismiss,
      notifications,
      success: (msg, opts) => notify({ type: "success", title: "Success", message: msg, ...opts }),
      error: (msg, opts) => notify({ type: "error", title: "Error Encountered", message: msg, ...opts }),
      warning: (msg, opts) => notify({ type: "warning", title: "Warning", message: msg, ...opts }),
      info: (msg, opts) => notify({ type: "info", title: "System Info", message: msg, ...opts }),
    }),
    [notify, dismiss, notifications]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Visual notification stack */}
      <div className="fixed bottom-8 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {notifications.map((item) => {
          const isExpanded = !!expandedDetails[item.id];
          let borderClass = "border-[#2B3036]";
          let iconColor = "text-[#38BDF8]";
          let icon = "ℹ";

          if (item.type === "success") {
            borderClass = "border-[#4ADE80]/30";
            iconColor = "text-[#4ADE80]";
            icon = "✓";
          } else if (item.type === "error") {
            borderClass = "border-[#F87171]/40";
            iconColor = "text-[#F87171]";
            icon = "✕";
          } else if (item.type === "warning") {
            borderClass = "border-[#FBBF24]/30";
            iconColor = "text-[#FBBF24]";
            icon = "!";
          }

          return (
            <div
              key={item.id}
              className={`pointer-events-auto bg-[#191C20] border ${borderClass} rounded shadow-dialog p-3 text-xs transition-all animate-fade-in`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <span className={`font-mono font-bold text-sm leading-none mt-0.5 ${iconColor}`}>
                    {icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 font-medium text-text-primary">
                      <span>{item.title}</span>
                      {item.count > 1 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#2B3036] text-[10px] text-text-muted font-mono">
                          ×{item.count}
                        </span>
                      )}
                    </div>
                    <div className="text-text-secondary mt-0.5 leading-relaxed break-words">
                      {item.message}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => dismiss(item.id)}
                  className="text-text-muted hover:text-text-primary text-[10px] p-1 leading-none"
                  title="Dismiss notification"
                >
                  ✕
                </button>
              </div>

              {/* Progress bar if present */}
              {item.progress !== null && typeof item.progress === "number" && (
                <div className="mt-2 w-full bg-[#111315] rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-[#38BDF8] h-full transition-all duration-200"
                    style={{ width: `${Math.max(0, Math.min(100, item.progress))}%` }}
                  />
                </div>
              )}

              {/* Actions & Diagnostics toggle */}
              <div className="mt-2 pt-2 border-t border-[#2B3036] flex items-center justify-between text-[11px]">
                {item.detail ? (
                  <button
                    onClick={() => toggleDetail(item.id)}
                    className="text-text-muted hover:text-text-primary font-mono flex items-center gap-1"
                  >
                    <span>{isExpanded ? "▾ Hide Diagnostic" : "▸ Show Diagnostic"}</span>
                  </button>
                ) : (
                  <span />
                )}

                {item.onRetry && (
                  <button
                    onClick={() => {
                      item.onRetry();
                      dismiss(item.id);
                    }}
                    className="px-2 py-0.5 rounded bg-[#22262B] hover:bg-[#2C323A] text-[#38BDF8] border border-[#2B3036] font-medium"
                  >
                    Retry
                  </button>
                )}
              </div>

              {/* Technical expandable diagnostic panel */}
              {isExpanded && item.detail && (
                <pre className="mt-2 p-2 bg-[#111315] border border-[#2B3036] rounded font-mono text-[10px] text-text-secondary max-h-36 overflow-y-auto whitespace-pre-wrap break-all">
                  {item.detail}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return ctx;
}
