import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { CheckToggle } from "./CheckToggle.tsx";

const meta = {
  title: "Design system/CheckToggle",
  component: CheckToggle,
  args: { pressed: false, label: "Mark done", inert: false },
} satisfies Meta<typeof CheckToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// Each surface a toggle sits on in the grid: the anchor slate and the five category tints.
const surfaces = [
  { name: "Anchor", ink: "--anchor-ink", bg: "--anchor" },
  { name: "Sage", ink: "--sage-ink", bg: "--sage-bg" },
  { name: "Sky", ink: "--sky-ink", bg: "--sky-bg" },
  { name: "Apricot", ink: "--apricot-ink", bg: "--apricot-bg" },
  { name: "Lilac", ink: "--lilac-ink", bg: "--lilac-bg" },
  { name: "Rose", ink: "--rose-ink", bg: "--rose-bg" },
];

function surfaceStyle(ink: string, bg: string) {
  return {
    color: `var(${ink})`,
    background: `var(${bg})`,
    "--check-tick": `var(${bg})`,
    display: "inline-flex",
    gap: 8,
    padding: "6px 8px",
    borderRadius: 7,
  } as CSSProperties;
}

export const OnAnchor: Story = {
  decorators: [
    (Story) => (
      <div style={surfaceStyle("--anchor-ink", "--anchor")}>
        <Story />
      </div>
    ),
  ],
};
export const PressedOnAnchor: Story = {
  ...OnAnchor,
  args: { pressed: true },
};
export const Inert: Story = { ...OnAnchor, args: { inert: true } };

export const EveryTone: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
      {surfaces.map(({ name, ink, bg }) => (
        <div key={name} style={surfaceStyle(ink, bg)}>
          <CheckToggle {...args} pressed={false} label={`${name} open`} />
          <CheckToggle {...args} pressed label={`${name} done`} />
        </div>
      ))}
    </div>
  ),
};
