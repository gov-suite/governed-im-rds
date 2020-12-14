import type * as col from "./column.ts";
import type * as rctx from "./context.ts";
import type { govnImCore as gimc, valueMgr as vm } from "./deps.ts";
import { safety } from "./deps.ts";
import type * as sqty from "./sql-type.ts";

export type StoredRoutineName = string;

export interface StoredRoutineBodyCode {
  readonly isStoredRoutineBodyCode: true;
  readonly bodyCode: string;
  readonly persistAsName: string;
}

export const isStoredRoutineBodyCode = safety.typeGuard<StoredRoutineBodyCode>(
  "isStoredRoutineBodyCode",
);

export interface StoredRoutineCode {
  readonly isStoredRoutineCode: true;
  readonly sourceCode: string;
  readonly persistAsName?: string;
}

export const isStoredRoutineCode = safety.typeGuard<StoredRoutineCode>(
  "isStoredRoutineCode",
);

export enum StoredRoutineArgMutability {
  InOnly,
  OutOnly,
  InOut,
}

export interface StoredRoutineArgMutabilitySupplier {
  storedRoutineArgMutability: StoredRoutineArgMutability;
}

export const isStoredRoutineArgMutabilitySupplier = safety.typeGuard<
  StoredRoutineArgMutabilitySupplier
>("storedRoutineArgMutability");

export interface StoredRoutineArg {
  readonly argName: vm.TextValue;
  readonly argType: sqty.SqlType;
  readonly argMutability: StoredRoutineArgMutability;
}

export type StoredRoutineResult = col.TransientColumn;

export interface StoredRoutine<T extends gimc.TransientEntity> {
  readonly entity: T;
  readonly args?: StoredRoutineArg[];
  readonly columns: col.TransientColumn[];
  name(ctx: rctx.RdbmsEngineContext): StoredRoutineName;
}

// deno-lint-ignore no-empty-interface
export interface StoredFunction<T extends gimc.TransientEntity>
  extends StoredRoutine<T> {
}

// deno-lint-ignore no-empty-interface
export interface StoredProcedure<T extends gimc.TransientEntity>
  extends StoredRoutine<T> {
}

export interface StoredFunctionCodeSupplier<T extends gimc.TransientEntity> {
  storedFunctionCode(
    ctx: rctx.RdbmsEngineContext,
    fn: StoredFunction<T>,
  ): StoredRoutineBodyCode | StoredRoutineCode;
}
export function isStoredFunctionCodeSupplier<T extends gimc.TransientEntity>(
  o: unknown,
): o is StoredFunctionCodeSupplier<T> {
  const safeStoredFunctionCodeSupplier = safety.typeGuard<
    StoredFunctionCodeSupplier<T>
  >("storedFunctionCode");
  return safeStoredFunctionCodeSupplier(o);
}

export interface StoredProcedureFunctionWrapper {
  readonly wrapperStoredFunctionName: StoredRoutineName;
  readonly wrapperRoutineCode?: string;
}

export interface StoredProcedureCodeSupplier<T extends gimc.TransientEntity> {
  storedProcedureCode(
    ctx: rctx.RdbmsEngineContext,
    proc: StoredProcedure<T>,
  ): StoredRoutineBodyCode | StoredRoutineCode;
  storedProcedureFunctionWrapper?(): StoredProcedureFunctionWrapper;
}

export function isStoredProcedureCodeSupplier<T extends gimc.TransientEntity>(
  o: unknown,
): o is StoredProcedureCodeSupplier<T> {
  const safeStoredProcedureCodeSupplier = safety.typeGuard<
    StoredProcedureCodeSupplier<T>
  >("storedProcedureCode");
  return safeStoredProcedureCodeSupplier(o);
}

export class DefaultStoredRoutine<T extends gimc.TransientEntity>
  implements StoredRoutine<T> {
  constructor(
    ctx: rctx.RdbmsEngineContext,
    readonly entity: T,
    readonly columns: col.TransientColumn[],
    readonly args?: StoredRoutineArg[],
  ) {
  }

  name(ctx: rctx.RdbmsEngineContext): StoredRoutineName {
    return ctx.dialect.namingStrategy.storedProcedureName(this.entity);
  }
}

export class DefaultStoredProcedure<T extends gimc.TransientEntity>
  extends DefaultStoredRoutine<T>
  implements StoredProcedure<T> {
  name(ctx: rctx.RdbmsEngineContext): StoredRoutineName {
    return ctx.dialect.namingStrategy.storedProcedureName(this.entity);
  }
}

export class DefaultStoredFunction<T extends gimc.TransientEntity>
  extends DefaultStoredRoutine<T>
  implements StoredFunction<T> {
  name(ctx: rctx.RdbmsEngineContext): StoredRoutineName {
    return ctx.dialect.namingStrategy.storedFunctionName(this.entity);
  }
}

export interface StoredRoutineEntity extends gimc.TransientEntity {
  readonly isStoredRoutineEntity: true;
  readonly argAttrs?: gimc.Attribute[];
}

export const isStoredRoutineEntity = safety.typeGuard<StoredRoutineEntity>(
  "isStoredRoutineEntity",
);
