import {
  contextMgr as cm,
  specModule as sm,
} from "./deps.ts";
import { Dialect, PostreSqlEngineName, SQLiteEngineName } from "./dialect.ts";
import { RdbmsModelStruct as RdbmsModelStruct } from "./model.ts";
import { Table } from "./table.ts";

export interface RdbmsEngineContext extends sm.SpecificationContext {
  isRdbmsEngineContext: true;
  dialect: Dialect;
  isPostgreSQL: boolean;
  isSQLite: boolean;
}

export function isRdbmsEngineContext(
  ctx: cm.Context,
): ctx is RdbmsEngineContext {
  return "isRdbmsEngineContext" in ctx;
}

export interface RdbmsModelContext extends RdbmsEngineContext {
  isRdbmsModelContext: true;
  rdbmsModel: RdbmsModelStruct;
}

export function isRdbmsModelContext(
  ctx: cm.Context,
): ctx is RdbmsModelContext {
  return "isRdbmsModelContext" in ctx;
}

export interface RdbmsSqlValueContext extends RdbmsModelContext {
  isRdbmsSqlValueContext: true;
}

export function isRdbmsSqlValueContext(
  ctx: cm.Context,
): ctx is RdbmsSqlValueContext {
  return "isRdbmsSqlValueContext" in ctx;
}

export interface RdbmsSqlDdlContext extends RdbmsModelContext {
  isRdbmsSqlDdlContext: true;
}

export function isRdbmsSqlDdlContext(
  ctx: cm.Context,
): ctx is RdbmsSqlDdlContext {
  return "isRdbmsSqlDdlContext" in ctx;
}

export interface RdbmsTableSqlDdlContext extends RdbmsModelContext {
  isRdbmsTableSqlDdlContext: true;
  table: Table;
  tableName: string;
}

export function isRdbmsTableSqlDdlContext(
  ctx: cm.Context,
): ctx is RdbmsTableSqlDdlContext {
  return "isRdbmsTableSqlDdlContext" in ctx;
}

export interface RdbmsContentTableSqlDmlContext extends RdbmsModelContext {
  isRdbmsContentTableSqlDmlContext: true;
  table: Table;
}

export interface RdbmsContentInsertContext
  extends RdbmsContentTableSqlDmlContext {
  isRdbmsContentInsertContext: true;
}

export interface RdbmsContentUpdateContext
  extends RdbmsContentTableSqlDmlContext {
  isRdbmsContentUpdateContext: true;
}

export interface RdbmsContentDeleteContext
  extends RdbmsContentTableSqlDmlContext {
  isRdbmsContentDeleteContext: true;
}

export function isRdbmsContentTableSqlDmlContext(
  ctx: cm.Context,
): ctx is RdbmsContentTableSqlDmlContext {
  return "isRdbmsContentTableSqlDmlContext" in ctx;
}

export function isRdbmsContentInsertContext(
  ctx: cm.Context,
): ctx is RdbmsContentInsertContext {
  return "isRdbmsContentInsertContext" in ctx;
}

export function isRdbmsContentUpdateContext(
  ctx: cm.Context,
): ctx is RdbmsContentUpdateContext {
  return "isRdbmsContentUpdateContext" in ctx;
}

export function isRdbmsContentDeleteContext(
  ctx: cm.Context,
): ctx is RdbmsContentDeleteContext {
  return "isRdbmsContentDeleteContext" in ctx;
}

export interface RdbmsSqlQueryContext extends RdbmsModelContext {
  isRdbmsSqlQueryContext: true;
}

export function isRdbmsSqlQueryContext(
  ctx: cm.Context,
): ctx is RdbmsSqlQueryContext {
  return "isRdbmsSqlQueryContext" in ctx;
}

export const rdbmsCtxFactory = new (class {
  public isPostgreSqlEngine(dialect: Dialect): boolean {
    return dialect.name.inflect().startsWith(PostreSqlEngineName.inflect());
  }

  public isSQLiteEngine(dialect: Dialect): boolean {
    return dialect.name.inflect() == SQLiteEngineName.inflect();
  }

  public TODO(spec: sm.Specification<any>): sm.SpecificationContext {
    return {
      isContext: true,
      isSpecificationContext: true,
      spec: spec,
      execEnvs: cm.ctxFactory.envTODO,
    };
  }

  public rdbmsEngineContext(
    spec: sm.Specification<any>,
    dialect: Dialect,
  ): RdbmsEngineContext {
    return {
      isContext: true,
      isSpecificationContext: true,
      isRdbmsEngineContext: true,
      dialect: dialect,
      execEnvs: cm.ctxFactory.envTODO,
      spec: spec,
      isPostgreSQL: this.isPostgreSqlEngine(dialect),
      isSQLite: this.isSQLiteEngine(dialect),
    };
  }

  public rdbmsSqlValueContext(rsCtx: RdbmsModelContext): RdbmsSqlValueContext {
    return {
      ...rsCtx,
      isRdbmsSqlValueContext: true,
    };
  }
})();
