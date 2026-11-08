import styles from "./BrandMark.module.css";

/** The Routinely mark: three bars on a slate square. Decorative; the brand name sits next to it as text. */
export function BrandMark() {
  return (
    <span aria-hidden="true" className={styles.mark}>
      <span className={`${styles.bar} ${styles.top}`} />
      <span className={`${styles.bar} ${styles.middle}`} />
      <span className={`${styles.bar} ${styles.bottom}`} />
    </span>
  );
}
