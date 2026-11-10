import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type { Category, FlexibleActivity } from "../../shared/planner.ts";

export type NewActivity = Omit<FlexibleActivity, "id">;

export interface ActivityRepository {
  /** Every activity, by name ignoring case, then by id. */
  list(): FlexibleActivity[];
  get(id: string): FlexibleActivity | undefined;
  create(activity: NewActivity): FlexibleActivity;
  /** `undefined` when no activity has that id. */
  replace(id: string, activity: NewActivity): FlexibleActivity | undefined;
  /** `false` when no activity has that id. */
  remove(id: string): boolean;
}

type Row = {
  id: string;
  name: string;
  category: Category;
  times_per_week: number;
  duration: number;
};

function fromRow(row: Row): FlexibleActivity {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    timesPerWeek: row.times_per_week,
    duration: row.duration,
  };
}

export function createActivityRepository(
  sqlite: DatabaseSync,
): ActivityRepository {
  const columns = "id, name, category, times_per_week, duration";
  const listAll = sqlite.prepare(
    `SELECT ${columns} FROM activities ORDER BY name COLLATE NOCASE, id`,
  );
  const getOne = sqlite.prepare(
    `SELECT ${columns} FROM activities WHERE id = ?`,
  );
  const insert = sqlite.prepare(
    `INSERT INTO activities (${columns}) VALUES (?, ?, ?, ?, ?)`,
  );
  const update = sqlite.prepare(
    `UPDATE activities SET name = ?, category = ?, times_per_week = ?, duration = ?
     WHERE id = ?`,
  );
  const deleteOne = sqlite.prepare(`DELETE FROM activities WHERE id = ?`);

  return {
    list() {
      return (listAll.all() as Row[]).map(fromRow);
    },
    get(id) {
      const row = getOne.get(id) as Row | undefined;
      return row && fromRow(row);
    },
    create(activity) {
      const id = randomUUID();
      const { name, category, timesPerWeek, duration } = activity;
      insert.run(id, name, category, timesPerWeek, duration);
      return { id, ...activity };
    },
    replace(id, activity) {
      const { name, category, timesPerWeek, duration } = activity;
      const { changes } = update.run(
        name,
        category,
        timesPerWeek,
        duration,
        id,
      );
      return changes === 0 ? undefined : { id, ...activity };
    },
    remove(id) {
      return deleteOne.run(id).changes > 0;
    },
  };
}
