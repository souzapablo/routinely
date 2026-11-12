import { useTranslation } from "react-i18next";
import type { DayIndex } from "../../shared/planner.ts";
import type { AnchorDraft } from "../anchors/model/form.ts";
import { previewParts } from "../anchors/model/preview.ts";
import { formatWeekdayIndex } from "../planner/model/format.ts";
import { Button } from "../ui/Button/Button.tsx";
import { FieldGroup } from "../ui/FieldGroup/FieldGroup.tsx";
import { Text } from "../ui/Text/Text.tsx";
import { TimeField } from "../ui/TimeField/TimeField.tsx";
import styles from "./AnchorFields.module.css";

/** Sunday first, as the grid draws the week. */
const WEEK: DayIndex[] = [0, 1, 2, 3, 4, 5, 6];

export interface AnchorFieldsProps {
  draft: AnchorDraft;
  onChange: (change: Partial<AnchorDraft>) => void;
}

/** Repeats on, Start, End and the preview line of an anchor. */
export function AnchorFields({ draft, onChange }: AnchorFieldsProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const toggleDay = (day: DayIndex) =>
    onChange({
      days: draft.days.includes(day)
        ? draft.days.filter((d) => d !== day)
        : [...draft.days, day],
    });

  const preview = previewParts(draft, lang)
    .map((part) => t(part.key, part.values))
    .join(" · ");

  return (
    <>
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
          onChange={(start) => onChange({ start })}
        />
        <TimeField
          label={t("anchors.drawer.end")}
          value={draft.end}
          onChange={(end) => onChange({ end })}
        />
      </div>
      <Text tone="muted" size="sm">
        {preview}
      </Text>
    </>
  );
}
