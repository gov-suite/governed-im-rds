import type * as col from "./column.ts";
import type * as rdbmsCtx from "./context.ts";
import type { govnImCore as gimc } from "./deps.ts";
import { safety } from "./deps.ts";

export type ViewName = string;

export interface ViewBodySqlQuery {
  readonly isViewBodySqlQuery: true;
  readonly sql: string;
  readonly persistAsName?: string;
}

export const isViewBodySqlQuery = safety.typeGuard<ViewBodySqlQuery>(
  "isViewBodySqlQuery",
);

export interface CreateViewStatement {
  readonly isCreateViewStatement: true;
  readonly sql: string;
  readonly persistAsName?: string;
}

export const isCreateViewStatement = safety.typeGuard<CreateViewStatement>(
  "isCreateViewStatement",
);

export interface View<T extends gimc.TransientEntity> {
  readonly entity: T;
  readonly columns: col.TransientColumn[];
  name(ctx: rdbmsCtx.RdbmsEngineContext): ViewName;
}

export interface SqlViewQuerySupplier<T extends gimc.TransientEntity> {
  sqlViewQuery(
    ctx: rdbmsCtx.RdbmsEngineContext,
    view: View<T>,
  ): ViewBodySqlQuery | CreateViewStatement;
}

export function isSqlViewQuerySupplier<T extends gimc.TransientEntity>(
  o: unknown,
): o is SqlViewQuerySupplier<T> {
  const safeSqlViewQuerySupplier = safety.typeGuard<SqlViewQuerySupplier<T>>(
    "sqlViewQuery",
  );
  return safeSqlViewQuerySupplier(o);
}

export class DefaultView<T extends gimc.TransientEntity> implements View<T> {
  constructor(
    ctx: rdbmsCtx.RdbmsEngineContext,
    readonly entity: T,
    readonly columns: col.TransientColumn[],
  ) {
  }

  name(ctx: rdbmsCtx.RdbmsEngineContext): ViewName {
    return ctx.dialect.namingStrategy.viewName(this.entity);
  }
}

// TODO IGS_migration - see if this is required
// export abstract class TypicalViewEntity extends te.TypicalTransientEntity {
// }
