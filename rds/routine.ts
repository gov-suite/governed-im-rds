import * as col from "./column.ts";
import * as rctx from "./context.ts";
import { govnImCore as gimc, valueMgr as vm } from "./deps.ts";
import * as sqty from "./sql-type.ts";

export type StoredRoutineName = string;

export interface StoredRoutineBodyCode {
  readonly isStoredRoutineBodyCode: true;
  readonly bodyCode: string;
  readonly persistAsName: string;
}

export function isStoredRoutineBodyCode(o: any): o is StoredRoutineBodyCode {
  return "isStoredRoutineBodyCode" in o;
}

export interface StoredRoutineCode {
  readonly isStoredRoutineCode: true;
  readonly sourceCode: string;
  readonly persistAsName?: string;
}

export function isStoredRoutineCode(o: any): o is StoredRoutineCode {
  return "isStoredRoutineCode" in o;
}

export enum StoredRoutineArgMutability {
  InOnly,
  OutOnly,
  InOut,
}

export interface StoredRoutineArgMutabilitySupplier {
  storedRoutineArgMutability: StoredRoutineArgMutability;
}

export function isStoredRoutineArgMutabilitySupplier(
  o: object,
): o is StoredRoutineArgMutabilitySupplier {
  return "storedRoutineArgMutability" in o;
}

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

export interface StoredFunction<T extends gimc.TransientEntity>
  extends StoredRoutine<T> {
}

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
  o: any,
): o is StoredFunctionCodeSupplier<T> {
  return "storedFunctionCode" in o;
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
  o: any,
): o is StoredProcedureCodeSupplier<T> {
  return "storedProcedureCode" in o;
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

export function isStoredRoutineEntity(o: any): o is StoredRoutineEntity {
  return "isStoredRoutineEntity" in o;
}
