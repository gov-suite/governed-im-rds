import * as col from "./column.ts";
import * as rdbmsCtx from "./context.ts";
import { govnImCore as gimc, valueMgr as vm } from "./deps.ts";

export type SqlStatementName = string;

export interface SqlStatement {
  readonly isSqlStatement: true;
  readonly sql: vm.TextValue;
  readonly persistAsName?: string;
}

export function isSqlStatement(o: any): o is SqlStatement {
  return "isSqlStatement" in o;
}

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
  o: any,
): o is TabularStatementSqlSupplier<T> {
  return "tabularSqlStatement" in o;
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
