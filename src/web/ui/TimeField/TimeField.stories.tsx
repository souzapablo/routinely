import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TimeField } from "./TimeField.tsx";

const meta = {
  title: "Design system/TimeField",
  component: TimeField,
  args: { label: "Starts", value: "09:00", onChange: () => {} },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <TimeField {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof TimeField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Filled: Story = {};
export const Empty: Story = { args: { label: "Ends", value: "" } };
