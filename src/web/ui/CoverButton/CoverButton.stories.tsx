import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "../Text/Text.tsx";
import { CoverButton } from "./CoverButton.tsx";

const meta = {
  title: "Design system/CoverButton",
  component: CoverButton,
  args: { label: "Edit Work", onClick: () => {} },
  render: (args) => (
    <div
      style={{
        position: "relative",
        width: 220,
        padding: 12,
        borderRadius: 10,
        background: "var(--anchor)",
        color: "var(--anchor-ink)",
      }}
    >
      <div style={{ pointerEvents: "none" }}>
        <Text weight="semibold">Work</Text>
        <Text size="xs">9:00 AM – 5:00 PM</Text>
      </div>
      <CoverButton {...args} />
    </div>
  ),
} satisfies Meta<typeof CoverButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click anywhere on the block, or Tab to it to see the focus ring. */
export const OverABlock: Story = {};
