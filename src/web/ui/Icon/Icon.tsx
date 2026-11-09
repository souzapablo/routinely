import {
  Check,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Info,
  Lock,
  Plus,
  X,
  type LucideIcon,
} from "lucide-react";

const icons = {
  plus: Plus,
  lock: Lock,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  grip: GripVertical,
  x: X,
  check: Check,
  info: Info,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

export interface IconProps {
  name: IconName;
  size?: 12 | 16;
}

/** A decorative icon; the control around it carries the accessible name. */
export function Icon({ name, size = 16 }: IconProps) {
  const Glyph = icons[name];
  return <Glyph size={size} strokeWidth={1.8} aria-hidden="true" />;
}
