import type { Meta, StoryObj } from "@storybook/react-vite";
import { Swatch } from "./Swatch.tsx";

const meta = {
  title: "Design system/Swatch",
  component: Swatch,
  args: { tone: "movement", shape: "dot" },
} satisfies Meta<typeof Swatch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Movement: Story = {};
export const Home: Story = { args: { tone: "home" } };
export const Errands: Story = { args: { tone: "errands" } };
export const Rest: Story = { args: { tone: "rest" } };
export const People: Story = { args: { tone: "people" } };
export const Anchor: Story = { args: { tone: "anchor" } };
export const Square: Story = { args: { shape: "square" } };
export const AnchorSquare: Story = {
  args: { tone: "anchor", shape: "square" },
};
