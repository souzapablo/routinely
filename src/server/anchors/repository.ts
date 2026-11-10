import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type { Anchor, DayIndex } from "../../shared/planner.ts";

export type NewAnchor = Omit<Anchor, "id">;

export interface AnchorRepository {
  /** Every anchor, by start time, then by name ignoring case, then by id. */
  list(): Anchor[];
  get(id: string): Anchor | undefined;
  create(anchor: NewAnchor): Anchor;
  /** `undefined` when no anchor has that id. */
  replace(id: string, anchor: NewAnchor): Anchor | undefined;
  /** `false` when no anchor has that id. */
  remove(id: string): boolean;
}

type Row = {
  id: string;
  name: string;
  days: string;
  start: number;
  end: number;
};

function fromRow(row: Row): Anchor {
  return {
    id: row.id,
    name: row.name,
    days: JSON.parse(row.days) as DayIndex[],
    start: row.start,
    end: row.end,
  };
}

export function createAnchorRepository(sqlite: DatabaseSync): AnchorRepository {
  const columns = `id, name, days, start, "end"`;
  const listAll = sqlite.prepare(
    `SELECT ${columns} FROM anchors ORDER BY start, name COLLATE NOCASE, id`,
  );
  const getOne = sqlite.prepare(`SELECT ${columns} FROM anchors WHERE id = ?`);
  const insert = sqlite.prepare(
    `INSERT INTO anchors (${columns}) VALUES (?, ?, ?, ?, ?)`,
  );
  const update = sqlite.prepare(
    `UPDATE anchors SET name = ?, days = ?, start = ?, "end" = ? WHERE id = ?`,
  );
  const deleteOne = sqlite.prepare(`DELETE FROM anchors WHERE id = ?`);

  return {
    list() {
      return (listAll.all() as Row[]).map(fromRow);
    },
    get(id) {
      const row = getOne.get(id) as Row | undefined;
      return row && fromRow(row);
    },
    create(anchor) {
      const id = randomUUID();
      const days = JSON.stringify(anchor.days);
      insert.run(id, anchor.name, days, anchor.start, anchor.end);
      return { id, ...anchor };
    },
    replace(id, anchor) {
      const days = JSON.stringify(anchor.days);
      const { changes } = update.run(
        anchor.name,
        days,
        anchor.start,
        anchor.end,
        id,
      );
      return changes === 0 ? undefined : { id, ...anchor };
    },
    remove(id) {
      return deleteOne.run(id).changes > 0;
    },
  };
}
