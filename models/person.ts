import * as rds from "../rds/mod.ts";
import * as rdsTyp from "../typical/mod.ts";
import type { ContactRelatedInfoModelParams } from "./contact.ts";
import {
  govnImCore as gimc,
  govnImTypical as gimTyp,
} from "./deps.ts";
import type { Party, PartyRelatedInfoModelParams } from "./party.ts";
import * as pr from "./person-routines.ts";

export class SpokenLanguage extends gimc.DefaultEnumeration<SpokenLanguage> {
  static readonly values = new class
    implements gimc.EnumerationValues<SpokenLanguage> {
    readonly isEnumerationValues?: SpokenLanguage;
  }();
  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("Spoken_Language"),
      SpokenLanguage.values,
      params,
    );
  }
}

export class PersonEducationLevel
  extends gimc.DefaultEnumeration<PersonEducationLevel> {
  static readonly values = new class
    implements gimc.EnumerationValues<PersonEducationLevel> {
    readonly isEnumerationValues?: PersonEducationLevel;
  }();
  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("Person_Education_Level"),
      PersonEducationLevel.values,
      params,
    );
  }
}

export class PersonType extends gimc.DefaultEnumeration<PersonType> {
  static readonly values = new class
    implements gimc.EnumerationValues<PersonType> {
    readonly isEnumerationValues?: PersonType;
  }();
  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("Person_Type"),
      PersonType.values,
      params,
    );
  }
}

export class PersonGender extends gimc.DefaultEnumeration<PersonGender> {
  static readonly values = new class
    implements gimc.EnumerationValues<PersonGender> {
    readonly isEnumerationValues?: PersonGender;
    readonly MALE: gimc.EnumerationValue = { id: 1, value: "Male" };
    readonly FEMALE: gimc.EnumerationValue = { id: 2, value: "Female" };
  }();
  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("Person_Gender"),
      PersonGender.values,
      params,
    );
  }
}

export class Person extends gimTyp.TypicalPersistentEntity {
  readonly party: gimc.Extends<Party>;
  readonly personType: gimc.EnumAttribute<PersonType>;
  readonly gender: gimc.EnumAttribute<PersonGender>;
  readonly firstName: gimc.Text;
  readonly middleName: gimc.Text;
  readonly lastName: gimc.Text;
  readonly dob: gimc.Date;

  constructor(
    readonly personTypeEnum: PersonType,
    readonly genderEnum: PersonGender,
    params: PartyRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("person", "people"),
      params.entityParams,
      undefined,
      (e: gimc.Entity): gimc.Identity => {
        return params.partyFactory.party.createExtendsRel(e);
      },
    );
    this.party = this.identity as gimc.Extends<Party>;
    this.gender = this.genderEnum.createRelationship(this);
    this.personType = this.personTypeEnum.createRelationship(this);
    this.firstName = this.text("person_fname");
    this.middleName = this.text("person_mname");
    this.lastName = this.text("person_lname");
    this.dob = this.dateTime("dob");
    this.insertAttrs(
      // this.party is not passed in because identity was already created
      this.personType,
      this.firstName,
      this.middleName,
      this.lastName,
      this.gender,
      this.dob,
    );
  }
}
export class PersonDemographicsTypeDefn extends rdsTyp.TypicalViewEntity
  implements rds.TypeDefnSqlSupplier<PersonDemographicsView> {
  readonly isTypeDefn = true;
  readonly firstName: gimc.Text;
  readonly middleName: gimc.Text;
  readonly lastName: gimc.Text;
  readonly dob: gimc.Date;
  readonly gender: gimc.Integer;
  readonly personType: gimc.Integer;
  readonly details: gimc.Text;
  readonly line1: gimc.Text;
  readonly line2: gimc.Text;
  readonly city: gimc.Text;
  readonly state: gimc.Text;
  readonly country: gimc.Text;
  readonly zipCode: gimc.Text;

  constructor(
    readonly personDemogrParams:
      & PersonRelatedInfoModelParams
      & ContactRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("person_demographics_record"),
      personDemogrParams.typeDefnParams,
    );
    const person = personDemogrParams.personFactory.person;
    const land = personDemogrParams.contactFactory.land;
    const personGender = personDemogrParams.personFactory.personGender;

    this.firstName = person.firstName.derive(this) as gimc.Text;
    this.middleName = person.middleName.derive(this) as gimc.Text;
    this.lastName = person.lastName.derive(this) as gimc.Text;
    this.dob = person.dob.derive(this) as gimc.Date;
    this.gender = person.gender.derive(
      this,
      { name: "gender" },
    ) as gimc.Integer;
    this.personType = person.personType.derive(
      this,
      { name: "person_type" },
    ) as gimc.Integer;
    this.details = personDemogrParams.contactFactory.electronic.details.derive(
      this,
    ) as gimc.Text;
    this.line1 = land.line1.derive(this) as gimc.Text;
    this.line2 = land.line2.derive(this) as gimc.Text;
    this.city = land.city.derive(this) as gimc.Text;
    this.state = land.state.derive(this) as gimc.Text;
    this.country = land.country.derive(this) as gimc.Text;
    this.zipCode = land.zipCode.derive(this) as gimc.Text;

    this.insertAttrs(
      this.firstName,
      this.middleName,
      this.lastName,
      this.details,
      this.dob,
      this.gender,
      this.personType,
      personDemogrParams.contactFactory.telephonic.number.derive(
        this,
      ),
      this.line1,
      this.line2,
      this.city,
      this.state,
      this.country,
      this.zipCode,
    );
  }
}

