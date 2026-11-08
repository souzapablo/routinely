import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card.tsx";

const meta = {
  title: "Design system/Card",
  component: Card,
  args: { children: "Fit in this week" },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoPadding: Story = {};
export const Medium: Story = { args: { padding: "md" } };
export const Large: Story = { args: { padding: "lg" } };

export const AsAside: Story = {
  args: {
    as: "aside",
    padding: "md",
    "aria-label": "Fit in this week",
  },
};
