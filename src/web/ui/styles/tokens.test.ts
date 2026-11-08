import { describe, expect, it } from "vitest";
import css from "./tokens.css?raw";

// Values are written as the prototype writes them; formatting differences
// (hex case, spaces after commas, leading zeros, line breaks) are ignored.
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ",")
    .replace(/(^|[^\d])\.(\d)/g, "$10.$2")
    .trim();
}

function declarations(block: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const match of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    result[match[1]] = normalize(match[2]);
  }
  return result;
}

function blockAfter(selectorPattern: RegExp): string {
  const match = selectorPattern.exec(css);
  if (match === null) {
    throw new Error(`tokens.css has no block for ${String(selectorPattern)}`);
  }
  const start = css.indexOf("{", match.index + match[0].length - 1) + 1;
  const end = css.indexOf("}", start);
  return css.slice(start, end);
}

function normalizeAll(tokens: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(tokens).map(([name, value]) => [name, normalize(value)]),
  );
}

const colorScheme = (block: string) =>
  /color-scheme\s*:\s*([\w-]+)\s*;/.exec(block)?.[1];

// Light :root block of the prototype; font families use the self-hosted
// names found in T1.
const light = {
  "--bg": "#EEF1F4",
  "--surface": "#FFFFFF",
  "--sunk": "#F5F7F9",
  "--ink": "#18202C",
  "--muted": "#5B6575",
  "--faint": "#8A93A1",
  "--line": "#D9DEE5",
  "--line-soft": "#E8EBF0",
  "--accent": "#1F6F6B",
  "--accent-ink": "#FFFFFF",
  "--accent-soft": "#DDEEEC",
  "--anchor": "#28344A",
  "--anchor-ink": "#EEF2F8",
  "--anchor-sub": "#AEB9CC",
  "--hatch": "rgba(255,255,255,.05)",
  "--ok": "#1F7A4D",
  "--ok-soft": "rgba(31,122,77,.12)",
  "--bad": "#B3373F",
  "--bad-soft": "rgba(179,55,63,.12)",
  "--sage-bg": "#DCEEE2",
  "--sage-ink": "#21573A",
  "--sage-line": "#B4D8C0",
  "--sky-bg": "#DCE8F7",
  "--sky-ink": "#234E7E",
  "--sky-line": "#B7CDEB",
  "--apricot-bg": "#F9E4D0",
  "--apricot-ink": "#7F4413",
  "--apricot-line": "#EDC6A2",
  "--lilac-bg": "#E8E0F6",
  "--lilac-ink": "#53398A",
  "--lilac-line": "#CFC0EC",
  "--rose-bg": "#F6DDE2",
  "--rose-ink": "#86293F",
  "--rose-line": "#EBBAC5",
  "--shadow": "0 1px 2px rgba(24,32,44,.06),0 8px 24px rgba(24,32,44,.08)",
  "--f-display":
    '"Bricolage Grotesque Variable",ui-sans-serif,system-ui,sans-serif',
  "--f-body":
    '"Instrument Sans Variable",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif',
  "--f-mono":
    '"JetBrains Mono",ui-monospace,"Cascadia Mono",Consolas,monospace',
  "--r": "10px",
  "--px": "44px",
};

// Dark block of the prototype (identical under the media query and under
// data-theme="dark").
const dark = {
  "--bg": "#0F131A",
  "--surface": "#161B24",
  "--sunk": "#12171F",
  "--ink": "#E6EAF0",
  "--muted": "#9AA4B4",
  "--faint": "#6E7889",
  "--line": "#2A313D",
  "--line-soft": "#222833",
  "--accent": "#4FB3AC",
  "--accent-ink": "#0B1A19",
  "--accent-soft": "#17302F",
  "--anchor": "#2F3D57",
  "--anchor-ink": "#EEF2F8",
  "--anchor-sub": "#A7B3C8",
  "--hatch": "rgba(255,255,255,.045)",
  "--ok": "#5CC48F",
  "--ok-soft": "rgba(92,196,143,.14)",
  "--bad": "#F07C83",
  "--bad-soft": "rgba(240,124,131,.14)",
  "--sage-bg": "#1C3326",
  "--sage-ink": "#A9DDBC",
  "--sage-line": "#2D4F3A",
  "--sky-bg": "#1B2A40",
  "--sky-ink": "#A9C8F0",
  "--sky-line": "#2C4363",
  "--apricot-bg": "#3A2918",
  "--apricot-ink": "#F2C495",
  "--apricot-line": "#5A3F23",
  "--lilac-bg": "#2A2240",
  "--lilac-ink": "#CDBDF2",
  "--lilac-line": "#413560",
  "--rose-bg": "#3A1F27",
  "--rose-ink": "#F1B3C1",
  "--rose-line": "#5A2F3B",
  "--shadow": "0 1px 2px rgba(0,0,0,.3),0 8px 24px rgba(0,0,0,.35)",
};

describe("tokens.css", () => {
  it("light tokens match the prototype", () => {
    const block = blockAfter(/^:root\s*\{/m);

    expect(declarations(block)).toEqual(normalizeAll(light));
    expect(colorScheme(block)).toBe("light");
  });

  it("dark tokens match the prototype", () => {
    const media =
      /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\)\s*\{/;
    const explicit = /^:root\[data-theme="dark"\]\s*\{/m;

    for (const pattern of [media, explicit]) {
      const block = blockAfter(pattern);
      expect(declarations(block)).toEqual(normalizeAll(dark));
      expect(colorScheme(block)).toBe("dark");
    }
  });
});
