import type * as col from "./column.ts";
import type * as rdbmsCtx from "./context.ts";
import type { govnImCore as gimc, valueMgr as vm } from "./deps.ts";
import { safety } from "./deps.ts";

export type SqlStatementName = string;

export interface SqlStatement {
  readonly isSqlStatement: true;
  readonly sql: vm.TextValue;
  readonly persistAsName?: string;
}

export const isSqlStatement = safety.typeGuard<SqlStatement>("isSqlStatement");

export interface TabularStatement<T extends gimc.TransientEntity> {
  readonly entity: T;
  readonly columns: col.TransientColumn[];
}

export interface TabularStatementSqlSupplier<T extends gimc.TransientEntity> {
  tabularSqlStatement(
    ctx: rdbmsCtx.RdbmsEngineContext,
    stmt: TabularStatement<T>,
  ): SqlStatement;
}

export function isTabularStatementSqlSupplier<T extends gimc.TransientEntity>(
  o: unknown,
): o is TabularStatementSqlSupplier<T> {
  const safeTabularStatementSqlSupplier = safety.typeGuard<
    TabularStatementSqlSupplier<T>
  >("tabularSqlStatement");
  return safeTabularStatementSqlSupplier(o);
}

export class DefaultTabularStatement<T extends gimc.TransientEntity>
  implements TabularStatement<T> {
  constructor(
    ctx: rdbmsCtx.RdbmsEngineContext,
    readonly entity: T,
    readonly columns: col.TransientColumn[],
  ) {
  }
}
