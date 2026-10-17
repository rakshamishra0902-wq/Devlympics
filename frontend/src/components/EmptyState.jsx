export default function EmptyState({
  icon = "📂",
  title = "No documents found",
  description = "No items match your query or have been indexed yet.",
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 rounded border border-dashed border-[#2B3036] bg-[#17191C]/50 ${className}`}
    >
      <div className="w-10 h-10 rounded flex items-center justify-center bg-[#22262B] text-xl mb-3 text-text-secondary border border-[#2B3036]">
        {icon}
      </div>
      <h4 className="text-text-primary text-sm font-medium mb-1">{title}</h4>
      <p className="text-text-secondary text-xs max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-3 py-1.5 rounded text-xs font-medium bg-[#22262B] hover:bg-[#2C323A] text-text-primary border border-[#2B3036] hover:border-[#38BDF8] transition-colors flex items-center gap-1.5"
        >
          <span>+</span>
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
