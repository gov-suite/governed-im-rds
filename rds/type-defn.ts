import * as rdbmsCtx from "./context.ts";
import { govnImCore as gimc } from "./deps.ts";
import * as stmt from "./statement.ts";

export type TypeDefnName = string;

export interface TypeDefn<T extends gimc.TransientEntity>
  extends stmt.TabularStatement<T> {
  name(ctx: rdbmsCtx.RdbmsEngineContext): TypeDefnName;
}

export interface TypeDefnSqlSupplier<T extends gimc.TransientEntity> {
  // implement either isRecordSupplier to generate default CREATE TYPE or
  // provide a custom SQL statement using recordSqlStatement()
  readonly isTypeDefn?: true;
  typeDefnSqlStatement?(
    ctx: rdbmsCtx.RdbmsEngineContext,
    stmt: TypeDefn<T>,
  ): stmt.SqlStatement;
}

export function isTypeDefnSqlSupplier<T extends gimc.TransientEntity>(
  o: any,
): o is TypeDefnSqlSupplier<T> {
  return "isTypeDefn" in o || "typeDefnSqlStatement" in o;
}

export class DefaultTypeDefn<T extends gimc.TransientEntity>
  extends stmt.DefaultTabularStatement<T>
  implements TypeDefn<T> {
  name(ctx: rdbmsCtx.RdbmsEngineContext): TypeDefnName {
    return ctx.dialect.namingStrategy.typeDefnName(this.entity);
  }
}
