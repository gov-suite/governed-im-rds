import * as rds from "../rds/mod.ts";
import * as assoc from "./association.ts";
import {
  contextMgr as cm,
  govnImCore as gimc,
  govnImTypical as gimTyp,
} from "./deps.ts";

export class PartyType extends gimc.DefaultEnumeration<PartyType> {
  static readonly values = new class
    implements gimc.EnumerationValues<PartyType> {
    readonly isEnumerationValues?: PartyType;
    readonly SYSTEM: gimc.EnumerationValue = { id: 1, value: "System" };
    readonly ORGANIZATION: gimc.EnumerationValue = {
      id: 2,
      value: "Organization",
    };
    readonly PERSON: gimc.EnumerationValue = { id: 3, value: "Person" };
  }();

  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("Party_Type"),
      PartyType.values,
      params,
    );
  }
}

export class PartyRelationType
  extends gimc.DefaultEnumeration<PartyRelationType> {
  static readonly values = new class
    implements gimc.EnumerationValues<PartyRelationType> {
    readonly isEnumerationValues?: PartyRelationType;
  }();
  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("Party_Relation_Type"),
      PartyRelationType.values,
      params,
    );
  }
}

export class PartyIdentifierSource
  extends gimc.DefaultEnumeration<PartyIdentifierSource> {
  static readonly values = new class
    implements gimc.EnumerationValues<PartyIdentifierSource> {
    readonly isEnumerationValues?: PartyIdentifierSource;
  }();

  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("Party_Identifier_Source"),
      PartyIdentifierSource.values,
      params,
    );
  }
}

export class Party extends gimTyp.TypicalPersistentEntity {
  static readonly systemPartyName = "SYSTEM";
  static readonly systemPartyId = "672124b6-9894-11e5-be38-001d42e813fe"; // should match ID of initial SYSTEM party row
  readonly partyType: gimc.EnumAttribute<PartyType>;
  readonly partyName: gimc.Text;
  readonly partyUuid: gimc.UuidText;

  constructor(
    readonly partyTypeEnum: PartyType,
    params: gimTyp.TypicalPersistentEntityParams,
  ) {
    super(
      gimc.entityName("Party", "Parties"),
      params,
    );
    this.partyType = this.partyTypeEnum.createRelationship(this);
    this.partyName = this.text("party_name");
    this.partyUuid = this.uuidText("party_uuid");
    this.insertAttrs(this.partyName, this.partyType, this.partyUuid);

    this.addSeedValues(
      this.partyName.value(Party.systemPartyName),
      this.partyType.value(PartyType.values.SYSTEM),
    );
  }
}

export class PartyIdentifier extends gimTyp.TypicalPersistentEntity {
  readonly party: gimc.BelongsTo<Party>;
  readonly partyIdSource: gimc.EnumAttribute<PartyIdentifierSource>;
  readonly identifierName: gimc.Text;
  readonly identifierValue: gimc.Text;

  constructor(
    readonly partyEntity: Party,
    readonly partyIdSourceEnum: PartyIdentifierSource,
    params: gimTyp.TypicalPersistentEntityParams,
  ) {
    super(
      gimc.entityName("party_identifier"),
      params,
    );
    this.party = partyEntity.createBelongsToRel(
      this,
      "auto",
      gimc.backRefName("identifier"),
    );
    this.identifierName = this.text("identifier_name");
    this.identifierValue = this.text("identifier_value");
    this.partyIdSource = this.partyIdSourceEnum.createRelationship(this);
    this.insertAttrs(
      this.party,
      this.identifierName,
      this.identifierValue,
      this.partyIdSource,
    );
  }
}

export class PartyRelation extends assoc.Association<Party, Party> {
  readonly originParty: gimc.BelongsTo<Party>;
  readonly relatedParty: gimc.BelongsTo<Party>;
  readonly relationshipType: gimc.EnumAttribute<PartyRelationType>;

