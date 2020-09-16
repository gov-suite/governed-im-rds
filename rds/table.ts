import type * as col from "./column.ts";
import type { RdbmsEngineContext } from "./context.ts";
import type { govnImCore as gimc } from "./deps.ts";

export type TableName = string;

export interface TableColumn {
  readonly table: Table;
  readonly column: col.PersistentColumn;
}

export interface TableColumnRelationship {
  readonly source: TableColumn;
  readonly references: TableColumn;
}

export interface Table {
  readonly entity: gimc.PersistentEntity;
  readonly primaryKey?: col.PersistentColumn;
  readonly columns: col.PersistentColumn[];
  readonly columnsByName: Map<col.ColumnName, col.PersistentColumn>;
  readonly structErrors: string[];
  name(ctx: RdbmsEngineContext): TableName;
}

export class DefaultTable implements Table {
  readonly primaryKey?: col.PersistentColumn;
  readonly columns: col.PersistentColumn[];
  readonly columnsByName: Map<col.ColumnName, col.PersistentColumn> = new Map();
  readonly structErrors: string[] = [];

  constructor(
    ctx: RdbmsEngineContext,
    readonly entity: gimc.PersistentEntity,
    columns: (table: Table) => col.PersistentColumn[],
  ) {
    this.columns = columns(this);

    let primaryKey: col.PersistentColumn | undefined;
    for (const column of this.columns) {
      const columnName = column.name(ctx);
      this.columnsByName.set(columnName, column);

      if (entity.identity == column.forAttr) {
        if (primaryKey) {
          this.structErrors.push(
            `[RDBMSTBL_0001] primaryKey being redefined in Table ${this.name} by column ${columnName}`,
          );
        }
        primaryKey = column;
      }
    }
    this.primaryKey = primaryKey;
  }

  name(ctx: RdbmsEngineContext): TableName {
    return ctx.dialect.namingStrategy.tableName(this.entity);
  }
}
