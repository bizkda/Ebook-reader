import { useEffect, useRef, RefObject } from 'react';

export function usePinchZoom(
  ref: RefObject<HTMLElement | null>,
  zoom: number,
  setZoom: (z: number) => void,
  min: number,
  max: number,
){
  // keep the latest zoom in a ref so the listeners never use a stale value

    const zoomRef = useRef(zoom);
    zoomRef.current = zoom;
    const setZoomRef = useRef(setZoom);
    setZoomRef.current = setZoom;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startDist = 0;
    let startZoom = 1;
    let raf = 0;

    const clamp = (z: number) => Math.min(max, Math.max(min, z));
    const dist = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        startDist = dist(e.touches);
        startZoom = zoomRef.current;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !startDist) return;
      e.preventDefault(); // stop the browser's own page zoom
      const next = clamp(startZoom * (dist(e.touches) / startDist));
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setZoom(next));
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) startDist = 0;
    };

    // trackpad pinch on desktop (browsers send it as ctrl + wheel)
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setZoom(clamp(zoomRef.current * Math.exp(-e.deltaY * 0.01)));
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
      el.removeEventListener('wheel', onWheel);
    };
  }, [ref, setZoom, min, max]);
}