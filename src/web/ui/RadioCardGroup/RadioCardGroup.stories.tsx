import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { RadioCardGroup } from "./RadioCardGroup.tsx";

const meta = {
  title: "Design system/RadioCardGroup",
  component: RadioCardGroup,
  args: {
    legend: "Type",
    value: "anchor",
    onChange: () => {},
    options: [
      {
        value: "anchor",
        title: "Anchor",
        description: "Same days and time every week. Can't be dragged.",
        icon: "lock",
      },
      {
        value: "flexible",
        title: "Flexible",
        description: "A goal for the week. Drag it wherever it fits.",
        icon: "moveHorizontal",
      },
    ],
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <RadioCardGroup {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof RadioCardGroup<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AnchorChosen: Story = {};
export const FlexibleChosen: Story = { args: { value: "flexible" } };
