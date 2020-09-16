import type * as ctx from "./context.ts";
import type { govnImCore as gimc } from "./deps.ts";

export interface RdbmsRowValues<T extends gimc.Entity>
  extends gimc.EntityAttrValues<T> {
  isRowCompatibleWithEngine(ctx: ctx.RdbmsEngineContext): boolean;
}

export function isRdbmsRowValues<T extends gimc.Entity>(
  e: unknown,
): e is RdbmsRowValues<T> {
  return e && typeof e === "object" && "isRowCompatibleWithEngine" in e;
}
