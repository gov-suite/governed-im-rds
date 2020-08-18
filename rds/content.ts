import * as ctx from "./context.ts";
import { govnImCore as gimc } from "./deps.ts";

export interface RdbmsRowValues<T extends gimc.Entity>
  extends gimc.EntityAttrValues<T> {
  isRowCompatibleWithEngine(ctx: ctx.RdbmsEngineContext): boolean;
}

export function isRdbmsRowValues<T extends gimc.Entity>(
  e: object,
): e is RdbmsRowValues<T> {
  return "isRowCompatibleWithEngine" in e;
}
