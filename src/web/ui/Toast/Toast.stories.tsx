import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../Button/Button.tsx";
import { Toast } from "./Toast.tsx";

const meta = {
  title: "Design system/Toast",
  component: Toast,
  args: { message: "Saved Work.", id: 1, onDone: () => {} },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showing: Story = {};

/** Each click shows the same text again and restarts the timer. */
export const Repeated: Story = {
  render: function Render(args) {
    const [toast, setToast] = useState<{ id: number } | null>(null);
    return (
      <>
        <Button onClick={() => setToast({ id: (toast?.id ?? 0) + 1 })}>
          Save
        </Button>
        <Toast
          message={toast ? args.message : null}
          id={toast?.id ?? 0}
          onDone={() => setToast(null)}
        />
      </>
    );
  },
};
