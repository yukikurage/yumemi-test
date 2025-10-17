import { useRef, useCallback, useState } from "react";

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

export function useMapZoom(
  dimensions: { width: number; height: number },
  updateViewBox: (zoom: number, pan: { x: number; y: number }) => void
) {
  const zoom = useRef(1);
  const pan = useRef({ x: 0, y: 0 });
  const targetZoom = useRef(1);
  const targetPan = useRef({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 }); // グラフによるオフセット
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const animationFrame = useRef<number | null>(null);
  const lastTouchDistance = useRef<number | null>(null);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);

  const smoothAnimate = useCallback(() => {
    const zoomDiff = targetZoom.current - zoom.current;
    const panDiffX = targetPan.current.x - pan.current.x;
    const panDiffY = targetPan.current.y - pan.current.y;

    if (
      Math.abs(zoomDiff) < 0.001 &&
      Math.abs(panDiffX) < 0.5 &&
      Math.abs(panDiffY) < 0.5
    ) {
      zoom.current = targetZoom.current;
      pan.current = targetPan.current;
      animationFrame.current = null;
      updateViewBox(zoom.current, pan.current);
      return;
    }

    zoom.current += zoomDiff * 0.15;
    pan.current = {
      x: pan.current.x + panDiffX * 0.15,
      y: pan.current.y + panDiffY * 0.15,
    };

    updateViewBox(zoom.current, pan.current);
    animationFrame.current = requestAnimationFrame(smoothAnimate);
  }, [updateViewBox]);

  const startAnimation = useCallback(() => {
    if (animationFrame.current === null) {
      animationFrame.current = requestAnimationFrame(smoothAnimate);
    }
  }, [smoothAnimate]);

  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>, svgRef: SVGSVGElement) => {
      e.preventDefault();

      const delta = e.deltaY > 0 ? 0.8 : 1.2;
      const currentZoom = zoom.current;
      const newZoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, currentZoom * delta)
      );

      const rect = svgRef.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const relX = mouseX / rect.width;
      const relY = mouseY / rect.height;

      const currentWidth = dimensions.width / currentZoom;
      const currentHeight = dimensions.height / currentZoom;
      const newWidth = dimensions.width / newZoom;
      const newHeight = dimensions.height / newZoom;

      const currentPan = pan.current;
      const newPanX = currentPan.x + (currentWidth - newWidth) * relX;
      const newPanY = currentPan.y + (currentHeight - newHeight) * relY;

      targetZoom.current = newZoom;
      targetPan.current = { x: newPanX, y: newPanY };

      startAnimation();
    },
    [dimensions, startAnimation]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (zoom.current <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isDragging || zoom.current <= 1) return;
      e.preventDefault();

      const dx = (dragStart.current.x - e.clientX) / targetZoom.current;
      const dy = (dragStart.current.y - e.clientY) / targetZoom.current;

      targetPan.current = {
        x: targetPan.current.x + dx,
        y: targetPan.current.y + dy,
      };

      dragStart.current = { x: e.clientX, y: e.clientY };
      startAnimation();
    },
    [isDragging, startAnimation]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
      if (zoom.current <= 1) return;
      setIsDragging(true);
      dragStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      lastTouchDistance.current = distance;
      lastTouchCenter.current = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      };
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<SVGSVGElement>, svgRef: SVGSVGElement) => {
      e.preventDefault();

      if (e.touches.length === 1 && isDragging && zoom.current > 1) {
        const dx =
          (dragStart.current.x - e.touches[0].clientX) / targetZoom.current;
        const dy =
          (dragStart.current.y - e.touches[0].clientY) / targetZoom.current;

        targetPan.current = {
          x: targetPan.current.x + dx,
          y: targetPan.current.y + dy,
        };

        dragStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };

        startAnimation();
      } else if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const center = {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2,
        };

        if (lastTouchDistance.current && lastTouchCenter.current) {
          const scale = distance / lastTouchDistance.current;
          const currentZoom = zoom.current;
          const newZoom = Math.max(
            MIN_ZOOM,
            Math.min(MAX_ZOOM, currentZoom * scale)
          );

          const rect = svgRef.getBoundingClientRect();
          const relX = center.x / rect.width;
          const relY = center.y / rect.height;

          const currentWidth = dimensions.width / currentZoom;
          const currentHeight = dimensions.height / currentZoom;
          const newWidth = dimensions.width / newZoom;
          const newHeight = dimensions.height / newZoom;

          const currentPan = pan.current;
          const newPanX = currentPan.x + (currentWidth - newWidth) * relX;
          const newPanY = currentPan.y + (currentHeight - newHeight) * relY;

          targetZoom.current = newZoom;
          targetPan.current = { x: newPanX, y: newPanY };

          startAnimation();
        }

        lastTouchDistance.current = distance;
        lastTouchCenter.current = center;
      }
    },
    [isDragging, dimensions, startAnimation]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    lastTouchDistance.current = null;
    lastTouchCenter.current = null;
  }, []);

  const setOffset = useCallback(
    (newOffset: { x: number; y: number }) => {
      const currentOffset = offset.current;
      const currentPan = targetPan.current;
      const currentZoom = zoom.current;

      // スクリーン座標系のオフセットをviewBox座標系に変換
      const viewBoxOffsetX = newOffset.x / currentZoom;
      const viewBoxOffsetY = newOffset.y / currentZoom;
      const currentViewBoxOffsetX = currentOffset.x / currentZoom;
      const currentViewBoxOffsetY = currentOffset.y / currentZoom;

      // 現在のオフセットを引いて新しいオフセットを足す
      targetPan.current = {
        x: currentPan.x - currentViewBoxOffsetX + viewBoxOffsetX,
        y: currentPan.y - currentViewBoxOffsetY + viewBoxOffsetY,
      };

      offset.current = newOffset;
      startAnimation();
    },
    [startAnimation]
  );

  return {
    zoom,
    pan,
    isDragging,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    setOffset,
  };
}
