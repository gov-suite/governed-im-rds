import type * as col from "./column.ts";
import * as eagsCtx from "./context.ts";
import { govnImCore as gimc, specModule as sm } from "./deps.ts";
import type * as dia from "./dialect.ts";
import type { ArtifactPersistenceNamingStrategy } from "./naming.ts";
import * as sr from "./routine.ts";
import {
  DefaultTable,
  Table,
  TableColumn,
  TableColumnRelationship,
} from "./table.ts";
import * as td from "./type-defn.ts";
import * as v from "./view.ts";

export class RdbmsModelStruct {
  readonly imStructure: gimc.InformationModelStructure;
  readonly tables: Table[] = [];
  readonly tableByName = new Map<string, Table>();
  // deno-lint-ignore no-explicit-any
  readonly views: v.View<any>[] = [];
  // deno-lint-ignore no-explicit-any
  readonly functions: sr.StoredFunction<any>[] = [];
  // deno-lint-ignore no-explicit-any
  readonly procedures: sr.StoredProcedure<any>[] = [];
  // deno-lint-ignore no-explicit-any
  readonly typeDefns: td.TypeDefn<any>[] = [];
  readonly columnByQualifiedName = new Map<string, col.PersistentColumn>();
  readonly relationships: TableColumnRelationship[] = [];
  readonly structErrors: string[] = [];
  readonly artifactsNamingStrategy: ArtifactPersistenceNamingStrategy;

  constructor(
    readonly spec: sm.Specification<gimc.InformationModel>,
    readonly dialect: dia.Dialect,
  ) {
    this.spec = spec;
    this.imStructure = spec.target!.structure;

    const reCtx = eagsCtx.rdbmsCtxFactory.rdbmsEngineContext(spec, dialect);
    for (const entity of this.imStructure.entities) {
      if (gimc.isTransientEntity(entity) && v.isSqlViewQuerySupplier(entity)) {
        this.registerView(reCtx, entity);
      }

      if (sr.isStoredRoutineEntity(entity)) {
        if (sr.isStoredFunctionCodeSupplier(entity)) {
          this.registerStoredFunction(reCtx, entity);
        }
        if (sr.isStoredProcedureCodeSupplier(entity)) {
          this.registerStoredProcedure(reCtx, entity);
        }
      }

      if (gimc.isTransientEntity(entity) && td.isTypeDefnSqlSupplier(entity)) {
        this.registerTypeDefn(reCtx, entity);
      }

      if (gimc.isPersistentEntity(entity)) {
        this.registerTable(reCtx, entity);
      }
    }

    for (const edge of this.imStructure.edges) {
      try {
        this.relationships.push({
          source: this.tableColumn(edge.source),
          references: this.tableColumn(edge.ref),
        });
      } catch (e) {
        this.structErrors.push(
          `Unable to create edge ${edge.source.entity.name.singular.inflect()}.${edge.source.attr.name.relationalColumnName.inflect()} -> ${edge.ref.entity.name.singular.inflect()}.${edge.ref.attr.name.relationalColumnName.inflect()}\n`,
        );
      }
    }

    this.artifactsNamingStrategy = dialect.namingStrategy.artifactNames(this);
  }

  protected registerTable(
    reCtx: eagsCtx.RdbmsEngineContext,
    entity: gimc.PersistentEntity,
  ): void {
    const table = new DefaultTable(
      reCtx,
      entity,
      (table: Table): col.PersistentColumn[] => {
        const results: col.PersistentColumn[] = [];
        for (const a of entity.attrs) {
          const sqlType = this.dialect.sqlType(reCtx, a);
          if (!sqlType) {
            this.structErrors.push(
              `[SSE_0001] Unable to find SQL type for ${entity.name.inflect()}.${a.name.relationalColumnName.inflect()}`,
            );
            continue;
          }
          if (!sqlType.persistentColumn) {
            this.structErrors.push(
              `[SSE_0002] sqlType ${sqlType} does not support the creation of persistent columns`,
            );
            continue;
          }
          const column = sqlType.persistentColumn(reCtx, table);
          results.push(column);
          this.columnByQualifiedName.set(
            column.qualifiedName(reCtx),
            column,
          );
        }
        return results;
      },
    );
    for (const column of table.columns) {
      if (column.forAttr.isRelationship) {
        const rel = column.forAttr as gimc.Relationship<gimc.Entity>;
        column.references = this.tableColumn(rel.reference);
      }
    }

    this.tables.push(table);
    this.tableByName.set(table.name(reCtx), table);
    if (table.structErrors.length > 0) {
      this.structErrors.push(...table.structErrors);
    }
  }

  protected registerView(
    reCtx: eagsCtx.RdbmsEngineContext,
    entity: gimc.TransientEntity,
  ): void {
    const columns: col.TransientColumn[] = [];
    entity.attrs.map((e) => reCtx.dialect.sqlType(reCtx, e))
      .filter((ast) => ast && ast.transientColumn)
      .forEach((ast) => columns.push(ast!.transientColumn!(reCtx, entity)));
    this.views.push(new v.DefaultView(reCtx, entity, columns));
  }

