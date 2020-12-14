import type { ContactRelatedInfoModelParams } from "./contact.ts";
import { govnImCore as gimc, govnImTypical as gimTyp } from "./deps.ts";
import { CreateOrganizationProc } from "./organization-routines.ts";
import type { Party, PartyRelatedInfoModelParams } from "./party.ts";

export class OrganizationType
  extends gimc.DefaultEnumeration<OrganizationType> {
  static readonly values = new class
    implements gimc.EnumerationValues<OrganizationType> {
    readonly isEnumerationValues?: OrganizationType;
    readonly TENANT: gimc.EnumerationValue = { id: 1, value: "Tenant" };
    readonly INSTITUTION: gimc.EnumerationValue = {
      id: 2,
      value: "Institution",
    };
    readonly BUSINESS_UNIT: gimc.EnumerationValue = {
      id: 3,
      value: "Business Unit",
    };
  }();

  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("Organization_Type"),
      OrganizationType.values,
      params,
    );
  }
}

export class Organization extends gimTyp.TypicalPersistentEntity {
  readonly party: gimc.Extends<Party>;
  readonly parent: gimc.SelfReference<Organization>;
  readonly orgType: gimc.EnumAttribute<OrganizationType>;
  readonly orgName: gimc.Text;

  constructor(
    readonly orgTypeEnum: OrganizationType,
    params: PartyRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("organization"),
      params.entityParams,
      undefined,
      (e: gimc.Entity): gimc.Identity => {
        return params.partyFactory.party.createExtendsRel(e);
      },
    );
    this.party = this.identity as gimc.Extends<Party>;
    this.parent = this.createSelfRef(
      gimc.attributeName("parent_org_id", "parent_org"),
    );
    this.orgType = this.orgTypeEnum.createRelationship(this);
    this.orgName = this.text("org_name");
    this.insertAttrs(this.orgType, this.parent, this.orgName);
  }
}

export interface OrganizationRelatedInfoModelParams
  extends PartyRelatedInfoModelParams {
  readonly organizationFactory: OrganizationFactory;
}
export class OrganizationFactory {
  readonly orgType: OrganizationType;
  readonly organization: Organization;
  readonly createOrganizationProc: CreateOrganizationProc;

  constructor(entityParams: ContactRelatedInfoModelParams) {
    this.orgType = new OrganizationType(
      entityParams.partyFactory.scopedEnumParams,
    );
    this.organization = new Organization(this.orgType, entityParams);
    const orgParams = { ...entityParams, organizationFactory: this };
    this.createOrganizationProc = new CreateOrganizationProc(orgParams);
  }
}
