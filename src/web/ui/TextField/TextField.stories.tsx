import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TextField } from "./TextField.tsx";

const meta = {
  title: "Design system/TextField",
  component: TextField,
  args: { label: "Name", value: "", maxLength: 60, onChange: () => {} },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <TextField {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Filled: Story = { args: { value: "Work" } };
