import { govnImCore as gimc, govnImTypical as gimTyp } from "./deps.ts";

export interface AssocRelationshipSupplier<
  L extends gimc.Entity,
  R extends gimc.Entity,
> {
  left: (entity: gimc.Entity) => gimc.Relationship<L>;
  right: (entity: gimc.Entity) => gimc.Relationship<R>;
}

export class Association<L extends gimc.Entity, R extends gimc.Entity>
  extends gimTyp.TypicalPersistentEntity {
  readonly left?: gimc.Relationship<L>;
  readonly right?: gimc.Relationship<R>;

  constructor(
    name: gimc.EntityName,
    params: gimTyp.TypicalPersistentEntityParams,
    ars?: AssocRelationshipSupplier<L, R>,
    attributes?: gimTyp.TypicalAttributes,
  ) {
    super(name, params);
    if (ars) {
      this.left = ars.left(this);
      this.right = ars.right(this);
      this.insertAttrs(this.left, this.right);
    }
    if (attributes) {
      const attrs = typeof attributes === "function"
        ? attributes(this)
        : attributes;
      this.insertAttrs(...attrs);
    }
  }
}
