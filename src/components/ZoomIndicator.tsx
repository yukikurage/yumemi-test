import type { RefObject } from "react";

type ZoomIndicatorProps = {
  indicatorRef: RefObject<HTMLDivElement | null>;
};

export function ZoomIndicator({ indicatorRef }: ZoomIndicatorProps) {
  return (
    <div className="absolute left-4 top-4 flex flex-col items-center gap-2">
      <div className="relative h-64 w-1 bg-gray-300 rounded-full">
        <div
          ref={indicatorRef}
          className="absolute w-4 h-4 bg-gray-400 rounded-full -left-1.5"
          style={{
            transform: "translateY(-50%)",
          }}
        />
      </div>
    </div>
  );
}
