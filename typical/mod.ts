import * as rds from "../rds/mod.ts";
import {
  govnImCore as gimc,
  govnImTypical as gimTyp,
} from "./deps.ts";

export abstract class TypicalTabularStatementEntity
  extends gimTyp.TypicalTransientEntity {
}

export abstract class TypicalTypeDefnEntity
  extends TypicalTabularStatementEntity {
}

export abstract class TypicalViewEntity extends gimTyp.TypicalTransientEntity {
}

export abstract class TypicalStoredRoutineEntity
  extends gimTyp.TypicalTransientEntity
  implements rds.StoredRoutineEntity {
  readonly isStoredRoutineEntity = true;
  readonly isTypicalStoredRoutineEntity = true;
  readonly argAttrs?: gimc.Attribute[];

  constructor(
    readonly name: gimc.EntityName,
    readonly params: gimTyp.TypicalTransientEntityParams,
  ) {
    super(name, params);
    if (this.buildArgs) this.argAttrs = this.buildArgs(this);
  }

  protected buildArgs(tte: gimTyp.TypicalTransientEntity): gimc.Attribute[] {
    return [];
  }
}

export function isTypicalStoredRoutineEntity(
  o: any,
): o is TypicalStoredRoutineEntity {
  return "isTypicalStoredRoutineEntity" in o;
}
