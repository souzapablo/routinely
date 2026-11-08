import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading } from "./Heading.tsx";

const meta = {
  title: "Design system/Heading",
  component: Heading,
  args: { level: 2, children: "This week" },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = { args: { level: 2, size: "page" } };
export const Section: Story = {
  args: { level: 3, size: "section", children: "Today · Sunday, Nov 8" },
};
export const CardTitle: Story = {
  args: { level: 3, size: "card", children: "Fit in this week" },
};

export const Levels: Story = {
  render: () => (
    <div>
      <Heading level={1} size="section">
        Level 1, section size
      </Heading>
      <Heading level={2} size="section">
        Level 2, section size
      </Heading>
      <Heading level={3} size="section">
        Level 3, section size
      </Heading>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div>
      <Heading level={2} size="page">
        Page, 28 px
      </Heading>
      <Heading level={3} size="section">
        Section, 17 px
      </Heading>
      <Heading level={3} size="card">
        Card, 16 px
      </Heading>
    </div>
  ),
};
