import { useEffect, useRef, useState } from 'react';

export type TooltipState = { text: string; x: number; y: number; visible: boolean };

/**
 * Global hover tooltips, driven entirely by `data-tip="..."`
 * attributes — no per-component wiring needed.
 * Hover any element with [data-tip] and a floating bubble
 * appears next to the cursor.
 */
export function useTooltip() {
  const [tip, setTip] = useState<TooltipState>({ text: '', x: 0, y: 0, visible: false });
  const timer = useRef<number | null>(null);
  const currentEl = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const show = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.('[data-tip]') as HTMLElement | null;
      if (!target) return;
      const text = target.dataset.tip;
      if (!text) return;
      currentEl.current = target;
      const gap = 12;
      let x = e.clientX + gap;
      let y = e.clientY + gap;
      // Rough flip near the right/bottom edge (bubble is ~260x64 max)
      if (x > window.innerWidth - 280) x = e.clientX - gap - 260;
      if (y > window.innerHeight - 90) y = e.clientY - gap - 70;
      setTip({ text, x, y, visible: true });
    };
    const hide = () => setTip((t) => ({ ...t, visible: false }));

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.('[data-tip]') as HTMLElement | null;
      if (!target || !target.dataset.tip) { hide(); return; }
      if (target === currentEl.current && tip.visible) return; // already showing, don't restart
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => { currentEl.current = target; show(e); }, 350);
    };
    const onMove = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.('[data-tip]') as HTMLElement | null;
      if (target && target.dataset.tip && currentEl.current === target && tip.visible) {
        setTip((t) => ({ ...t, x: e.clientX + 12, y: e.clientY + 12 }));
      }
    };
    const onOut = (e: MouseEvent) => {
      const from = (e.target as HTMLElement)?.closest?.('[data-tip]') as HTMLElement | null;
      const to = (e.relatedTarget as HTMLElement | null)?.closest?.('[data-tip]') as HTMLElement | null;
      if (from !== to) {
        if (timer.current) window.clearTimeout(timer.current);
        hide();
        currentEl.current = null;
      }
    };
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseout', onOut);
    window.addEventListener('scroll', hide, true);
    return () => {
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onOut);
      window.removeEventListener('scroll', hide, true);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [tip.visible]);

  return { tip, setTip };
}
