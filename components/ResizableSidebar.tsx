"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MIN_WIDTH = 200;
const MAX_WIDTH = 420;
const DEFAULT_WIDTH = 256; // matches the old fixed w-64
const STORAGE_KEY = "amb_sidebar_width";

// Wraps the sidebar content in a div whose width can be dragged from the
// right edge. Width is remembered per-browser via localStorage.
export default function ResizableSidebar({ children }: { children: React.ReactNode }) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const dragging = useRef(false);

  useEffect(() => {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    if (saved >= MIN_WIDTH && saved <= MAX_WIDTH) setWidth(saved);
  }, []);

  const onMouseDown = useCallback(() => {
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      setWidth(next);
    }
    function onMouseUp() {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setWidth((w) => {
        localStorage.setItem(STORAGE_KEY, String(w));
        return w;
      });
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <div className="relative flex shrink-0" style={{ width }}>
      <div className="flex w-full flex-col overflow-hidden">{children}</div>
      <div
        onMouseDown={onMouseDown}
        onDoubleClick={() => {
          setWidth(DEFAULT_WIDTH);
          localStorage.setItem(STORAGE_KEY, String(DEFAULT_WIDTH));
        }}
        title="Drag to resize · double-click to reset"
        className="group absolute right-0 top-0 z-10 h-full w-1.5 cursor-col-resize"
      >
        <div className="h-full w-px bg-white/0 transition-colors group-hover:bg-brand/60" />
      </div>
    </div>
  );
}
