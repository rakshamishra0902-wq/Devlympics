import { useEffect } from "react";

export default function ConfirmDialog({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed with this operation?",
  detail = null,
  confirmLabel = "Confirm",
  confirmVariant = "danger", // 'danger' | 'primary'
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-[#191C20] border border-[#2B3036] rounded shadow-dialog overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-5 py-4 border-b border-[#2B3036] flex items-center justify-between bg-[#17191C]">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            {confirmVariant === "danger" ? (
              <span className="text-[#F87171]">⚠</span>
            ) : (
              <span className="text-[#38BDF8]">ℹ</span>
            )}
            {title}
          </h3>
          <button
            onClick={onCancel}
            className="text-text-muted hover:text-text-primary text-xs p-1"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-text-primary leading-relaxed">{message}</p>
          {detail && (
            <div className="p-2.5 bg-[#111315] border border-[#2B3036] rounded text-[11px] font-mono text-text-secondary overflow-x-auto max-h-32">
              {detail}
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 bg-[#17191C] border-t border-[#2B3036] flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded text-xs text-text-secondary hover:text-text-primary bg-[#22262B] hover:bg-[#2C323A] border border-[#2B3036] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3.5 py-1.5 rounded text-xs font-medium text-white transition-colors ${
              confirmVariant === "danger"
                ? "bg-[#DC2626] hover:bg-[#B91C1C] border border-[#EF4444]"
                : "bg-[#0284C7] hover:bg-[#0369A1] border border-[#38BDF8]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
