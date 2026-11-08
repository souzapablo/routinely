import { useEffect, useState, type RefObject } from "react";

/** The element's inner height, kept up to date while `enabled`; null otherwise. */
export function useElementHeight(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
): number | null {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) {
      setHeight(null);
      return;
    }
    const measure = () => setHeight(element.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, enabled]);

  return height;
}
