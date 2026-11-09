import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon, type IconName } from "./Icon.tsx";

// Each name and the Lucide icon it must draw (Lucide marks it as `lucide-<icon>`).
const lucideIconOf: Record<IconName, string> = {
  plus: "lucide-plus",
  lock: "lucide-lock",
  chevronLeft: "lucide-chevron-left",
  chevronRight: "lucide-chevron-right",
  grip: "lucide-grip-vertical",
  x: "lucide-x",
  check: "lucide-check",
  info: "lucide-info",
};

function renderIcon(name: IconName, size?: 12 | 16): SVGSVGElement {
  const { container } = render(<Icon name={name} size={size} />);
  const svg = container.querySelector("svg");
  if (!svg) {
    throw new Error(`Icon "${name}" rendered no svg`);
  }
  return svg;
}

describe("Icon", () => {
  const names = Object.keys(lucideIconOf) as IconName[];

  it.each(names)(
    "draws %s as its Lucide icon, hidden from assistive tech",
    (name) => {
      const svg = renderIcon(name);
      expect(svg.classList.contains(lucideIconOf[name])).toBe(true);
      expect(svg.getAttribute("aria-hidden")).toBe("true");
      expect(svg.getAttribute("stroke-width")).toBe("1.8");
    },
  );

  it.each(names)(
    "draws %s at 16 px by default and at 12 px when asked",
    (name) => {
      const regular = renderIcon(name);
      expect(regular.getAttribute("width")).toBe("16");
      expect(regular.getAttribute("height")).toBe("16");

      const small = renderIcon(name, 12);
      expect(small.getAttribute("width")).toBe("12");
      expect(small.getAttribute("height")).toBe("12");
    },
  );
});
