import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusIndicator } from "./StatusIndicator.tsx";

const meta = {
  title: "Design system/StatusIndicator",
  component: StatusIndicator,
  args: { tone: "neutral", children: "Example week" },
} satisfies Meta<typeof StatusIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};
export const Ok: Story = { args: { tone: "ok", children: "Saved" } };
export const Busy: Story = { args: { tone: "busy", children: "Saving…" } };
export const Error: Story = {
  args: { tone: "error", children: "Not saved. Check your connection." },
};
