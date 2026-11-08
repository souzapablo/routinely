import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "./Stack.tsx";

function Box({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "8px 12px",
        border: "1px solid var(--line)",
        borderRadius: "var(--r)",
        background: "var(--surface)",
      }}
    >
      {label}
    </div>
  );
}

const boxes = (
  <>
    <Box label="Work" />
    <Box label="Run 5 km" />
    <Box label="Read" />
  </>
);

const meta = {
  title: "Design system/Stack",
  component: Stack,
  args: { gap: 3, children: boxes },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Column: Story = {};
export const Row: Story = { args: { direction: "row" } };

export const Gaps: Story = {
  render: () => (
    <Stack gap={6}>
      {([0, 1, 2, 3, 4, 5, 6, 7] as const).map((gap) => (
        <Stack key={gap} direction="row" gap={gap}>
          {boxes}
        </Stack>
      ))}
    </Stack>
  ),
};

export const Align: Story = {
  render: () => (
    <Stack gap={6}>
      {(["start", "center", "end", "stretch", "baseline"] as const).map(
        (align) => (
          <Stack key={align} direction="row" gap={3} align={align}>
            <Box label={align} />
            <div style={{ height: 56, width: 8, background: "var(--line)" }} />
          </Stack>
        ),
      )}
    </Stack>
  ),
};

export const Justify: Story = {
  render: () => (
    <Stack gap={6}>
      {(["start", "center", "end", "between"] as const).map((justify) => (
        <Stack key={justify} direction="row" gap={3} justify={justify}>
          <Box label={justify} />
          <Box label="Read" />
        </Stack>
      ))}
    </Stack>
  ),
};

export const Wrap: Story = {
  render: () => (
    <div style={{ width: 220 }}>
      <Stack direction="row" gap={3} wrap>
        {boxes}
        {boxes}
      </Stack>
    </div>
  ),
};

export const AsSection: Story = {
  args: { as: "section", "aria-label": "Fit in this week" },
};
