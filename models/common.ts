import {
  govnImCore as gimc,
  govnImTypical as gimTyp,
  namespaceMgr as ns,
} from "./deps.ts";

export class RecordStatus extends gimc.DefaultEnumeration<RecordStatus> {
  static readonly values = new class
    implements gimc.EnumerationValues<RecordStatus> {
    readonly isEnumerationValues?: RecordStatus;
    readonly ACTIVE: gimc.EnumerationValue = { id: 1, value: "Active" };
    readonly IMMUTABLE: gimc.EnumerationValue = { id: 2, value: "Immutable" };
    readonly INACTIVE: gimc.EnumerationValue = { id: 3, value: "Inactive" };
  }();
  readonly defaultValue: gimc.EnumerationValue;

  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName(
        "Record_Status",
        "Record_Statuses",
      ),
      RecordStatus.values,
      params,
    );
    this.defaultValue = RecordStatus.values.ACTIVE;
  }
}

export class DefaultEnumParams implements gimc.EnumerationParams {
  readonly namespaceGen: gimc.EnumerationNamespaceGenerator;
  readonly adviceGen: gimc.EnumerationAdviceGenerator;
  readonly mutable: boolean = false;

  constructor(
    readonly attrFactory: gimc.EagsAttrFactory,
    namespace: ns.Namespace,
  ) {
    this.namespaceGen = (entity: gimc.Entity): gimc.EnumerationNamespace => {
      return {
        ...namespace,
        isEnumerationNamespace: true,
        isNamespace: true,
        scopeAttrs: [],
      };
    };
    this.adviceGen = (entity: gimc.Entity): gimc.EnumerationAdvice => {
      return {
        injectAttrsAfterIdentity: [],
        appendAttrs: [],
      };
    };
  }
}

export interface CommonTypicalEntityAttributes {
  readonly createdAt: gimc.DateTime;
  readonly updatedOn: gimc.DateTime;
  readonly recordStatus: gimc.EnumAttribute<RecordStatus>;
}

export class DefaultInfoModelStructParams
  implements gimTyp.TypicalInfoModelStructParams {
  readonly entityParams: gimTyp.TypicalPersistentEntityParams;
  readonly viewParams: gimTyp.TypicalTransientEntityParams;
  readonly storedProcParams: gimTyp.TypicalTransientEntityParams;
  readonly storedFuncParams: gimTyp.TypicalTransientEntityParams;
  readonly typeDefnParams: gimTyp.TypicalTransientEntityParams;
  readonly enumParams: gimc.EnumerationParams;
  readonly recordStatus: RecordStatus;
  readonly prependEntities: gimc.Entity[];
  readonly appendEntities: gimc.Entity[] = [];

  constructor(namespace: ns.Namespace) {
    const attrF = new gimc.EagsAttrFactory();
    this.enumParams = new DefaultEnumParams(attrF, namespace);
    this.entityParams = {
      attrFactory: attrF,
      namespace: namespace,
      adviceGen: (entity: gimc.Entity): gimTyp.TypicalEntityAdvice => {
        const createdAtAttr = attrF.createdAt(entity);
        const updatedOnAttr = attrF.updatedOn(entity);
        const recordStatusAttr = this.recordStatus
          .createDefaultableRelationship(
            entity,
            this.recordStatus.defaultValue,
          );

        // force the attributes into the objects so that {entity.createdAt}
        // and similar accessors work in string interpolation and in TypeScript
        // IDEs like this:
        // const common = (peron as any) as CommonTypicalEntityAttributes
        // common.derive(entity)

        // deno-lint-ignore no-explicit-any
        const entityObj = entity as any;
        entityObj.createdAt = createdAtAttr;
        entityObj.updatedOn = updatedOnAttr;
        entityObj.recordStatus = recordStatusAttr;
        return {
          injectAttrsAfterIdentity: [],
          injectAttrsBeforeAuditSection: [],
          appendAttrs: [
            createdAtAttr,
            updatedOnAttr,
            recordStatusAttr,
          ],
        };
      },
    };
    this.viewParams = {
      attrFactory: attrF,
      namespace: namespace,
      adviceGen: (entity: gimc.Entity): gimTyp.TypicalEntityAdvice => {
        return {
          injectAttrsAfterIdentity: [],
          injectAttrsBeforeAuditSection: [],
          appendAttrs: [],
        };
      },
    };
    this.storedProcParams = {
      attrFactory: attrF,
      namespace: namespace,
      adviceGen: (entity: gimc.Entity): gimTyp.TypicalEntityAdvice => {
        return {
          injectAttrsAfterIdentity: [],
          injectAttrsBeforeAuditSection: [],
          appendAttrs: [],
        };
      },
    };
    this.storedFuncParams = {
      attrFactory: attrF,
      namespace: namespace,
      adviceGen: (entity: gimc.Entity): gimTyp.TypicalEntityAdvice => {
        return {
          injectAttrsAfterIdentity: [],
          injectAttrsBeforeAuditSection: [],
          appendAttrs: [],
        };
      },
    };
    this.typeDefnParams = {
      attrFactory: attrF,
      namespace: namespace,
      adviceGen: (entity: gimc.Entity): gimTyp.TypicalEntityAdvice => {
        return {
          injectAttrsAfterIdentity: [],
          injectAttrsBeforeAuditSection: [],
          appendAttrs: [],
        };
      },
    };

    this.recordStatus = new RecordStatus(this.enumParams);
    this.prependEntities = [this.recordStatus];
  }
}
