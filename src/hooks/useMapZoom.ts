import { useRef, useCallback, useState } from "react";

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

type XY = { x: number; y: number };

export function useMapZoom(
  dimensions: { width: number; height: number },
  updateViewBox: (zoom: number, pan: XY) => void
) {
  // 状態
  const zoom = useRef(1);
  const pan = useRef<XY>({ x: 0, y: 0 });

  // 目標（スムース用）
  const zT = useRef(1);
  const pT = useRef<XY>({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);

  // 入力管理
  const [isDragging, setDragging] = useState(false);
  const dragStart = useRef<XY>({ x: 0, y: 0 });

  // 2本指（Pointer）管理
  const ptrs = useRef<Map<number, XY>>(new Map());
  const pinchBase = useRef<{ d: number; c: XY } | null>(null);

  // offset
  const offset = useRef<XY>({ x: 0, y: 0 });

  /** スムース更新 */
  const tick = useCallback(() => {
    const dz = zT.current - zoom.current;
    const dx = pT.current.x - pan.current.x;
    const dy = pT.current.y - pan.current.y;

    if (Math.abs(dz) < 1e-3 && Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
      zoom.current = zT.current;
      pan.current = pT.current;
      raf.current = null;
      updateViewBox(zoom.current, pan.current);
      return;
    }
    zoom.current += dz * 0.15;
    pan.current = {
      x: pan.current.x + dx * 0.15,
      y: pan.current.y + dy * 0.15,
    };
    updateViewBox(zoom.current, pan.current);
    raf.current = requestAnimationFrame(tick);
  }, [updateViewBox]);

  const schedule = useCallback(() => {
    if (raf.current == null) raf.current = requestAnimationFrame(tick);
  }, [tick]);

  /** clamp */
  const clampZoom = (z: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));

  /** 指定点を中心にズーム */
  const zoomAt = useCallback(
    (svg: SVGSVGElement, center: XY, scale: number) => {
      const curr = zoom.current;
      const next = clampZoom(curr * scale);
      if (next === curr) return;

      const rect = svg.getBoundingClientRect();
      const relX = (center.x - rect.left) / rect.width;
      const relY = (center.y - rect.top) / rect.height;

      const w0 = dimensions.width / curr;
      const h0 = dimensions.height / curr;
      const w1 = dimensions.width / next;
      const h1 = dimensions.height / next;

      const { x, y } = pan.current;
      pT.current = {
        x: x + (w0 - w1) * relX,
        y: y + (h0 - h1) * relY,
      };
      zT.current = next;
      schedule();
    },
    [dimensions, schedule]
  );

  /** ドラッグでパン */
  const panBy = useCallback(
    (dx: number, dy: number) => {
      const z = zoom.current;
      pT.current = { x: pT.current.x + dx / z, y: pT.current.y + dy / z };
      schedule();
    },
    [schedule]
  );

  /** Wheel（PC デバッグは ctrl/⌘ でピンチ代用） */
  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>, svg: SVGSVGElement) => {
      e.preventDefault();
      zoomAt(svg, { x: e.clientX, y: e.clientY }, e.deltaY > 0 ? 0.8 : 1.2);
    },
    [zoomAt]
  );

  /** Pointer Events */
  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (ptrs.current.size === 1) {
      // 1本 → ドラッグ開始（ズーム>1のみ）
      if (zoom.current > 1) {
        setDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
      }
      pinchBase.current = null;
    } else if (ptrs.current.size >= 2) {
      // 2本 → ピンチ準備
      const [p1, p2] = Array.from(ptrs.current.values()).slice(0, 2);
      const d = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const c = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      pinchBase.current = { d, c };
      setDragging(false); // 競合回避
    }
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>, svg: SVGSVGElement) => {
      if (!ptrs.current.has(e.pointerId)) return;
      ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (ptrs.current.size >= 2 && pinchBase.current && svg) {
        // ピンチ
        const [p1, p2] = Array.from(ptrs.current.values()).slice(0, 2);
        const d = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const c = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

        const scale = d / pinchBase.current.d;
        if (scale !== 1) zoomAt(svg, c, scale);
        pinchBase.current = { d, c }; // 次の基準
        return;
      }

      if (isDragging && zoom.current > 1) {
        // ドラッグ
        const prev = dragStart.current;
        panBy(prev.x - e.clientX, prev.y - e.clientY);
        dragStart.current = { x: e.clientX, y: e.clientY };
      }
    },
    [isDragging, panBy, zoomAt]
  );

  const onPointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    ptrs.current.delete(e.pointerId);
    if (ptrs.current.size < 2) pinchBase.current = null;
    if (ptrs.current.size === 0) setDragging(false);
  }, []);

  // 追加: setOffset 実装（スクリーンpx → viewBox座標で補正）
  const setOffset = useCallback(
    (newOffset: XY) => {
      const curr = zoom.current; // いまの表示ズーム
      const old = offset.current; // 直前のオフセット(スクリーンpx)

      // スクリーン → viewBox 変換（ズームで割る）
      const oldVb = { x: old.x / curr, y: old.y / curr };
      const newVb = { x: newOffset.x / curr, y: newOffset.y / curr };

      // いったん旧オフセットを打ち消し、新オフセットを加える
      pT.current = {
        x: pT.current.x - oldVb.x + newVb.x,
        y: pT.current.y - oldVb.y + newVb.y,
      };

      offset.current = newOffset;
      schedule();
    },
    [schedule]
  );

  /** 公開 API */
  return {
    zoom,
    pan,
    isDragging,
    handleWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    setOffset,
  };
}
