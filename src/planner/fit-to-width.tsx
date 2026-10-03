import { useCallback, useState, type JSX, type ReactNode } from 'react';

type FitToWidthProps = {
  readonly width: number;
  readonly height: number;
  readonly children: ReactNode;
};

// Shows content laid out in pixels at its own size, and scaled down when there is less room, so the
// trees and the board keep their in-game look on a phone.
export function FitToWidth({ width, height, children }: FitToWidthProps): JSX.Element {
  const [room, setRoom] = useState<number | null>(null);
  // Measured once it is in the page, then whenever the room changes.
  const measure = useCallback((element: HTMLDivElement | null) => {
    if (element === null) return;
    const update = (): void => {
      setRoom(element.clientWidth);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);
  const scale = room === null ? 1 : Math.min(1, room / width);
  return (
    <div ref={measure} className="fit-to-width" style={{ height: height * scale }}>
      <div
        className="fit-to-width-content"
        style={{ width, height, transform: scale < 1 ? `scale(${scale})` : undefined }}
      >
        {children}
      </div>
    </div>
  );
}
