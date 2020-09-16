import {
  govnImCore as gimc,
  govnImTypical as gimTyp,
} from "./deps.ts";
import type { Party, PartyRelatedInfoModelParams } from "./party.ts";

export class ContactType extends gimc.DefaultEnumeration<ContactType> {
  static readonly values = new class
    implements gimc.EnumerationValues<ContactType> {
    readonly isEnumerationValues?: ContactType;
    readonly EMAIL: gimc.EnumerationValue = { id: 1, value: "Email" };
    readonly SMS: gimc.EnumerationValue = {
      id: 2,
      value: "SMS",
    };
    readonly CALL: gimc.EnumerationValue = { id: 3, value: "Call" };
    readonly LAND: gimc.EnumerationValue = { id: 4, value: "Land" };
  }();
  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("Contact_Type"),
      ContactType.values,
      params,
    );
  }
}

export class ContactElectronic extends gimTyp.TypicalPersistentEntity {
  readonly party: gimc.BelongsTo<Party>;
  readonly contactType: gimc.EnumAttribute<ContactType>;
  readonly details: gimc.Text;

  constructor(
    readonly contactTypeEnum: ContactType,
    params: PartyRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("contact_electronic", "electronic_contacts"),
      params.entityParams,
    );
    this.party = params.partyFactory.party.createBelongsToRel(this);
    this.contactType = this.contactTypeEnum.createRelationship(this);
    this.details = this.text("electronic_details");
    this.insertAttrs(
      this.details,
      this.contactType,
      this.party,
    );
  }
}

export class ContactTele extends gimTyp.TypicalPersistentEntity {
  readonly party: gimc.BelongsTo<Party>;
  readonly contactType: gimc.EnumAttribute<ContactType>;
  readonly number: gimc.Text;

  constructor(
    readonly contactTypeEnum: ContactType,
    params: PartyRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("contact_tele", "telephone_numbers"),
      params.entityParams,
    );
    this.party = params.partyFactory.party.createBelongsToRel(this);
    this.contactType = this.contactTypeEnum.createRelationship(this);
    this.number = this.text("number");
    this.insertAttrs(
      this.number,
      this.contactType,
      this.party,
    );
  }
}

export class ContactLand extends gimTyp.TypicalPersistentEntity {
  readonly party: gimc.BelongsTo<Party>;
  readonly contactType: gimc.EnumAttribute<ContactType>;
  readonly line1: gimc.Text;
  readonly line2: gimc.Text;
  readonly zipCode: gimc.Text;
  readonly city: gimc.Text;
  readonly state: gimc.Text;
  readonly country: gimc.Text;

  constructor(
    readonly contactTypeEnum: ContactType,
    params: PartyRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("contact_land", "land_contacts"),
      params.entityParams,
    );
    this.party = params.partyFactory.party.createBelongsToRel(this);
    this.contactType = this.contactTypeEnum.createRelationship(this);
    this.line1 = this.text("address_line1");
    this.line2 = this.text("address_line2");
    this.zipCode = this.text("address_zip");
    this.city = this.text("address_city");
    this.state = this.text("address_state");
    this.country = this.text("address_country");
    this.insertAttrs(
      this.line1,
      this.line2,
      this.zipCode,
      this.city,
      this.state,
      this.country,
      this.contactType,
      this.party,
    );
  }
}

export interface ContactRelatedInfoModelParams
  extends PartyRelatedInfoModelParams {
  readonly contactFactory: ContactFactory;
}

export class ContactFactory {
  readonly contactType: ContactType;
  readonly electronic: ContactElectronic;
  readonly telephonic: ContactTele;
  readonly land: ContactLand;

  constructor(params: PartyRelatedInfoModelParams) {
    this.contactType = new ContactType(
      params.enumParams,
    );
    this.electronic = new ContactElectronic(this.contactType, params);
    this.telephonic = new ContactTele(this.contactType, params);
    this.land = new ContactLand(this.contactType, params);
  }
}
