import type * as col from "./column.ts";
import type * as rdbmsCtx from "./context.ts";
import type {
  govnImCore as gimc,
  valueMgr as vm,
} from "./deps.ts";
import type * as tbl from "./table.ts";

export type SqlType = vm.TextValue;

export type AttrMapperSource =
  | gimc.Attribute
  | gimc.Reference<gimc.Entity>;

export interface ContextualSqlTypes {
  nonRefDDL: SqlType;
  fKRefDDL: SqlType;
  storedProcIn: SqlType;
  storedProcOut: SqlType;
  storedFuncIn: SqlType;
  storedFuncOut: SqlType;
  typeDefn: SqlType;
}

export interface AttrSqlType {
  readonly forSrc: AttrMapperSource;
  readonly forAttr: gimc.Attribute;
  sqlTypes(ctx: rdbmsCtx.RdbmsEngineContext): ContextualSqlTypes;
  transientColumn?(
    ctx: rdbmsCtx.RdbmsEngineContext,
    te: gimc.TransientEntity,
  ): col.TransientColumn;
  persistentColumn?(
    ctx: rdbmsCtx.RdbmsEngineContext,
    table: tbl.Table,
  ): col.PersistentColumn;
}

export interface AttrSqlTypesRegistration {
  readonly registryKeys: gimc.AttributeRegistryKeys;
  readonly constructor: AttrSqlTypesConstructor;
}

export interface AttrSqlTypesConstructor {
  new (
    ctx: rdbmsCtx.RdbmsEngineContext,
    attr: gimc.Attribute,
  ): AttrSqlType;
}

export interface AttrSqlTypesErrorHandler {
  // deno-lint-ignore no-explicit-any
  (forSrc: AttrMapperSource, msg: string, ...args: any[]): void;
}

export interface AttrSqlTypesMapper {
  map(
    ctx: rdbmsCtx.RdbmsEngineContext,
    forSrc: AttrMapperSource,
    ifNotFound?: AttrSqlTypesConstructor,
  ): AttrSqlType | undefined;
}

export interface AttrSqlTypesMapperConstructor {
  new (): AttrSqlTypesMapper;
}
