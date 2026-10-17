import { useState, useEffect } from "react";

export default function SearchBar({
  value = "",
  onChange,
  placeholder = "Search documents, specs, chunks...",
  shortcut = "Ctrl+P",
  debounceMs = 250,
  className = "",
  autoFocus = false,
  onKeyDown,
}) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onChange && internalValue !== value) {
        onChange(internalValue);
      }
    }, debounceMs);
    return () => clearTimeout(handler);
  }, [internalValue, debounceMs, onChange, value]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <span className="absolute left-2.5 text-text-muted pointer-events-none text-xs">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full bg-[#17191C] text-text-primary text-xs pl-8 pr-14 py-1.5 rounded border border-[#2B3036] focus:border-[#38BDF8] focus:outline-none placeholder:text-text-muted transition-colors font-sans"
      />
      {internalValue ? (
        <button
          onClick={() => {
            setInternalValue("");
            if (onChange) onChange("");
          }}
          className="absolute right-2 text-text-muted hover:text-text-primary text-xs px-1"
          title="Clear search"
        >
          ✕
        </button>
      ) : shortcut ? (
        <span className="absolute right-2 text-[10px] font-mono text-text-muted bg-[#22262B] px-1.5 py-0.5 rounded border border-[#2B3036] pointer-events-none">
          {shortcut}
        </span>
      ) : null}
    </div>
  );
}
