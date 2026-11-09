import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../Button/Button.tsx";
import { Text } from "../Text/Text.tsx";
import { Drawer } from "./Drawer.tsx";

const meta = {
  title: "Design system/Drawer",
  component: Drawer,
  args: {
    open: false,
    title: "Add anchor",
    closeLabel: "Close",
    onClose: () => {},
    children: null,
  },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    return (
      <>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Open drawer
        </Button>
        <Drawer
          {...args}
          open={open}
          onClose={close}
          footer={
            <>
              <Button variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button variant="primary" onClick={close}>
                Save
              </Button>
            </>
          }
        >
          <Text>
            Escape, the close button and a click on the backdrop shut it.
          </Text>
        </Drawer>
      </>
    );
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
