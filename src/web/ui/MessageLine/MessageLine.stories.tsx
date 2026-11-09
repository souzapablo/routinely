import type { Meta, StoryObj } from "@storybook/react-vite";
import { MessageLine } from "./MessageLine.tsx";

const meta = {
  title: "Design system/MessageLine",
  component: MessageLine,
  args: { tone: "calm", message: "Pick at least one day it repeats on." },
} satisfies Meta<typeof MessageLine>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Calm: Story = {};
export const Error: Story = {
  args: {
    tone: "error",
    message: "Not saved. Your changes are still here, so you can try again.",
  },
};
export const Empty: Story = { args: { message: undefined } };
