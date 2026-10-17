import { useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function StatCard({ label, value, index = 0 }) {
  const cardRef = useRef(null);
  const numberRef = useRef(null);
  const counter = useRef({ val: 0 });
  const hasAnimatedIn = useRef(false);

  useGSAP(
    () => {
      if (hasAnimatedIn.current) return;
      hasAnimatedIn.current = true;

      gsap.fromTo(
        cardRef.current,
        { y: 8, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          delay: index * 0.05,
          ease: "power2.out",
        }
      );
    },
    { scope: cardRef }
  );

  useEffect(() => {
    gsap.to(counter.current, {
      val: value,
      duration: 0.8,
      delay: hasAnimatedIn.current ? 0 : index * 0.05 + 0.1,
      ease: "power2.out",
      onUpdate: () => {
        if (numberRef.current) {
          numberRef.current.textContent = Math.round(counter.current.val).toLocaleString();
        }
      },
    });
  }, [value, index]);

  return (
    <div
      ref={cardRef}
      className="bg-[#17191C] border border-[#2B3036] rounded p-4 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
          {label}
        </span>
        <span className="text-[#38BDF8] text-xs">☵</span>
      </div>
      <span ref={numberRef} className="text-2xl font-bold font-mono text-text-primary tracking-tight">
        0
      </span>
    </div>
  );
}
