import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SelectField } from "./SelectField.tsx";

const meta = {
  title: "Design system/SelectField",
  component: SelectField,
  args: {
    label: "Each time takes",
    value: "30",
    onChange: () => {},
    options: [
      { value: "15", label: "15 min" },
      { value: "30", label: "30 min" },
      { value: "45", label: "45 min" },
      { value: "60", label: "1 h" },
      { value: "90", label: "1 h 30 min" },
      { value: "120", label: "2 h" },
      { value: "180", label: "3 h" },
    ],
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <SelectField {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof SelectField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Duration: Story = {};
