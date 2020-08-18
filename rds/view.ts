import * as col from "./column.ts";
import * as rdbmsCtx from "./context.ts";
import { govnImCore as gimc } from "./deps.ts";

export type ViewName = string;

export interface ViewBodySqlQuery {
  readonly isViewBodySqlQuery: true;
  readonly sql: string;
  readonly persistAsName?: string;
}

export function isViewBodySqlQuery(o: any): o is ViewBodySqlQuery {
  return "isViewBodySqlQuery" in o;
}

export interface CreateViewStatement {
  readonly isCreateViewStatement: true;
  readonly sql: string;
  readonly persistAsName?: string;
}

export function isCreateViewStatement(o: any): o is CreateViewStatement {
  return "isCreateViewStatement" in o;
}

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
  o: any,
): o is SqlViewQuerySupplier<T> {
  return "sqlViewQuery" in o;
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
