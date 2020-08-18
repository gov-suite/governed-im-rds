import * as rds from "../rds/mod.ts";
import * as rdsTyp from "../typical/mod.ts";
import * as c from "./contact.ts";
import { govnImCore as gim } from "./deps.ts";
import * as p from "./person.ts";

export class CreatePersonDemographicsProc
  extends rdsTyp.TypicalStoredRoutineEntity
  implements rds.StoredProcedureCodeSupplier<CreatePersonDemographicsProc> {
  readonly firstName: gim.Text;
  readonly middleName: gim.Text;
  readonly lastName: gim.Text;
  readonly dob: gim.Date;
  readonly gender: gim.Integer;
  readonly personType: gim.Integer;
  readonly email: gim.Text;
  readonly phone: gim.Text;
  readonly line1: gim.Text;
  readonly line2: gim.Text;
  readonly city: gim.Text;
  readonly state: gim.Text;
  readonly country: gim.Text;
  readonly zipCode: gim.Text;
  readonly party: gim.Integer & rds.StoredRoutineArgMutabilitySupplier;

  constructor(
    readonly personDemogrFnParams:
      & p.PersonRelatedInfoModelParams
      & c.ContactRelatedInfoModelParams,
  ) {
    super(
      gim.entityName("usp_create_person_demographics"),
      personDemogrFnParams.storedProcParams,
    );

    const person = this.personDemogrFnParams.personFactory.person;
    const land = this.personDemogrFnParams.contactFactory.land;
    const personGender = this.personDemogrFnParams.personFactory.personGender;

    this.firstName = person.firstName.derive(this, {
      name: "first_name",
    }) as gim.Text;
    this.middleName = person.middleName.derive(this, {
      name: "middle_name",
    }) as gim.Text;
    this.lastName = person.lastName.derive(this, {
      name: "last_name",
    }) as gim.Text;
    this.gender = person.gender.derive(this, {
      name: "gender",
    }) as gim.Integer;
    this.personType = person.personType.derive(this, {
      name: "person_type",
    }) as gim.Integer;
    this.email = this.personDemogrFnParams.contactFactory.electronic.details
      .derive(
        this,
        { name: "email" },
      ) as gim.Text;
    this.dob = person.dob.derive(this) as gim.Date;
    this.phone = this.personDemogrFnParams.contactFactory.telephonic.number
      .derive(
        this,
        { name: "phone" },
      ) as gim.Text;
    this.line1 = land.line1.derive(this) as gim.Text;
    this.line2 = land.line2.derive(this) as gim.Text;
    this.city = land.city.derive(this, { name: "city" }) as gim.Text;
    this.state = land.state.derive(this, { name: "state" }) as gim.Text;
    this.country = land.country.derive(this, { name: "country" }) as gim.Text;
    this.zipCode = land.zipCode.derive(this, { name: "zip_code" }) as gim.Text;
    this.party = person.party.derive(this, {
      name: "party_id",
    }) as gim.Integer & rds.StoredRoutineArgMutabilitySupplier;
    this.party.storedRoutineArgMutability =
      rds.StoredRoutineArgMutability.InOut;
    this.insertAttrs(person.party.derive(this, { name: "party_id" }));
    this.argAttrs?.push(
      this.firstName,
      this.middleName,
      this.lastName,
      this.email,
      this.dob,
      this.gender,
      this.personType,
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
    fn: rds.StoredProcedure<CreatePersonDemographicsProc>,
  ): rds.StoredRoutineBodyCode | rds.StoredRoutineCode {
    return {
      isStoredRoutineBodyCode: true,
      persistAsName: "usp-create-person-demographics",
      bodyCode: rds.interpolateEntityAttrNamesInSQL(ctx, {
        sql: `
          
          DECLARE
          BEGIN
              INSERT INTO {party} ({party:partyName}, {party:partyType})
                  VALUES (first_name, (
                          SELECT
                          {partyType:identity}
                          FROM
                              {partyType}
                          WHERE
                          {partyType:code} = 'PERSON'))
              RETURNING
                  id INTO party_id;

              INSERT INTO {person}(
                {person:identity}, {person:personType}, {person:firstName}, {person:middleName}, {person:lastName}, {person:recordStatus},{person:dob}, {person:personGender})
                    VALUES (party_id, person_type, first_name, middle_name, last_name, 1,  dob, gender);
                    
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
          self: this,
          party: this.personDemogrFnParams.partyFactory.party,
          partyType: this.personDemogrFnParams.partyFactory.partyType,
          person: this.personDemogrFnParams.personFactory.person,
          personType: this.personDemogrFnParams.personFactory.personType,
          personGender: this.personDemogrFnParams.personFactory.personGender,
          contactLand: this.personDemogrFnParams.contactFactory.land,
          contactElec: this.personDemogrFnParams.contactFactory.electronic,
          contactTele: this.personDemogrFnParams.contactFactory.telephonic,
          contactType: this.personDemogrFnParams.contactFactory.contactType,
        },
        unindentBlock: true,
      }),
    };
  }
}
