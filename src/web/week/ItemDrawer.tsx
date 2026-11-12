import { useEffect, useRef, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { AnchorProblem } from "../../shared/anchors.ts";
import { MAX_NAME } from "../../shared/anchors.ts";
import {
  type AnchorDraft,
  draftFromAnchor,
  formProblem,
  newDraft,
} from "../anchors/model/form.ts";
import { failureMessage, problemMessage } from "../anchors/model/messages.ts";
import { Button } from "../ui/Button/Button.tsx";
import { Drawer } from "../ui/Drawer/Drawer.tsx";
import { MessageLine } from "../ui/MessageLine/MessageLine.tsx";
import { Stack } from "../ui/Stack/Stack.tsx";
import { TextField } from "../ui/TextField/TextField.tsx";
import { AnchorFields } from "./AnchorFields.tsx";
import { type DrawerState, drawerTitleKey } from "./model/drawer.ts";
import { useWeek } from "./WeekProvider.tsx";
import styles from "./ItemDrawer.module.css";

type Message =
  | { kind: "problem"; problem: AnchorProblem }
  | { kind: "failure"; action: "save" | "delete" };

function draftFor(drawer: DrawerState): AnchorDraft {
  return drawer.mode === "editAnchor"
    ? draftFromAnchor(drawer.anchor)
    : newDraft();
}

export interface ItemDrawerProps {
  /** Gets focus on close when the control that opened the drawer is gone. */
  returnFocusFallback?: RefObject<HTMLElement | null>;
}

/** The form that adds, edits and deletes an item of the week. */
export function ItemDrawer({ returnFocusFallback }: ItemDrawerProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { anchors, status, drawer, closeDrawer, saveAnchor, remove } =
    useWeek();
  const nameRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState(() => draftFor(drawer));
  const [message, setMessage] = useState<Message | null>(null);
  const [armed, setArmed] = useState(false);

  // Every opening starts from the item as stored (or the defaults), with
  // no message and Delete disarmed. Adjusted while rendering, as React
  // recommends for state that follows a prop.
  const [openedFor, setOpenedFor] = useState(drawer);
  if (drawer !== openedFor) {
    setOpenedFor(drawer);
    if (drawer.mode !== "closed") {
      setDraft(draftFor(drawer));
      setMessage(null);
      setArmed(false);
    }
  }

  const open = drawer.mode !== "closed";
  useEffect(() => {
    // Runs after the Drawer's own effect has shown the dialog.
    if (open) nameRef.current?.focus();
  }, [open, drawer]);

  // Keeps the title and Delete while the dialog closes.
  const shownState = open ? drawer : openedFor;
  const editing = shownState.mode === "editAnchor";
  const editingId = drawer.mode === "editAnchor" ? drawer.anchor.id : null;
  const saving = status === "saving";

  const update = (change: Partial<AnchorDraft>) =>
    setDraft((current) => ({ ...current, ...change }));

  async function onSave() {
    const problem = formProblem(draft, anchors, editingId);
    if (problem) {
      setMessage({ kind: "problem", problem });
      if (problem.code === "nameEmpty") nameRef.current?.focus();
      return;
    }
    setMessage(null);
    const outcome = await saveAnchor(draft);
    if (outcome.kind === "problem") {
      setMessage({ kind: "problem", problem: outcome.problem });
    } else if (outcome.kind === "failed") {
      setMessage({ kind: "failure", action: "save" });
    }
  }

  async function onDelete() {
    if (!armed) {
      setArmed(true);
      return;
    }
    setMessage(null);
    const outcome = await remove();
    if (outcome.kind === "failed") {
      setMessage({ kind: "failure", action: "delete" });
    }
  }

  const shown =
    message === null
      ? null
      : message.kind === "problem"
        ? problemMessage(message.problem, lang)
        : failureMessage(message.action);

  return (
    <Drawer
      open={open}
      title={t(drawerTitleKey(shownState))}
      onClose={closeDrawer}
      closeLabel={t("drawer.close")}
      returnFocusFallback={returnFocusFallback}
      footer={
        <>
          {editing && (
            <div className={styles.delete}>
              <Button
                variant={armed ? "danger" : "ghost"}
                disabled={saving}
                onClick={() => void onDelete()}
              >
                {t(armed ? "drawer.confirmDelete" : "drawer.delete")}
              </Button>
            </div>
          )}
          <Button variant="ghost" onClick={closeDrawer}>
            {t("drawer.cancel")}
          </Button>
          <Button
            variant="primary"
            disabled={saving}
            onClick={() => void onSave()}
          >
            {t("drawer.save")}
          </Button>
        </>
      }
    >
      <Stack gap={6}>
        <TextField
          ref={nameRef}
          label={t("drawer.name")}
          value={draft.name}
          maxLength={MAX_NAME}
          onChange={(name) => update({ name })}
        />
        <AnchorFields draft={draft} onChange={update} />
        <MessageLine
          message={shown ? t(shown.key, shown.values) : undefined}
          tone={message?.kind === "failure" ? "error" : "calm"}
        />
      </Stack>
    </Drawer>
  );
}
