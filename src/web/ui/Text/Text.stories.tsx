import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "./Text.tsx";

const meta = {
  title: "Design system/Text",
  component: Text,
  args: { children: "Run 5 km" },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Muted: Story = {
  args: { tone: "muted", children: "No fixed day or time." },
};
export const Faint: Story = { args: { tone: "faint", children: "6 AM" } };
export const Error: Story = {
  args: { tone: "error", children: "Server: can't connect" },
};

export const Sizes: Story = {
  render: () => (
    <div>
      <Text size="md">Medium, 15 px</Text>
      <Text size="sm">Small, 13.5 px</Text>
      <Text size="xs">Extra small, 12.5 px</Text>
    </div>
  ),
};

export const Weights: Story = {
  render: () => (
    <div>
      <Text weight="regular">Regular</Text>
      <Text weight="medium">Medium</Text>
      <Text weight="semibold">Semibold</Text>
    </div>
  ),
};

export const Mono: Story = {
  args: { mono: true, size: "xs", tone: "muted", children: "7:00 – 8:00 PM" },
};

export const Truncate: Story = {
  render: () => (
    <div style={{ width: 140 }}>
      <Text truncate weight="medium">
        A very long activity name that does not fit
      </Text>
    </div>
  ),
};

export const Strike: Story = {
  args: { strike: true, tone: "muted", children: "Gym class" },
};
