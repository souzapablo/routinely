import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../Button/Button.tsx";
import { FieldGroup } from "./FieldGroup.tsx";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const meta = {
  title: "Design system/FieldGroup",
  component: FieldGroup,
  args: { legend: "Repeats on", children: null },
  render: function Render(args) {
    const [on, setOn] = useState([1, 2, 3, 4, 5]);
    const toggle = (day: number) =>
      setOn(on.includes(day) ? on.filter((d) => d !== day) : [...on, day]);
    return (
      <FieldGroup {...args}>
        {days.map((name, day) => (
          <Button
            key={name}
            size="sm"
            pressed={on.includes(day)}
            onClick={() => toggle(day)}
          >
            {name}
          </Button>
        ))}
      </FieldGroup>
    );
  },
} satisfies Meta<typeof FieldGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DayToggles: Story = {};
