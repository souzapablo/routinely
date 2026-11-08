import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { Category } from "../../../shared/planner.ts";
import { Button } from "../../ui/Button/Button.tsx";
import { CheckToggle } from "../../ui/CheckToggle/CheckToggle.tsx";
import { Icon } from "../../ui/Icon/Icon.tsx";
import { categoryTones } from "../../ui/Swatch/Swatch.tsx";
import { Text } from "../../ui/Text/Text.tsx";
import styles from "./GridBlock.module.css";

export interface GridBlockModel {
  key: string;
  kind: "anchor" | "placement";
  name: string;
  timeLabel: string;
  category: Category | "anchor";
  done: boolean;
  /** Pixels from the top of the column. */
  top: number;
  height: number;
  /** Too short for the time line. */
  tiny: boolean;
}

export interface GridBlockProps {
  block: GridBlockModel;
}

function toneStyle(category: Category | "anchor"): CSSProperties {
  if (category === "anchor") return {};
  const tone = categoryTones[category];
  return {
    "--tone-bg": `var(${tone.bg})`,
    "--tone-ink": `var(${tone.ink})`,
    "--tone-line": `var(${tone.line})`,
  } as CSSProperties;
}

export function GridBlock({ block }: GridBlockProps) {
  const { t } = useTranslation();
  const isAnchor = block.kind === "anchor";
  const className = [
    styles.block,
    isAnchor ? styles.anchor : styles.placement,
    block.done && styles.done,
    block.tiny && styles.tiny,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={styles.slot}
      style={{ top: block.top, height: block.height }}
    >
      <div className={className} style={toneStyle(block.category)}>
        <div className={styles.row}>
          {isAnchor && (
            <div className={styles.lock}>
              <Icon name="lock" size={12} />
            </div>
          )}
          <div className={styles.name}>
            <Text
              as="div"
              weight="semibold"
              truncate
              strike={!isAnchor && block.done}
            >
              {block.name}
            </Text>
          </div>
          {!isAnchor && (
            <div className={styles.unplace}>
              <Button icon="x" iconOnly inert>
                {t("grid.unplace", { name: block.name })}
              </Button>
            </div>
          )}
          <CheckToggle
            pressed={block.done}
            label={t("grid.markDone", { name: block.name })}
            inert
          />
        </div>
        {!block.tiny && (
          <div className={styles.time}>
            <Text as="div" mono>
              {block.timeLabel}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
