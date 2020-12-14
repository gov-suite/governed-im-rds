import * as rds from "../rds/mod.ts";
import { govnImCore as gimc, govnImTypical as gimTyp } from "./deps.ts";
import type { Party, PartyRelatedInfoModelParams } from "./party.ts";

export class ResourceType extends gimc.DefaultEnumeration<ResourceType> {
  static readonly values = new class
    implements gimc.EnumerationValues<ResourceType> {
    readonly isEnumerationValues?: ResourceType;
    readonly PROJECT: gimc.EnumerationValue = { id: 1, value: "Project" };
    readonly SUBPROJECT: gimc.EnumerationValue = { id: 2, value: "Subproject" };
    readonly COMPONENT: gimc.EnumerationValue = { id: 3, value: "Component" };
    readonly SUBCOMPONENT: gimc.EnumerationValue = {
      id: 4,
      value: "Subcomponent",
    };
    readonly ASSET: gimc.EnumerationValue = { id: 5, value: "Asset" };
  }();

  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("resource_type"),
      ResourceType.values,
      params,
    );
  }
}

export class ResourceRelationshipType
  extends gimc.DefaultEnumeration<ResourceRelationshipType> {
  static readonly values = new class
    implements gimc.EnumerationValues<ResourceRelationshipType> {
    readonly isEnumerationValues?: ResourceRelationshipType;
    readonly PARENT_CHILD: gimc.EnumerationValue = {
      id: 1,
      value: "Parent-Child",
    };
    readonly ROOT_NO_PARENT: gimc.EnumerationValue = {
      id: 2,
      value: "Root has no Parent",
    };
    readonly PROJECT_ASSET: gimc.EnumerationValue = {
      id: 3,
      value: "Project_Asset",
    };
  }();

  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("resource_relationship_type"),
      ResourceRelationshipType.values,
      params,
    );
  }
}

export class Resource extends gimTyp.TypicalPersistentEntity {
  readonly party: gimc.BelongsTo<Party>;
  readonly resourceType: gimc.EnumAttribute<ResourceType>;
  readonly resourceName: gimc.Text;
  readonly description: gimc.Text;

  constructor(
    readonly resourceTypeEnum: ResourceType,
    params: PartyRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("resource"),
      params.entityParams,
    );
    this.party = params.partyFactory.party.createBelongsToRel(this);
    this.resourceType = this.resourceTypeEnum.createRelationship(this);
    this.resourceName = this.text("name");
    this.description = this.text("description");
    this.insertAttrs(
      this.party,
      this.resourceType,
      this.resourceName,
      this.description,
    );
  }
}

export class ResourceRelationship extends gimTyp.TypicalPersistentEntity {
  readonly party: gimc.BelongsTo<Party>;
  readonly resourceRelationshipType: gimc.EnumAttribute<
    ResourceRelationshipType
  >;
  readonly resourceParent: gimc.BelongsTo<Resource>;
  readonly resourceChild: gimc.BelongsTo<Resource>;
  readonly resourceName: gimc.Text;
  readonly description: gimc.Text;

  constructor(
    readonly resourceEntity: Resource,
    readonly resourceRelationshipTypeEnum: ResourceRelationshipType,
    params: PartyRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("resource_relationship"),
      params.entityParams,
    );
    this.party = params.partyFactory.party.createBelongsToRel(this);
    this.resourceRelationshipType = this.resourceRelationshipTypeEnum
      .createRelationship(
        this,
      );
    this.resourceParent = this.resourceEntity.createBelongsToRel(
      this,
      gimc.attributeName("resource_parent", "parent_resource"),
    );
    this.resourceChild = this.resourceEntity.createBelongsToRel(
      this,
      gimc.attributeName("resource_child", "child_resource"),
    );
    this.resourceName = this.text("name");
    this.description = this.text("description");
    this.insertAttrs(
      this.party,
      this.resourceRelationshipType,
      this.resourceParent,
      this.resourceChild,
      this.resourceName,
      this.description,
    );
  }
}

export interface ResourceRelatedInfoModelParams
  extends PartyRelatedInfoModelParams {
  readonly resourceFactory: ResourceFactory;
}

export class ResourceFactory {
  readonly resourceType: ResourceType;
  readonly resourceRelationshipType: ResourceRelationshipType;
  readonly resource: Resource;
  readonly resourceRelationship: ResourceRelationship;

  constructor(params: PartyRelatedInfoModelParams) {
    this.resourceType = new ResourceType(
      params.enumParams,
    );
    this.resourceRelationshipType = new ResourceRelationshipType(
      params.enumParams,
    );
    this.resource = new Resource(this.resourceType, params);
    this.resourceRelationship = new ResourceRelationship(
      this.resource,
      this.resourceRelationshipType,
      params,
    );
  }
}
