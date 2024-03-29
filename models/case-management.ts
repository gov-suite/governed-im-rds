import * as cmr from "./case-management-routines.ts";
import { govnImCore as gimc, govnImTypical as gimTyp } from "./deps.ts";
import type { PartyRelatedInfoModelParams } from "./party.ts";
import type { PersonFactory } from "./person.ts";

export class RequestType extends gimc.DefaultEnumeration<RequestType> {
  static readonly values = new class
    implements gimc.EnumerationValues<RequestType> {
    readonly isEnumerationValues?: RequestType;
    readonly MR: gimc.EnumerationValue = { id: 1, value: "Medical records" };
    readonly RADIOLOGY: gimc.EnumerationValue = {
      id: 2,
      value: "Radiology (images on CD and/or reports",
    };
    readonly PATHOLOGY: gimc.EnumerationValue = {
      id: 3,
      value: "Pathology slides",
    };
    readonly PATHOLOGY_TISSUE_BLOCK: gimc.EnumerationValue = {
      id: 4,
      value: "Pathology tissue block",
    };
    readonly EMPTY: gimc.EnumerationValue = {
      id: 5,
      value: "Patient portal being empty",
    };
    readonly INCOMPLETE: gimc.EnumerationValue = {
      id: 6,
      value: "Patient portal showing incomplete records",
    };
    readonly ERRORS: gimc.EnumerationValue = {
      id: 7,
      value: "Medical records containing errors",
    };
    readonly CALL_NOT_BY_DOCTOR: gimc.EnumerationValue = {
      id: 8,
      value: "Calls/voicemails not being returned by doctor",
    };
    readonly CALL_NOT_BY_STAFF: gimc.EnumerationValue = {
      id: 9,
      value: "Calls/voicemails not being returned by staff",
    };
    readonly RECORD_SET: gimc.EnumerationValue = {
      id: 10,
      value: "Designated record set",
    };
    readonly BILLING_RECORD: gimc.EnumerationValue = {
      id: 11,
      value: "Billing records",
    };
    readonly MISSING: gimc.EnumerationValue = {
      id: 12,
      value: "OpenNotes missing",
    };
  }();
  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("Request_Type"),
      RequestType.values,
      params,
    );
  }
}

export class IssueImpactMaster
  extends gimc.DefaultEnumeration<IssueImpactMaster> {
  static readonly values = new class
    implements gimc.EnumerationValues<IssueImpactMaster> {
    readonly isEnumerationValues?: IssueImpactMaster;
    readonly DELAYS: gimc.EnumerationValue = {
      id: "7a6167c6-70fe-41ca-ac4f-35c2b30ced53",
      value: "Delay in getting treatment",
    };
    readonly SUFFER: gimc.EnumerationValue = {
      id: "38eca71a-c937-4aed-9751-c9148006f519",
      value: "Suffering and pain",
    };
    readonly FINANCIAL_BURDENS: gimc.EnumerationValue = {
      id: "557b5773-5cb5-41bd-b121-69081bfaa1c9",
      value: "Financial burdens",
    };
    readonly INADEQUATE: gimc.EnumerationValue = {
      id: "2556daa1-8558-4514-855e-2db096f723fd",
      value: "Inadequate or no insurance coverage",
    };
    readonly HOSPITALIZATIONS: gimc.EnumerationValue = {
      id: "392dc9a1-b6d3-4df2-bfe6-f3935cda73b7",
      value: "Increased hospitalizations",
    };
  }();
  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("issue_impact_master"),
      IssueImpactMaster.values,
      params,
    );
  }
}

export class RequestStatus extends gimc.DefaultEnumeration<RequestStatus> {
  static readonly values = new class
    implements gimc.EnumerationValues<RequestStatus> {
    readonly isEnumerationValues?: RequestStatus;
    readonly NEW: gimc.EnumerationValue = { id: 1, value: "New" };
    readonly ACKNOWLEDGED: gimc.EnumerationValue = {
      id: 2,
      value: "Acknowledged",
    };
    readonly RESOLVED: gimc.EnumerationValue = { id: 3, value: "Resolved" };
    readonly CANCELLED: gimc.EnumerationValue = { id: 4, value: "Cancelled" };
    readonly DENIED: gimc.EnumerationValue = { id: 5, value: "Denied" };
  }();
  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("request_status"),
      RequestStatus.values,
      params,
    );
  }
}

export class RequestPriority extends gimc.DefaultEnumeration<RequestPriority> {
  static readonly values = new class
    implements gimc.EnumerationValues<RequestPriority> {
    readonly isEnumerationValues?: RequestPriority;
    readonly HIGH: gimc.EnumerationValue = { id: 1, value: "High" };
    readonly NORMAL: gimc.EnumerationValue = { id: 2, value: "Standard" };
  }();
  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("request_priority"),
      RequestPriority.values,
      params,
    );
  }
}

