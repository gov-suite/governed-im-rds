import {
  govnImCore as gimc,
  govnImTypical as gimTyp,
} from "./deps.ts";

export class AccountType extends gimc.DefaultEnumeration<AccountType> {
  static readonly values = new class
    implements gimc.EnumerationValues<AccountType> {
    readonly isEnumerationValues?: AccountType;
    readonly PERSON: gimc.EnumerationValue = { id: 1, value: "Person" };
    readonly SERVICE: gimc.EnumerationValue = { id: 2, value: "Service" };
  }();

  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("Account_Type"),
      AccountType.values,
      params,
    );
  }
}

export class AccountAuthType extends gimc.DefaultEnumeration<AccountAuthType> {
  static readonly values = new class
    implements gimc.EnumerationValues<AccountAuthType> {
    readonly isEnumerationValues?: AccountAuthType;
    readonly EMAIL: gimc.EnumerationValue = { id: 1, value: "E-mail" };
  }();

  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("Account_Auth_Type"),
      AccountAuthType.values,
      params,
    );
  }
}

export class Account extends gimTyp.TypicalPersistentEntity {
  readonly accountType: gimc.EnumAttribute<AccountType>;
  readonly accountName: gimc.Text;

  constructor(
    readonly accountTypeEnum: AccountType,
    params: gimTyp.TypicalInfoModelStructParams,
  ) {
    super(
      gimc.entityName("account"),
      params.entityParams,
    );
    this.accountType = this.accountTypeEnum.createRelationship(this);
    this.accountName = this.text("account_name");
    this.insertAttrs(this.accountType, this.accountName);
  }
}

export class AccountIdentifier extends gimTyp.TypicalPersistentEntity {
  readonly account: gimc.BelongsTo<Account>;
  readonly accountAuthType: gimc.EnumAttribute<AccountAuthType>;
  readonly identifierName: gimc.Text;
  readonly identifierValue: gimc.Text;
  readonly identifierValueEncrypted: gimc.EncryptedText;

  constructor(
    readonly accountEntity: Account,
    readonly accountAuthTypeEnum: AccountAuthType,
    params: gimTyp.TypicalInfoModelStructParams,
  ) {
    super(
      gimc.entityName("account_identifier"),
      params.entityParams,
    );
    this.account = accountEntity.createBelongsToRel(
      this,
      "auto",
      gimc.backRefName("identifier"),
    );
    this.identifierName = this.text("identifier_name");
    this.identifierValue = this.text("identifier_value");
    this.identifierValueEncrypted = this.encryptedText(
      "identifier_value_encrypted",
      true,
    );
    this.accountAuthType = this.accountAuthTypeEnum.createRelationship(this);
    this.insertAttrs(
      this.account,
      this.identifierName,
      this.identifierValue,
      this.identifierValueEncrypted,
      this.accountAuthType,
    );
  }
}

export class AccountFactory {
  readonly accountType: AccountType;
  readonly accountAuthType: AccountAuthType;
  readonly account: Account;
  readonly accountIdentifier: AccountIdentifier;

  constructor(params: gimTyp.TypicalInfoModelStructParams) {
    this.accountType = new AccountType(
      params.enumParams,
    );
    this.accountAuthType = new AccountAuthType(
      params.enumParams,
    );

    this.account = new Account(this.accountType, params);
    this.accountIdentifier = new AccountIdentifier(
      this.account,
      this.accountAuthType,
      params,
    );
  }
}
