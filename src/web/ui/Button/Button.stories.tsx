import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button.tsx";

const meta = {
  title: "Design system/Button",
  component: Button,
  args: { children: "Today" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Primary: Story = {
  args: { variant: "primary", icon: "plus", children: "Add activity" },
};
export const Ghost: Story = {
  args: { variant: "ghost", children: "Keep as my starting point" },
};
export const Dashed: Story = {
  args: { variant: "dashed", children: "+ New flexible activity" },
};
export const Accent: Story = {
  args: { variant: "accent", size: "sm", children: "Find a time" },
};
export const Small: Story = { args: { size: "sm", children: "Find a time" } };

export const IconOnly: Story = {
  args: { icon: "chevronLeft", iconOnly: true, children: "Previous week" },
};

/** Narrow the viewport under 640 px to see the label go. */
export const CollapseLabel: Story = {
  args: {
    variant: "primary",
    icon: "plus",
    collapseLabel: true,
    children: "Add activity",
  },
};

export const Pressed: Story = {
  args: { pressed: true, children: "English" },
};
export const NotPressed: Story = {
  args: { pressed: false, children: "Português" },
};
export const Disabled: Story = { args: { disabled: true } };
export const Inert: Story = {
  args: { inert: true, variant: "accent", size: "sm", children: "Find a time" },
};
