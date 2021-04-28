import * as rds from "../rds/mod.ts";
import * as rdsTyp from "../typical/mod.ts";
import type * as c from "./contact.ts";
import { govnImCore as gimc } from "./deps.ts";
import type * as o from "./organization.ts";

export class CreateOrganizationProc extends rdsTyp.TypicalStoredRoutineEntity
  implements rds.StoredProcedureCodeSupplier<CreateOrganizationProc> {
  readonly orgName: gimc.Text;
  readonly parent: gimc.Integer;
  readonly orgType: gimc.Text;
  readonly email: gimc.Text;
  readonly phone: gimc.Text;
  readonly line1: gimc.Text;
  readonly line2: gimc.Text;
  readonly city: gimc.Text;
  readonly state: gimc.Text;
  readonly country: gimc.Text;
  readonly zipCode: gimc.Text;
  readonly party: gimc.UuidText & rds.StoredRoutineArgMutabilitySupplier;

  constructor(
    readonly organizationParams:
      & o.OrganizationRelatedInfoModelParams
      & c.ContactRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("usp_create_organization"),
      organizationParams.storedProcParams,
    );

    const organization =
      this.organizationParams.organizationFactory.organization;
    const land = this.organizationParams.contactFactory.land;
    const orgType = this.organizationParams.organizationFactory.orgType;

    this.orgName = organization.orgName.derive(
      this,
      { name: "org_name" },
    ) as gimc.Text;

    this.parent = organization.parent.derive(
      this,
      { name: "parent" },
    ) as gimc.Integer;
    this.orgType = orgType.codeAttr.derive(
      this,
      { name: "org_type" },
    ) as gimc.Text;

    this.email = this.organizationParams.contactFactory.electronic.details
      .derive(
        this,
        { name: "email" },
      ) as gimc.Text;

    this.phone = this.organizationParams.contactFactory.telephonic.number
      .derive(
        this,
        { name: "phone" },
      ) as gimc.Text;
    this.line1 = land.line1.derive(this) as gimc.Text;
    this.line2 = land.line2.derive(this) as gimc.Text;
    this.city = land.city.derive(this, { name: "city" }) as gimc.Text;
    this.state = land.state.derive(this, { name: "state" }) as gimc.Text;
    this.country = land.country.derive(this, { name: "country" }) as gimc.Text;
    this.zipCode = land.zipCode.derive(this, { name: "zip_code" }) as gimc.Text;
    this.party = this.uuidText(
      "party_id",
    ) as gimc.UuidText & rds.StoredRoutineArgMutabilitySupplier;
    this.party.storedRoutineArgMutability =
      rds.StoredRoutineArgMutability.InOut;
    this.insertAttrs(this.party);
    this.argAttrs?.push(
      this.orgName,
      this.orgType,
      this.parent,
      this.email,
      this.phone,
      this.line1,
      this.line2,
      this.city,
      this.state,
      this.country,
      this.zipCode,
      this.party,
    );
  }

  storedProcedureFunctionWrapper(): rds.StoredProcedureFunctionWrapper {
    return {
      wrapperStoredFunctionName: this.name.inflect() + "_wf",
    };
  }

  storedProcedureCode(
    ctx: rds.RdbmsEngineContext,
    fn: rds.StoredProcedure<CreateOrganizationProc>,
  ): rds.StoredRoutineBodyCode | rds.StoredRoutineCode {
    return {
      isStoredRoutineBodyCode: true,
      persistAsName: "usp-create-organization",
      bodyCode: rds.interpolateEntityAttrNamesInSQL(ctx, {
        sql: `
          DECLARE
          
          BEGIN
              INSERT INTO {party} ({party:partyName}, {party:partyType})
                  VALUES (org_name, (
                          SELECT
                          {partyType:identity}
                          FROM
                              {partyType}
                          WHERE
                          {partyType:code} = 'ORGANIZATION'))
              RETURNING
                  id INTO party_id;

              INSERT INTO {organization}(
                {organization:identity}, {organization:parent}, {organization:orgType}, {organization:orgName})
                    VALUES (party_id, parent, (SELECT
                      {orgType:identity}
                      FROM
                          {orgType}
                      WHERE
                      {orgType:code} = org_type), org_name );
                    
              INSERT INTO {contactLand} ({contactLand:line1}, {contactLand:line2}, {contactLand:zipCode}, {contactLand:city}, {contactLand:state}, {contactLand:country}, {contactLand:contactType}, {contactLand:party}, {contactLand:recordStatus})
                  VALUES (address_line1, address_line2, zip_code, city, state, country,  (SELECT
                    {contactType:identity}
                  FROM
                      {contactType}
                  WHERE
                  {contactType:code} = 'LAND'), party_id, 1);
          
              INSERT INTO {contactTele} ({contactTele:number},{ contactTele:contactType}, {contactTele:party}, {contactTele:recordStatus})
                  VALUES (phone, (SELECT
                    {contactType:identity}
                  FROM
                      {contactType}
                  WHERE
                  {contactType:code} = 'CALL'), party_id, 1);
          
              INSERT INTO {contactElec} ({contactElec:details}, {contactElec:contactType}, {contactElec:party}, {contactElec:recordStatus})
                  VALUES (email, (SELECT
                    {contactType:identity}
                  FROM
                      {contactType}
                  WHERE
                  {contactType:code} = 'EMAIL'), party_id, 1);
      
          END;
      `,
        with: {
          party: this.organizationParams.partyFactory.party,
          partyType: this.organizationParams.partyFactory.partyType,
          organization:
            this.organizationParams.organizationFactory.organization,
          orgType: this.organizationParams.organizationFactory.orgType,
          contactLand: this.organizationParams.contactFactory.land,
          contactElec: this.organizationParams.contactFactory.electronic,
          contactTele: this.organizationParams.contactFactory.telephonic,
          contactType: this.organizationParams.contactFactory.contactType,
        },
        unindentBlock: true,
      }),
    };
  }
}
