import type { ColumnName, QualifiedColumnName } from "./column.ts";
import type { RdbmsEngineContext, RdbmsModelContext } from "./context.ts";
import type {
  artfPersist as ap,
  govnImCore as gimc,
  textInflect as infl,
  valueMgr as vm,
} from "./deps.ts";
import { safety } from "./deps.ts";
import type { RdbmsModelStruct } from "./model.ts";
import type {
  StoredProcedureFunctionWrapper,
  StoredRoutineCode,
  StoredRoutineName,
} from "./routine.ts";
import type { SqlStatement } from "./statement.ts";
import type { TableName } from "./table.ts";
import type { TypeDefnName } from "./type-defn.ts";
import type {
  CreateViewStatement,
  ViewBodySqlQuery,
  ViewName,
} from "./view.ts";

export interface ArtifactPersistenceNamingStrategy {
  modelPrimaryArtifactName(
    ctx: RdbmsModelContext,
    artifact: ap.TextArtifact,
  ): string;
  viewArtifactName(
    ctx: RdbmsModelContext,
    view: ViewBodySqlQuery | CreateViewStatement,
    artifact: ap.TextArtifact,
  ): string;
  storedProcedureArtifactName(
    ctx: RdbmsModelContext,
    routine: StoredRoutineCode,
    artifact: ap.TextArtifact,
  ): string;
  storedFunctionArtifactName(
    ctx: RdbmsModelContext,
    routine: StoredRoutineCode,
    artifact: ap.TextArtifact,
  ): string;
  typeDefnArtifactName(
    ctx: RdbmsModelContext,
    typeDefn: SqlStatement,
    artifact: ap.TextArtifact,
  ): string;
}

export interface ObjectDefnNamingStrategy {
  tableDefnName(ctx: RdbmsEngineContext, entity: gimc.Entity): string;
  viewDefnName(ctx: RdbmsEngineContext, entity: gimc.Entity): string;
  storedProcDefnName(ctx: RdbmsEngineContext, entity: gimc.Entity): string;
  storedProcWrapperFuncDefnName(
    ctx: RdbmsEngineContext,
    entity: gimc.Entity,
    spfw: StoredProcedureFunctionWrapper,
  ): string;
  storedFuncDefnName(ctx: RdbmsEngineContext, entity: gimc.Entity): string;
  typeDefnName(ctx: RdbmsEngineContext, entity: gimc.Entity): string;
}

export type SchemaName = vm.TextValue;

export interface GuessNameParams {
  readonly obj: gimc.Entity | gimc.Attribute;
  readonly includeEntityNameWithAttrName?: boolean;
}

export interface NamingStrategy {
  // implements https://github.com/ontop/ontop/wiki/Case-sensitivity-for-SQL-identifiers
  readonly isNamingStrategy: true;
  readonly strategyName: infl.InflectableValue;
  readonly strategyDescr: string;

  guessName(params: GuessNameParams): string | undefined;
  schemaName(entity: gimc.Entity): SchemaName;
  tableName(entity: gimc.Entity): TableName;
  viewName(entity: gimc.Entity): ViewName;
  typeDefnName(entity: gimc.Entity): TypeDefnName;
  storedFunctionName(entity: gimc.Entity): StoredRoutineName;
  storedProcedureName(entity: gimc.Entity): StoredRoutineName;
  tableColumnName(ref: gimc.Reference<gimc.Entity>): ColumnName;
  columnName(name: string): ColumnName;
  qualifiedColumnName(ref: gimc.Reference<gimc.Entity>): QualifiedColumnName;
  objectDefnNames(): ObjectDefnNamingStrategy;
  artifactNames(
    rdbmsModel: RdbmsModelStruct,
  ): ArtifactPersistenceNamingStrategy;
}

export enum ObjectDefnNameType {
  ObjectNameOnly,
  NamespaceQualifiedObjectName,
}

export interface NamingStrategyConstructor {
  new (odnt?: ObjectDefnNameType): NamingStrategy;
}

export const isNamingStrategy = safety.typeGuard<NamingStrategy>(
  "isNamingStrategy",
);