export class PersonDemographicsView extends rdsTyp.TypicalViewEntity
  implements rds.SqlViewQuerySupplier<PersonDemographicsView> {
  constructor(
    readonly personDemogrParams:
      & PersonRelatedInfoModelParams
      & ContactRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("person_demographics"),
      personDemogrParams.viewParams,
    );
    // TODO: reuse the PersonDemographicsTypeDefn instead of copy/paste
    const person = personDemogrParams.personFactory.person;
    const land = personDemogrParams.contactFactory.land;
    this.insertAttrs(
      person.identity.derive(this),
      person.firstName.derive(this),
      person.middleName.derive(this),
      person.lastName.derive(this),
      personDemogrParams.contactFactory.electronic.details.derive(this),
      person.dob.derive(this),
      land.line1.derive(this),
      land.line2.derive(this),
      land.city.derive(this),
      land.state.derive(this),
      land.country.derive(this),
      land.zipCode.derive(this),
    );
  }

  sqlViewQuery(
    ctx: rds.RdbmsEngineContext,
    view: rds.View<PersonDemographicsView>,
  ): rds.ViewBodySqlQuery | rds.CreateViewStatement {
    return {
      isViewBodySqlQuery: true,
      sql: rds.interpolateEntityAttrNamesInSQL(ctx, {
        sql: `
        SELECT {person.identity}, {person:firstName}, {person:middleName}, {person:lastName}, {contactElec:details}, {person:dob}, {contactLand:line1},
        {contactLand:line2}, {contactLand:city}, {contactLand:state}, {contactLand:country}, {contactLand:zipCode}
        FROM {party} 
               INNER JOIN {person} ON {party.identity} = {person.identity}
               LEFT JOIN {contactLand} ON {party.identity} = {contactLand.party}
               LEFT JOIN {contactElec} ON {party.identity} = {contactElec.party}
               LEFT JOIN {contactTele} ON {party.identity} = {contactTele.party}
         WHERE {party.identity} = {person.identity}`,
        with: {
          party: this.personDemogrParams.partyFactory.party,
          person: this.personDemogrParams.personFactory.person,
          contactLand: this.personDemogrParams.contactFactory.land,
          contactElec: this.personDemogrParams.contactFactory.electronic,
          contactTele: this.personDemogrParams.contactFactory.telephonic,
        },
        unindentBlock: true,
      }),
      persistAsName: "vw-person-demographics",
    };
  }
}

export interface PersonRelatedInfoModelParams
  extends PartyRelatedInfoModelParams {
  readonly personFactory: PersonFactory;
}

export class PersonFactory {
  readonly spokenLanguage: SpokenLanguage;
  readonly personEducationLevel: PersonEducationLevel;
  readonly personType: PersonType;
  readonly personGender: PersonGender;
  readonly person: Person;
  readonly personDemogrTypeDefn: PersonDemographicsTypeDefn;
  readonly personDemogrView: PersonDemographicsView;
  readonly createPersonDemographicsProc: pr.CreatePersonDemographicsProc;

  constructor(params: ContactRelatedInfoModelParams) {
    this.spokenLanguage = new SpokenLanguage(params.enumParams);
    this.personEducationLevel = new PersonEducationLevel(params.enumParams);
    this.personType = new PersonType(params.enumParams);
    this.personGender = new PersonGender(params.enumParams);
    this.person = new Person(this.personType, this.personGender, params);

    const demogrParams = { ...params, personFactory: this };
    this.personDemogrTypeDefn = new PersonDemographicsTypeDefn(demogrParams);
    this.personDemogrView = new PersonDemographicsView(demogrParams);
    this.createPersonDemographicsProc = new pr.CreatePersonDemographicsProc(
      demogrParams,
    );
  }
}
