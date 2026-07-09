import { useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export function SwipeView({
  tabs,
  initialIndex = 0,
}: {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  initialIndex?: number;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [drag, setDrag] = useState(0);
  const startX = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    setDrag(e.clientX - startX.current);
  };

  const onPointerUp = () => {
    if (startX.current === null) return;
    const width = trackRef.current?.clientWidth ?? 1;
    const threshold = width * 0.2;
    if (drag < -threshold && index < tabs.length - 1) setIndex(index + 1);
    else if (drag > threshold && index > 0) setIndex(index - 1);
    startX.current = null;
    setDrag(0);
  };

  const offset = -(index * 100) + (drag / (trackRef.current?.clientWidth || 1)) * 100;

  return (
    <div>
      <div className="mb-3 flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setIndex(i)}
            className={cn(
              'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              i === index
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        ref={trackRef}
        className="overflow-hidden"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(${offset}%)`,
            transition: startX.current === null ? 'transform 0.25s ease' : 'none',
          }}
        >
          {tabs.map((t) => (
            <div key={t.id} className="w-full shrink-0 px-0.5">
              {t.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
