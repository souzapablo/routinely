import { useEffect, useRef, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { AnchorProblem } from "../../shared/anchors.ts";
import { MAX_NAME } from "../../shared/anchors.ts";
import type { DayIndex } from "../../shared/planner.ts";
import { formatWeekdayIndex } from "../planner/model/format.ts";
import { Button } from "../ui/Button/Button.tsx";
import { Drawer } from "../ui/Drawer/Drawer.tsx";
import { FieldGroup } from "../ui/FieldGroup/FieldGroup.tsx";
import { MessageLine } from "../ui/MessageLine/MessageLine.tsx";
import { Stack } from "../ui/Stack/Stack.tsx";
import { Text } from "../ui/Text/Text.tsx";
import { TextField } from "../ui/TextField/TextField.tsx";
import { TimeField } from "../ui/TimeField/TimeField.tsx";
import type { DrawerState } from "../week/model/drawer.ts";
import { useWeek } from "../week/WeekProvider.tsx";
import {
  type AnchorDraft,
  draftFromAnchor,
  formProblem,
  newDraft,
} from "./model/form.ts";
import { failureMessage, problemMessage } from "./model/messages.ts";
import { previewParts } from "./model/preview.ts";
import styles from "./AnchorDrawer.module.css";

/** Sunday first, as the grid draws the week. */
const WEEK: DayIndex[] = [0, 1, 2, 3, 4, 5, 6];

type Message =
  | { kind: "problem"; problem: AnchorProblem }
  | { kind: "failure"; action: "save" | "delete" };

function draftFor(drawer: DrawerState): AnchorDraft {
  return drawer.mode === "editAnchor"
    ? draftFromAnchor(drawer.anchor)
    : newDraft();
}

export interface AnchorDrawerProps {
  /** Gets focus on close when the control that opened the drawer is gone. */
  returnFocusFallback?: RefObject<HTMLElement | null>;
}

/** The form that adds, edits and deletes an anchor. */
export function AnchorDrawer({ returnFocusFallback }: AnchorDrawerProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { anchors, status, drawer, closeDrawer, saveAnchor, remove } =
    useWeek();
  const nameRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState(() => draftFor(drawer));
  const [message, setMessage] = useState<Message | null>(null);
  const [armed, setArmed] = useState(false);

  // Every opening starts from the anchor as stored (or the defaults), with
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
  const editing =
    drawer.mode === "editAnchor" ||
    (drawer.mode === "closed" && openedFor.mode === "editAnchor");
  const editingId = drawer.mode === "editAnchor" ? drawer.anchor.id : null;
  const saving = status === "saving";

  const update = (change: Partial<AnchorDraft>) =>
    setDraft((current) => ({ ...current, ...change }));

  const toggleDay = (day: DayIndex) =>
    update({
      days: draft.days.includes(day)
        ? draft.days.filter((d) => d !== day)
        : [...draft.days, day],
    });

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

  const preview = previewParts(draft, lang)
    .map((part) => t(part.key, part.values))
    .join(" · ");

  return (
    <Drawer
      open={open}
      title={t(
        editing ? "anchors.drawer.editTitle" : "anchors.drawer.addTitle",
      )}
      onClose={closeDrawer}
      closeLabel={t("anchors.drawer.close")}
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
                {t(
                  armed
                    ? "anchors.drawer.confirmDelete"
                    : "anchors.drawer.delete",
                )}
              </Button>
            </div>
          )}
          <Button variant="ghost" onClick={closeDrawer}>
            {t("anchors.drawer.cancel")}
          </Button>
          <Button
            variant="primary"
            disabled={saving}
            onClick={() => void onSave()}
          >
            {t("anchors.drawer.save")}
          </Button>
        </>
      }
    >
      <Stack gap={6}>
        <TextField
          ref={nameRef}
          label={t("anchors.drawer.name")}
          value={draft.name}
          maxLength={MAX_NAME}
          onChange={(name) => update({ name })}
        />
        <FieldGroup legend={t("anchors.drawer.repeatsOn")}>
          {WEEK.map((day) => (
            <Button
              key={day}
              size="sm"
              pressed={draft.days.includes(day)}
              onClick={() => toggleDay(day)}
            >
              {formatWeekdayIndex(day, lang, "short")}
            </Button>
          ))}
        </FieldGroup>
        <div className={styles.times}>
          <TimeField
            label={t("anchors.drawer.start")}
            value={draft.start}
            onChange={(start) => update({ start })}
          />
          <TimeField
            label={t("anchors.drawer.end")}
            value={draft.end}
            onChange={(end) => update({ end })}
          />
        </div>
        <Text tone="muted" size="sm">
          {preview}
        </Text>
        <MessageLine
          message={shown ? t(shown.key, shown.values) : undefined}
          tone={message?.kind === "failure" ? "error" : "calm"}
        />
      </Stack>
    </Drawer>
  );
}