  protected registerTypeDefn(
    reCtx: eagsCtx.RdbmsEngineContext,
    entity: gimc.TransientEntity,
  ): void {
    const columns: col.TransientColumn[] = [];
    entity.attrs.map((e) => reCtx.dialect.sqlType(reCtx, e))
      .filter((ast) => ast && ast.transientColumn)
      .forEach((ast) => columns.push(ast!.transientColumn!(reCtx, entity)));
    this.typeDefns.push(new td.DefaultTypeDefn(reCtx, entity, columns));
  }

  protected registerStoredFunction(
    reCtx: eagsCtx.RdbmsEngineContext,
    entity: sr.StoredRoutineEntity,
  ): void {
    const columns: col.TransientColumn[] = [];
    const args: sr.StoredRoutineArg[] = [];
    entity.attrs.map((e) => reCtx.dialect.sqlType(reCtx, e))
      .filter((ast) => ast && ast.transientColumn)
      .forEach((ast) => columns.push(ast!.transientColumn!(reCtx, entity)));
    if (entity.argAttrs) {
      entity.argAttrs.map((e) => reCtx.dialect.sqlType(reCtx, e))
        .filter((ast) => ast && ast.transientColumn)
        .forEach((ast) => {
          const sqt = ast!.sqlTypes(reCtx).storedFuncIn;
          args.push(
            {
              argName: ast!.forAttr.name.relationalColumnName.inflect(),
              argType: sqt,
              argMutability:
                sr.isStoredRoutineArgMutabilitySupplier(ast!.forAttr)
                  ? ast!.forAttr.storedRoutineArgMutability
                  : sr.StoredRoutineArgMutability.InOnly,
            },
          );
        });
    }
    this.functions.push(
      new sr.DefaultStoredFunction(
        reCtx,
        entity,
        columns,
        args.length > 0 ? args : undefined,
      ),
    );
  }

  protected registerStoredProcedure(
    reCtx: eagsCtx.RdbmsEngineContext,
    entity: sr.StoredRoutineEntity,
  ): void {
    const columns: col.TransientColumn[] = [];
    const args: sr.StoredRoutineArg[] = [];
    entity.attrs.map((e) => reCtx.dialect.sqlType(reCtx, e))
      .filter((ast) => ast && ast.transientColumn)
      .forEach((ast) => columns.push(ast!.transientColumn!(reCtx, entity)));
    if (entity.argAttrs) {
      entity.argAttrs.map((e) => reCtx.dialect.sqlType(reCtx, e))
        .filter((ast) => ast && ast.transientColumn)
        .forEach((ast) => {
          const sqt = ast!.sqlTypes(reCtx).storedProcIn;
          args.push(
            {
              argName: ast!.forAttr.name.relationalColumnName.inflect(),
              argType: sqt,
              argMutability:
                sr.isStoredRoutineArgMutabilitySupplier(ast!.forAttr)
                  ? ast!.forAttr.storedRoutineArgMutability
                  : sr.StoredRoutineArgMutability.InOnly,
            },
          );
        });
    }
    this.procedures.push(
      new sr.DefaultStoredProcedure(
        reCtx,
        entity,
        columns,
        args.length > 0 ? args : undefined,
      ),
    );
  }

  public tableName(entity: gimc.Entity): string {
    return this.dialect.namingStrategy.tableName(entity);
  }

  public tablePkColName(entity: gimc.Entity): string {
    const table = this.table(entity);
    return this.columnName(table!.primaryKey!.forAttr);
  }

  public columnName(attr: gimc.Attribute): string {
    return this.dialect.namingStrategy.tableColumnName(
      { entity: attr.parent, attr: attr },
    );
  }

  public table(entity: gimc.Entity): Table | undefined {
    const tableName = this.dialect.namingStrategy.tableName(entity);
    return this.tableByName.get(tableName);
  }

  public tableColumn(ref: gimc.Reference<gimc.Entity>): TableColumn {
    const ns = this.dialect.namingStrategy;
    const tableName = ns.tableName(ref.entity);
    const refTable = this.table(ref.entity);
    if (refTable) {
      const qualifiedColName = ns.qualifiedColumnName(ref);
      const refColumn = this.columnByQualifiedName.get(qualifiedColName);
      if (refColumn) {
        return {
          table: refTable,
          column: refColumn,
        };
      } else {
        throw new Error(
          `[RDBMS_0900] This should never happen: column ${qualifiedColName} was not found in RDBMS model.`,
        );
      }
    } else {
      throw new Error(
        `[RDBMS_0901] This should never happen: table ${tableName} was not found in RDBMS model.`,
      );
    }
  }
}
