import type * as ctx from "./context.ts";
import type { govnImCore as gimc } from "./deps.ts";
import { safety } from "./deps.ts";

export interface RdbmsRowValues<T extends gimc.Entity>
  extends gimc.EntityAttrValues<T> {
  isRowCompatibleWithEngine(ctx: ctx.RdbmsEngineContext): boolean;
}

export function isRdbmsRowValues<T extends gimc.Entity>(
  e: unknown,
): e is RdbmsRowValues<T> {
  const safeRdbmsRowValues = safety.typeGuard<RdbmsRowValues<T>>(
    "isRowCompatibleWithEngine",
  );
  return safeRdbmsRowValues(e);
}
