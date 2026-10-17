import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const STORAGE_KEY = "aegis-coldstart-banner-dismissed";

export default function ColdStartBanner() {
  const [visible, setVisible] = useState(() => {
    return !sessionStorage.getItem(STORAGE_KEY);
  });
  const bannerRef = useRef(null);

  useGSAP(
    () => {
      if (!visible || !bannerRef.current) return;
      gsap.fromTo(
        bannerRef.current,
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: "power2.out", delay: 0.2 }
      );
    },
    { dependencies: [visible] }
  );

  const dismiss = () => {
    if (!bannerRef.current) return;
    gsap.to(bannerRef.current, {
      y: -10,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setVisible(false);
      },
    });
  };

  if (!visible) return null;

  return (
    <div
      ref={bannerRef}
      className="mx-4 mt-3 rounded border border-[#4ADE80]/30 bg-[#4ADE80]/[0.05] px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs font-sans"
    >
      <div className="flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse flex-shrink-0" />
        <div>
          <span className="font-semibold text-[#4ADE80] font-mono text-[11px] uppercase tracking-wider mr-1.5">
            AEGIS AI Air-Gapped Enclave:
          </span>
          <span className="text-text-primary text-xs">
            Operating 100% on-premises. Zero cloud telemetry. Specifications, P&amp;IDs, and vendor submittals remain isolated on local hardware.
          </span>
        </div>
      </div>

      <button
        onClick={dismiss}
        className="text-text-muted hover:text-text-primary p-1 text-xs flex-shrink-0"
        title="Dismiss notice"
      >
        ✕
      </button>
    </div>
  );
}
