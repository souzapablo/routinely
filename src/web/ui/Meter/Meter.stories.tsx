import type { Meta, StoryObj } from "@storybook/react-vite";
import { Meter } from "./Meter.tsx";

const meta = {
  title: "Design system/Meter",
  component: Meter,
  args: { value: 4, max: 13, label: "This week" },
} satisfies Meta<typeof Meter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = { args: { value: 0 } };
export const Partial: Story = {};
export const Full: Story = { args: { value: 13 } };