  constructor(
    partyEntity: Party,
    readonly partyRelationTypeEnum: PartyRelationType,
    params: gimTyp.TypicalPersistentEntityParams,
  ) {
    super(
      gimc.entityName("party_relation"),
      params,
    );
    this.originParty = partyEntity.createBelongsToRel(
      this,
      gimc.attributeName("origin_party_id", "origin_party"),
      gimc.backRefName("related_party", "related_parties"),
    );
    this.relatedParty = partyEntity.createBelongsToRel(
      this,
      gimc.attributeName("related_party_id", "related_party"),
    );
    this.relationshipType = this.partyRelationTypeEnum.createRelationship(this);
    this.insertAttrs(
      this.originParty,
      this.relatedParty,
      this.relationshipType,
    );
  }
}

export interface PartyRelatedInfoModelParams
  extends gimTyp.TypicalInfoModelStructParams {
  readonly partyFactory: PartyFactory;
}

export class PartyFactory {
  readonly partyType: PartyType;
  readonly party: Party;
  readonly partyIdentifierSource: PartyIdentifierSource;
  readonly partyIdentifier: PartyIdentifier;
  readonly partyRelationType: PartyRelationType;
  readonly partyRelation: PartyRelation;
  readonly partyScopeEnumNamespaceGen: gimc.EnumerationNamespaceGenerator;
  readonly enumParams: gimc.EnumerationParams;
  readonly scopedEnumParams: gimc.EnumerationParams;

  constructor(readonly params: gimTyp.TypicalInfoModelStructParams) {
    this.enumParams = params.enumParams;

    this.partyType = new PartyType(this.enumParams);
    this.party = new Party(this.partyType, params.entityParams);

    // all domains should be able to be tied to a party (making them person or tenant specific)
    this.partyScopeEnumNamespaceGen = (entity: gimc.Entity) => {
      const partyRel = this.party.createBelongsToRel(entity, "auto");
      partyRel.valueSupplier = (ctx: cm.Context) => {
        return (
          ctx: cm.Context,
          attr: gimc.Attribute,
        ): gimc.AttributeValue => {
          if (rds.isRdbmsTableSqlDdlContext(ctx)) {
            return {
              attr: attr,
              attrValue: Party.systemPartyId,
              isValid: true,
            };
          }
          return {
            attr: attr,
            isValid: true,
            attrValue: (ctx: cm.Context): string => {
              if (rds.isRdbmsEngineContext(ctx)) {
                const ns = ctx.dialect.namingStrategy;
                const partyIdColName = ns.tableColumnName({
                  entity: this.party,
                  attr: this.party.identity,
                });
                const partyNameColName = ns.tableColumnName({
                  entity: this.party,
                  attr: this.party.partyName,
                });
                return `(select ${partyIdColName} from ${
                  ns.tableName(
                    this.party,
                  )
                } where ${partyNameColName} = '${Party.systemPartyName}')`;
              } else {
                return `/* expecting RDBMS SQL Dialect but cannot create SQL without it */`;
              }
            },
          };
        };
      };
      return {
        ...params.entityParams.namespace,
        isEnumerationNamespace: true,
        scopeAttrs: [partyRel],
      };
    };
    this.scopedEnumParams = {
      attrFactory: params.entityParams.attrFactory,
      adviceGen: this.params.entityParams.adviceGen,
      namespaceGen: this.partyScopeEnumNamespaceGen,
      mutable: true,
    };

    this.partyIdentifierSource = new PartyIdentifierSource(this.enumParams);
    this.partyIdentifier = new PartyIdentifier(
      this.party,
      this.partyIdentifierSource,
      params.entityParams,
    );

    this.partyRelationType = new PartyRelationType(this.enumParams);
    this.partyRelation = new PartyRelation(
      this.party,
      this.partyRelationType,
      params.entityParams,
    );
  }
}
