import * as rdbmsCtx from "./context.ts";
import {
  artfPersist as ap,
  govnImCore as gimc,
  textInflect as infl,
} from "./deps.ts";
import * as ns from "./naming.ts";
import * as ty from "./sql-type.ts";
import * as tbl from "./table.ts";

export type DialectName = infl.InflectableValue;

export const SQLiteEngineName = infl.snakeCaseValue("SQLite");
export const PostreSqlEngineName = infl.snakeCaseValue("PostgreSQL");

export interface DialectConstructor {
  new (ns?: ns.NamingStrategy | ns.NamingStrategyConstructor): Dialect;
}

export interface Dialect {
  readonly isDialect: true;
  readonly name: DialectName;
  readonly namingStrategy: ns.NamingStrategy;
  sqlType(
    ctx: rdbmsCtx.RdbmsEngineContext,
    forSrc: ty.AttrMapperSource,
    ifNotFound?: ty.AttrSqlTypesConstructor,
  ): ty.AttrSqlType | undefined;
  persistModel(
    ctx: rdbmsCtx.RdbmsModelContext,
  ): ap.TextArtifact;
}

export function isDialect(o: any): o is Dialect {
  return "isDialect" in o;
}

// Method signature for transform/rds/dialect.ts.storeValueSQL
export interface PrepareValueSQL {
  (
    rsCtx: rdbmsCtx.RdbmsSqlValueContext,
    tc: tbl.TableColumn,
    av: gimc.AttributeValue,
  ): string;
}
