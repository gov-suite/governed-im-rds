import {
  govnImCore as gimc,
  govnImTypical as gimTyp,
} from "./deps.ts";
import { Party, PartyRelatedInfoModelParams } from "./party.ts";

export class ConfigurationScope extends gimTyp.TypicalPersistentEntity {
  readonly configCode: gimc.Text;
  readonly configValue: gimc.Text;
  readonly description: gimc.Text;
  readonly hierarchyLevel: gimc.Integer;

  constructor(
    params: PartyRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("configuration_scope"),
      params.entityParams,
    );
    this.configCode = this.text("code");
    this.configValue = this.text("value");
    this.description = this.text("description");
    this.hierarchyLevel = this.integer("hierarchy_level");
    this.insertAttrs(
      this.configCode,
      this.configValue,
      this.description,
      this.hierarchyLevel,
    );
  }
}

export class MasterConfiguration extends gimTyp.TypicalPersistentEntity {
  readonly configurationScope: gimc.BelongsTo<ConfigurationScope>;
  readonly configName: gimc.Text;
  readonly description: gimc.Text;
  readonly defaultValue: gimc.Text;
  readonly shortKey: gimc.Text;
  readonly configType: gimc.Text;

  constructor(
    readonly configurationScopeEntity: ConfigurationScope,
    params: PartyRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("master_configuration"),
      params.entityParams,
    );
    this.configurationScope = this.configurationScopeEntity.createBelongsToRel(
      this,
    );
    this.configName = this.text("name");
    this.description = this.text("description");
    this.defaultValue = this.text("default_value");
    this.shortKey = this.text("short_key");
    this.configType = this.text("config_type");

    this.insertAttrs(
      this.configurationScope,
      this.configName,
      this.description,
      this.defaultValue,
      this.shortKey,
      this.configType,
    );
  }
}

export class ConfigurationValue extends gimTyp.TypicalPersistentEntity {
  readonly party: gimc.BelongsTo<Party>;
  readonly masterConfiguration: gimc.BelongsTo<MasterConfiguration>;
  readonly configValue: gimc.Json;
  readonly isMultiValue: gimc.Boolean;
  readonly nameAs: gimc.Text;
  readonly description: gimc.Text;

  constructor(
    readonly MasterConfigurationEntity: MasterConfiguration,
    params: PartyRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("configuration_value"),
      params.entityParams,
    );
    this.party = params.partyFactory.party.createBelongsToRel(this),
      this.masterConfiguration = this.MasterConfigurationEntity
        .createBelongsToRel(
          this,
        );
    this.configValue = this.Json("value");
    this.isMultiValue = this.boolean("is_MultiValue");
    this.nameAs = this.text("nameas");
    this.description = this.text("description");

    this.insertAttrs(
      this.party,
      this.masterConfiguration,
      this.configValue,
      this.isMultiValue,
      this.nameAs,
      this.description,
    );
  }
}

export class ConfigurationMasterOptions extends gimTyp.TypicalPersistentEntity {
  readonly configName: gimc.Text;
  readonly description: gimc.Text;
  readonly type: gimc.Text;

  constructor(
    params: PartyRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("configuration_master_options"),
      params.entityParams,
    );
    this.configName = this.text("name");
    this.description = this.text("description");
    this.type = this.text("type");
    this.insertAttrs(
      this.configName,
      this.description,
      this.type,
    );
  }
}

export class ConfigurationFeatureFlag extends gimTyp.TypicalPersistentEntity {
  readonly party: gimc.BelongsTo<Party>;
  readonly configurationMasterOptions: gimc.BelongsTo<
    ConfigurationMasterOptions
  >;
  readonly masterConfiguration: gimc.BelongsTo<MasterConfiguration>;

  constructor(
    readonly configurationMasterOptionsEntity: ConfigurationMasterOptions,
    readonly masterConfigurationEntity: MasterConfiguration,
    params: PartyRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("configuration_feature_flag"),
      params.entityParams,
    );
    this.party = params.partyFactory.party.createBelongsToRel(this);
    this.configurationMasterOptions = this.configurationMasterOptionsEntity
      .createBelongsToRel(this);
    this.masterConfiguration = this.masterConfigurationEntity
      .createBelongsToRel(this);
    this.insertAttrs(
      this.party,
      this.configurationMasterOptions,
      this.masterConfiguration,
    );
  }
}

export class ConfigFeatureFlagFactory {
  readonly configurationScope: ConfigurationScope;
  readonly masterConfiguration: MasterConfiguration;
  readonly configurationValue: ConfigurationValue;
  readonly configurationMasterOptions: ConfigurationMasterOptions;
  readonly configurationFeatureFlag: ConfigurationFeatureFlag;

  constructor(params: PartyRelatedInfoModelParams) {
    this.configurationScope = new ConfigurationScope(params);
    this.masterConfiguration = new MasterConfiguration(
      this.configurationScope,
      params,
    );
    this.configurationValue = new ConfigurationValue(
      this.masterConfiguration,
      params,
    );
    this.configurationMasterOptions = new ConfigurationMasterOptions(
      params,
    );
    this.configurationFeatureFlag = new ConfigurationFeatureFlag(
      this.configurationMasterOptions,
      this.masterConfiguration,
      params,
    );
  }
}
