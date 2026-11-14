import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Stepper } from "./Stepper.tsx";

const meta = {
  title: "Design system/Stepper",
  component: Stepper,
  args: {
    label: "Times per week",
    min: 1,
    max: 14,
    value: 2,
    decrementLabel: "Fewer times",
    incrementLabel: "More times",
    onChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <Stepper {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Middle: Story = {};
export const AtMin: Story = { args: { value: 1 } };
export const AtMax: Story = { args: { value: 14 } };
