import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge.tsx";

const meta = {
  title: "Design system/Badge",
  component: Badge,
  args: { tone: "count", children: "4 left" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Count: Story = {};
export const Now: Story = { args: { tone: "now", children: "Now" } };