export class SourceNature extends gimc.DefaultEnumeration<SourceNature> {
  static readonly values = new class
    implements gimc.EnumerationValues<SourceNature> {
    readonly isEnumerationValues?: SourceNature;
    readonly HEALTHCARE_FACILITY: gimc.EnumerationValue = {
      id: 1,
      value: "Healthcare Facility",
    };
    readonly PHYSICIAN: gimc.EnumerationValue = { id: 2, value: "Physician" };
    readonly PRACTICE: gimc.EnumerationValue = { id: 3, value: "Practice" };
    readonly RADIOLOGY: gimc.EnumerationValue = { id: 4, value: "Radiology" };
  }();
  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("source_nature"),
      SourceNature.values,
      params,
    );
  }
}

export class DestinationNature
  extends gimc.DefaultEnumeration<DestinationNature> {
  static readonly values = new class
    implements gimc.EnumerationValues<DestinationNature> {
    readonly isEnumerationValues?: DestinationNature;
    readonly HEALTHCARE_FACILITY: gimc.EnumerationValue = {
      id: 1,
      value: "Healthcare Facility",
    };
    readonly PHYSICIAN: gimc.EnumerationValue = { id: 2, value: "Physician" };
    readonly PRACTICE: gimc.EnumerationValue = { id: 3, value: "Practice" };
    readonly INSURANCE_COMPANY: gimc.EnumerationValue = {
      id: 4,
      value: "Insurance Company",
    };
    readonly THIRD_PARTY: gimc.EnumerationValue = {
      id: 5,
      value: "Third Party",
    };
  }();
  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("destination_nature"),
      DestinationNature.values,
      params,
    );
  }
}

export class ImpactSeverity extends gimc.DefaultEnumeration<ImpactSeverity> {
  static readonly values = new class
    implements gimc.EnumerationValues<ImpactSeverity> {
    readonly isEnumerationValues?: ImpactSeverity;
    readonly PATIENT_SAFETY: gimc.EnumerationValue = {
      id: 1,
      value: "Patient Safety",
    };
    readonly CONTINUITY_OF_CARE: gimc.EnumerationValue = {
      id: 2,
      value: "Continuity of care",
    };
    readonly ADMINISTRATIVE_BURDEN: gimc.EnumerationValue = {
      id: 3,
      value: "Administrative burden",
    };
    readonly INSURANCE_APPROVAL: gimc.EnumerationValue = {
      id: 4,
      value: "Insurance Approval",
    };
    readonly DISABILITY_APPLICATION: gimc.EnumerationValue = {
      id: 5,
      value: "Disability application",
    };
  }();
  constructor(params: gimc.EnumerationParams) {
    super(
      gimc.enumName("impact_severity"),
      ImpactSeverity.values,
      params,
    );
  }
}

export class IssueDescriptionMaster extends gimTyp.TypicalPersistentEntity {
  readonly requestType: gimc.EnumAttribute<RequestType>;
  readonly issueName: gimc.Text;

  constructor(
    readonly requestTypeEnum: RequestType,
    params: PartyRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("issue_description_master"),
      params.entityParams,
    );
    this.requestType = this.requestTypeEnum.createRelationship(this);
    this.issueName = this.text("issue_description_master_name");
    this.insertAttrs(this.requestType, this.issueName);
  }
}

export interface CaseManagementRelatedInfoModelParams
  extends PartyRelatedInfoModelParams {
  readonly caseManagementFactory: CaseManagementFactory;
  readonly personFactory: PersonFactory;
}

export class CaseManagementFactory {
  readonly requestType: RequestType;
  readonly requestStatus: RequestStatus;
  readonly requestPriority: RequestPriority;
  readonly sourceNature: SourceNature;
  readonly destinationNature: DestinationNature;
  readonly issueImpactMaster: IssueImpactMaster;
  readonly impactSeverity: ImpactSeverity;
  readonly issueDescriptionMaster: IssueDescriptionMaster;
  readonly createIssueDescriptionMasterProc:
    cmr.CreateIssueDescriptionMasterProc;
  readonly createNegativeImpactMasterProc: cmr.CreateNegativeImpactMasterProc;

  constructor(
    params: PartyRelatedInfoModelParams,
    personF: PersonFactory,
  ) {
    this.requestType = new RequestType(
      params.enumParams,
    );

    this.issueImpactMaster = new IssueImpactMaster(
      params.partyFactory.scopedEnumParams,
    );

    this.requestStatus = new RequestStatus(
      params.enumParams,
    );
    this.requestPriority = new RequestPriority(
      params.enumParams,
    );

    this.sourceNature = new SourceNature(
      params.enumParams,
    );

    this.destinationNature = new DestinationNature(
      params.enumParams,
    );

    this.impactSeverity = new ImpactSeverity(
      params.enumParams,
    );

    this.issueDescriptionMaster = new IssueDescriptionMaster(
      this.requestType,
      params,
    );

    const caseMgmtParams = {
      ...params,
      caseManagementFactory: this,
      personFactory: personF,
    };

    this.createIssueDescriptionMasterProc = new cmr
      .CreateIssueDescriptionMasterProc(
      caseMgmtParams,
    );

    this.createNegativeImpactMasterProc = new cmr
      .CreateNegativeImpactMasterProc(
      caseMgmtParams,
    );
  }
}
