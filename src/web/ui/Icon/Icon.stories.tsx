import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon, type IconName } from "./Icon.tsx";

const meta = {
  title: "Design system/Icon",
  component: Icon,
  args: { name: "plus", size: 16 },
  argTypes: { size: { control: "inline-radio", options: [12, 16] } },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Plus: Story = { args: { name: "plus" } };
export const Lock: Story = { args: { name: "lock" } };
export const ChevronLeft: Story = { args: { name: "chevronLeft" } };
export const ChevronRight: Story = { args: { name: "chevronRight" } };
export const Grip: Story = { args: { name: "grip" } };
export const X: Story = { args: { name: "x" } };
export const Check: Story = { args: { name: "check" } };
export const Info: Story = { args: { name: "info" } };

const allNames: IconName[] = [
  "plus",
  "lock",
  "chevronLeft",
  "chevronRight",
  "grip",
  "x",
  "check",
  "info",
];

export const AllAt16: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      {allNames.map((name) => (
        <Icon key={name} name={name} size={16} />
      ))}
    </div>
  ),
};

export const AllAt12: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      {allNames.map((name) => (
        <Icon key={name} name={name} size={12} />
      ))}
    </div>
  ),
};
