import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { Category } from "../../../shared/planner.ts";
import { Button } from "../../ui/Button/Button.tsx";
import { CoverButton } from "../../ui/CoverButton/CoverButton.tsx";
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
  /** The stored anchor an anchor block draws. */
  anchorId?: string;
  /** Pixels from the top of the column. */
  top: number;
  height: number;
  /** Too short for the time line. */
  tiny: boolean;
}

export interface GridBlockProps {
  block: GridBlockModel;
  /** Opens an anchor block's anchor for editing. */
  onOpen?: (anchorId: string) => void;
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

export function GridBlock({ block, onOpen }: GridBlockProps) {
  const { t } = useTranslation();
  const isAnchor = block.kind === "anchor";
  const { anchorId } = block;
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
      className={[styles.slot, block.tiny && styles.tinySlot]
        .filter(Boolean)
        .join(" ")}
      style={{ top: block.top, height: block.height }}
    >
      {anchorId !== undefined && onOpen && (
        <div className={styles.cover}>
          <CoverButton
            label={t("grid.editAnchor", { name: block.name })}
            onClick={() => onOpen(anchorId)}
          />
        </div>
      )}
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
          <div className={styles.check}>
            <CheckToggle
              pressed={block.done}
              label={t("grid.markDone", { name: block.name })}
              inert
            />
          </div>
        </div>
        {!block.tiny && (
          <div className={styles.time}>
            <Text as="div" mono truncate>
              {block.timeLabel}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
