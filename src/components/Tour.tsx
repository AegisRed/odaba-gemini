import React from 'react';
import { createPortal } from "react-dom";

export type TourStep = {
  target: string;
  title: string;
  desc: string;
  placement?: "top" | "bottom" | "left" | "right";
};

const useRect = (selector: string) => {
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  React.useLayoutEffect(() => {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) { setRect(null); return; }
    const update = () => {
      const r = el.getBoundingClientRect();
      setRect(new DOMRect(
        Math.round(r.left + window.scrollX),
        Math.round(r.top + window.scrollY),
        Math.round(r.width),
        Math.round(r.height)
      ));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [selector]);
  return rect;
};

const Spotlight: React.FC<{ rect: DOMRect | null }> = ({ rect }) => {
  if (!rect) return null;
  const pad = 8;
  const style: React.CSSProperties = {
    position: "absolute",
    left: rect.x - pad,
    top: rect.y - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
    borderRadius: 12,
    boxShadow: "0 0 0 9999px rgba(0,0,0,.6)",
    outline: "2px solid rgba(16,185,129,.9)",
    pointerEvents: "none",
    zIndex: 100000,
    transition: "all .2s ease"
  };
  return <div style={style} />;
};

const HintBubble: React.FC<{
  rect: DOMRect | null;
  step: TourStep;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}> = ({ rect, step, index, total, onPrev, onNext, onClose }) => {
  if (!rect) return null;
  const gap = 12;
  const pos: React.CSSProperties = { position: "absolute", zIndex: 100001, maxWidth: 320 };
  const place = step.placement || "bottom";
  
  // Smart positioning to prevent going off-screen
  if (place === "bottom") { 
    pos.left = rect.x; 
    pos.top = rect.y + rect.height + gap; 
    // Check if bottom placement would go off-screen, if so, switch to top
    if (pos.top + 120 > window.innerHeight) {
      pos.top = rect.y - gap; 
      pos.transform = "translateY(-100%)"; 
    }
  }
  if (place === "top") { 
    pos.left = rect.x; 
    pos.top = rect.y - gap; 
    pos.transform = "translateY(-100%)"; 
    // Check if top placement would go off-screen, if so, switch to bottom
    if (pos.top < 20) {
      pos.top = rect.y + rect.height + gap; 
      pos.transform = "none"; 
    }
  }
  if (place === "left") { 
    pos.left = rect.x - gap; 
    pos.top = rect.y; 
    pos.transform = "translateX(-100%)"; 
  }
  if (place === "right") { 
    // Check if right placement would go off-screen, if so, switch to left
    const rightPos = rect.x + rect.width + gap;
    if (rightPos + 320 > window.innerWidth) {
      pos.left = rect.x - gap; 
      pos.top = rect.y; 
      pos.transform = "translateX(-100%)"; 
    } else {
      pos.left = rightPos; 
      pos.top = rect.y; 
    }
  }

  // Adjust horizontal position to prevent going off-screen
  if (typeof pos.left === 'number' && pos.left < 20) {
    pos.left = 20;
  }
  if (typeof pos.left === 'number' && pos.left > window.innerWidth - 340) {
    pos.left = window.innerWidth - 340;
  }

  return (
    <div style={pos} className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-3 shadow-xl pointer-events-auto">
      <div className="text-sm font-semibold mb-1">{step.title}</div>
      <div className="text-sm text-zinc-600 dark:text-zinc-300 mb-3">{step.desc}</div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-zinc-500">{index + 1}/{total}</span>
        <div className="flex gap-2">
          <button 
            onClick={onPrev} 
            className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm"
            aria-label="Previous step"
          >
            Previous
          </button>
          <button 
            onClick={onNext} 
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm"
            aria-label={index + 1 === total ? "Finish tour" : "Next step"}
          >
            {index + 1 === total ? "Finish" : "Next"}
          </button>
          <button 
            onClick={onClose} 
            className="px-2 py-1.5 text-xs text-zinc-500"
            aria-label="Skip tour"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export const TourOverlay: React.FC<{
  steps: TourStep[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}> = ({ steps, index, onIndex, onClose }) => {
  const step = steps[index];
  const rect = useRect(step?.target || "");
  
  // Auto-scroll to target
  React.useEffect(() => {
    const el = step ? document.querySelector(step.target) as HTMLElement : null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }, [step]);

  if (!step) return null;
  
  return createPortal(
    <>
      <div className="fixed inset-0 z-[99998]" style={{ pointerEvents: "none" }} />
      <Spotlight rect={rect} />
      <HintBubble
        rect={rect}
        step={step}
        index={index}
        total={steps.length}
        onPrev={() => onIndex(Math.max(0, index - 1))}
        onNext={() => index + 1 >= steps.length ? onClose() : onIndex(index + 1)}
        onClose={onClose}
      />
    </>,
    document.body
  );
};
