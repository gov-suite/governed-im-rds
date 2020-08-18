import {
  govnImCore as gimc,
  govnImTypical as gimTyp,
} from "./deps.ts";
import { Party, PartyRelatedInfoModelParams } from "./party.ts";

export class AssetType extends gimc.DefaultEnumeration<AssetType> {
  static readonly values = new class
    implements gimc.EnumerationValues<AssetType> {
    readonly isEnumerationValues?: AssetType;
    readonly PROJECT: gimc.EnumerationValue = { id: 1, value: "Project" };
    readonly SUBPROJECT: gimc.EnumerationValue = { id: 2, value: "Subproject" };
    readonly COMPONENT: gimc.EnumerationValue = { id: 3, value: "Component" };
    readonly SUBCOMPONENT: gimc.EnumerationValue = {
      id: 4,
      value: "Subcomponent",
    };
  }();

  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("asset_type"),
      AssetType.values,
      params,
    );
  }
}

export class AssetRelationshipType
  extends gimc.DefaultEnumeration<AssetRelationshipType> {
  static readonly values = new class
    implements gimc.EnumerationValues<AssetRelationshipType> {
    readonly isEnumerationValues?: AssetRelationshipType;
    readonly PARENT_CHILD: gimc.EnumerationValue = {
      id: 1,
      value: "Parent-Child",
    };
    readonly ROOT_NO_PARENT: gimc.EnumerationValue = {
      id: 2,
      value: "Root has no Parent",
    };
  }();

  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("asset_relationship_type"),
      AssetRelationshipType.values,
      params,
    );
  }
}

export class Asset extends gimTyp.TypicalPersistentEntity {
  readonly party: gimc.BelongsTo<Party>;
  readonly assetType: gimc.EnumAttribute<AssetType>;
  readonly assetName: gimc.Text;
  readonly description: gimc.Text;

  constructor(
    readonly assetTypeEnum: AssetType,
    params: PartyRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("asset"),
      params.entityParams,
    );
    this.party = params.partyFactory.party.createBelongsToRel(this);
    this.assetType = this.assetTypeEnum.createRelationship(this);
    this.assetName = this.text("name");
    this.description = this.text("description");
    this.insertAttrs(
      this.party,
      this.assetType,
      this.assetName,
      this.description,
    );
  }
}

export class AssetRelationship extends gimTyp.TypicalPersistentEntity {
  readonly party: gimc.BelongsTo<Party>;
  readonly assetRelationshipType: gimc.EnumAttribute<AssetRelationshipType>;
  readonly assetParent: gimc.BelongsTo<Asset>;
  readonly assetChild: gimc.BelongsTo<Asset>;
  readonly assetName: gimc.Text;
  readonly description: gimc.Text;

  constructor(
    readonly assetEntity: Asset,
    readonly assetRelationshipTypeEnum: AssetRelationshipType,
    params: PartyRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("asset_relationship"),
      params.entityParams,
    );
    this.party = params.partyFactory.party.createBelongsToRel(this);
    this.assetRelationshipType = this.assetRelationshipTypeEnum
      .createRelationship(
        this,
      );
    this.assetParent = this.assetEntity.createBelongsToRel(
      this,
      gimc.attributeName("asset_parent", "parent_asset"),
    );
    this.assetChild = this.assetEntity.createBelongsToRel(
      this,
      gimc.attributeName("asset_child", "child_asset"),
    );
    this.assetName = this.text("name");
    this.description = this.text("description");
    this.insertAttrs(
      this.party,
      this.assetRelationshipType,
      this.assetParent,
      this.assetChild,
      this.assetName,
      this.description,
    );
  }
}

export interface AssetRelatedInfoModelParams
  extends PartyRelatedInfoModelParams {
  readonly assetFactory: AssetFactory;
}

export class AssetFactory {
  readonly assetType: AssetType;
  readonly assetRelationshipType: AssetRelationshipType;
  readonly asset: Asset;
  readonly assetRelationship: AssetRelationship;

  constructor(params: PartyRelatedInfoModelParams) {
    this.assetType = new AssetType(
      params.enumParams,
    );
    this.assetRelationshipType = new AssetRelationshipType(
      params.enumParams,
    );
    this.asset = new Asset(this.assetType, params);
    this.assetRelationship = new AssetRelationship(
      this.asset,
      this.assetRelationshipType,
      params,
    );
  }
}
