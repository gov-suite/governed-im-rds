import type * as rdbmsCtx from "./context.ts";
import {
  artfPersist as ap,
  govnImCore as gimc,
  safety,
  textInflect as infl,
} from "./deps.ts";
import type * as ns from "./naming.ts";
import type * as ty from "./sql-type.ts";
import type * as tbl from "./table.ts";

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

export const isDialect = safety.typeGuard<Dialect>("isDialect");

// Method signature for transform/rds/dialect.ts.storeValueSQL
export interface PrepareValueSQL {
  (
    rsCtx: rdbmsCtx.RdbmsSqlValueContext,
    tc: tbl.TableColumn,
    av: gimc.AttributeValue,
  ): string;
}
