import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckboxRow } from "./CheckboxRow.tsx";

const meta = {
  title: "Design system/CheckboxRow",
  component: CheckboxRow,
  args: { title: "Gym class", meta: "7:00 – 8:00 AM", checked: false },
} satisfies Meta<typeof CheckboxRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};
export const Checked: Story = { args: { checked: true } };
export const WithTrailingBadge: Story = {
  args: {
    title: "Work",
    meta: "9:00 AM – 6:00 PM",
    trailing: (
      <span
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          color: "var(--accent)",
          border: "1px solid var(--line)",
          borderRadius: 999,
          padding: "1px 8px",
        }}
      >
        Now
      </span>
    ),
  },
};
export const LongTitle: Story = {
  args: {
    title: "Clean the apartment and take out the recycling before dinner",
  },
};
export const Disabled: Story = { args: { disabled: true } };
export const Inert: Story = { args: { inert: true, checked: true } };
