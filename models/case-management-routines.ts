import * as rds from "../rds/mod.ts";
import * as rdsTyp from "../typical/mod.ts";
import type * as cm from "./case-management.ts";
import { govnImCore as gimc } from "./deps.ts";

export class CreateIssueDescriptionMasterProc
  extends rdsTyp.TypicalStoredRoutineEntity
  implements rds.StoredProcedureCodeSupplier<CreateIssueDescriptionMasterProc> {
  readonly issueName: gimc.Text;
  readonly requestType: gimc.Integer;
  readonly issueDescriptionMasterId:
    & gimc.UuidText
    & rds.StoredRoutineArgMutabilitySupplier;

  constructor(
    readonly caseManagementFnParams: cm.CaseManagementRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("usp_create_issue_description_master"),
      caseManagementFnParams.storedProcParams,
    );
    const person = this.caseManagementFnParams.personFactory.person;
    const issueDescriptionMaster =
      this.caseManagementFnParams.caseManagementFactory.issueDescriptionMaster;

    this.issueName = issueDescriptionMaster.issueName.derive(
      this,
      { name: "title" },
    ) as gimc.Text;

    this.requestType = issueDescriptionMaster.requestType.derive(
      this,
      { name: "request_type" },
    ) as gimc.Integer;

    this.issueDescriptionMasterId = this.uuidText(
      "issue_description_master_id",
    ) as gimc.UuidText & rds.StoredRoutineArgMutabilitySupplier;

    this.issueDescriptionMasterId.storedRoutineArgMutability =
      rds.StoredRoutineArgMutability.InOut;

    this.insertAttrs(this.issueDescriptionMasterId);
    this.argAttrs?.push(
      this.issueName,
      this.requestType,
      this.issueDescriptionMasterId,
    );
  }

  storedProcedureFunctionWrapper(): rds.StoredProcedureFunctionWrapper {
    return {
      wrapperStoredFunctionName: this.name.inflect() + "_wf",
    };
  }

  storedProcedureCode(
    ctx: rds.RdbmsEngineContext,
    fn: rds.StoredProcedure<CreateIssueDescriptionMasterProc>,
  ): rds.StoredRoutineBodyCode | rds.StoredRoutineCode {
    return {
      isStoredRoutineBodyCode: true,
      persistAsName: "usp-create-issue-description-master",
      bodyCode: rds.interpolateEntityAttrNamesInSQL(ctx, {
        sql: `    
        DECLARE 
        BEGIN 
        IF EXISTS 
        ( 
                SELECT 1 
                FROM   {issueDescriptionMaster} 
                WHERE  {issueDescriptionMaster.issueName} = title 
                AND    {issueDescriptionMaster.requestType} = request_type ) THEN 
          issue_description_master_id = 
        ( 
                SELECT {issueDescriptionMaster.identity} 
                FROM   {issueDescriptionMaster}  
                WHERE  {issueDescriptionMaster.issueName}  = title 
                AND    {issueDescriptionMaster.requestType} = request_type ); 
        ELSE 
         INSERT INTO {issueDescriptionMaster}   
                    ( 
                      {issueDescriptionMaster:issueName}, 
                      {issueDescriptionMaster:requestType}
                    ) 
                    VALUES 
                    ( 
                                title, 
                                request_type 
                    ) 
          RETURNING {issueDescriptionMaster:identity} INTO issue_description_master_id; 
        
      END IF; 
      END
       ;`,
        with: {
          self: this,
          issueDescriptionMaster:
            this.caseManagementFnParams.caseManagementFactory
              .issueDescriptionMaster,
        },
        unindentBlock: true,
      }),
    };
  }
}

export class CreateNegativeImpactMasterProc
  extends rdsTyp.TypicalStoredRoutineEntity
  implements rds.StoredProcedureCodeSupplier<CreateNegativeImpactMasterProc> {
  readonly title: gimc.Text;
  readonly issueImpactMaster:
    & gimc.UuidText
    & rds.StoredRoutineArgMutabilitySupplier;

  constructor(
    readonly caseManagementFnParams: cm.CaseManagementRelatedInfoModelParams,
  ) {
    super(
      gimc.entityName("usp_create_negative_impact_master"),
      caseManagementFnParams.storedProcParams,
    );
    const person = this.caseManagementFnParams.personFactory.person;
    const issueImpactMaster =
      this.caseManagementFnParams.caseManagementFactory.issueImpactMaster;
    this.title = issueImpactMaster.valueAttr.derive(
      this,
      { name: "title" },
    ) as gimc.Text;

    this.issueImpactMaster = this.uuidText(
      "impact_severity_id",
    ) as gimc.UuidText & rds.StoredRoutineArgMutabilitySupplier;

    this.issueImpactMaster.storedRoutineArgMutability =
      rds.StoredRoutineArgMutability.InOut;

    this.insertAttrs(this.issueImpactMaster);

    this.argAttrs?.push(
      this.title,
      this.issueImpactMaster,
    );
  }

  storedProcedureFunctionWrapper(): rds.StoredProcedureFunctionWrapper {
    return {
      wrapperStoredFunctionName: this.name.inflect() + "_wf",
    };
  }

  storedProcedureCode(
    ctx: rds.RdbmsEngineContext,
    fn: rds.StoredProcedure<CreateNegativeImpactMasterProc>,
  ): rds.StoredRoutineBodyCode | rds.StoredRoutineCode {
    return {
      isStoredRoutineBodyCode: true,
      persistAsName: "usp-create-negative-impact-master",
      bodyCode: rds.interpolateEntityAttrNamesInSQL(ctx, {
        sql: `
        DECLARE 
       BEGIN 
        IF EXISTS 
          ( 
                SELECT 1 
                FROM   {issueImpactMaster} 
                WHERE   {issueImpactMaster.value} = title ) THEN 
          impact_severity_id = 
          ( 
                SELECT {issueImpactMaster.identity} 
                FROM   {issueImpactMaster}  
                WHERE  {issueImpactMaster.value}  = title ); 
        ELSE 
          INSERT INTO {issueImpactMaster}  
                      ( 
                                  {issueImpactMaster:party}  , 
                                  {issueImpactMaster:code} , 
                                  {issueImpactMaster:value} , 
                                  {issueImpactMaster:recordStatus}
                      ) 
                      VALUES 
                      ( 
                      ( 
                            SELECT {party.identity}  
                            FROM   {party} 
                            WHERE  {party.partyName}  = 'SYSTEM' 
                      ) 
                      , 
                      title, 
                      title, 
                      1 
                      ) 
          returning  {issueImpactMaster:identity} INTO  impact_severity_id; 
        END IF; 
      END
       `,
        with: {
          self: this,
          issueImpactMaster: this.caseManagementFnParams.caseManagementFactory
            .issueImpactMaster,
          party: this.caseManagementFnParams.partyFactory.party,
        },
        unindentBlock: true,
      }),
    };
  }
}
