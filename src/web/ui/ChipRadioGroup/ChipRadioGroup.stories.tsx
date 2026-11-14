import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ChipRadioGroup } from "./ChipRadioGroup.tsx";

const meta = {
  title: "Design system/ChipRadioGroup",
  component: ChipRadioGroup,
  args: {
    legend: "Kind",
    value: "movement",
    onChange: () => {},
    options: [
      { value: "movement", label: "Movement", tone: "movement" },
      { value: "home", label: "Home", tone: "home" },
      { value: "errands", label: "Errands", tone: "errands" },
      { value: "rest", label: "Rest", tone: "rest" },
      { value: "people", label: "People", tone: "people" },
    ],
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <ChipRadioGroup {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof ChipRadioGroup<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MovementChosen: Story = {};
export const RestChosen: Story = { args: { value: "rest" } };
