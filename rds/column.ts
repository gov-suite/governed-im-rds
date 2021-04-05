import type * as rdbmsCtx from "./context.ts";
import { govnImCore as gimc } from "./deps.ts";
import type * as sqty from "./sql-type.ts";
import type { Table, TableColumn } from "./table.ts";

export type ColumnName = string;
export type ColumnStoreValueSQL = string;
export type ColumnRetrieveValueSQL = string;
export type QualifiedColumnName = string;

export interface Column {
  readonly forSrc: sqty.AttrMapperSource;
  readonly forAttr: gimc.Attribute;
  readonly nullable: boolean;
  qualifiedName(ctx: rdbmsCtx.RdbmsEngineContext): QualifiedColumnName;
  name(ctx: rdbmsCtx.RdbmsEngineContext): ColumnName;
  sqlTypes(ctx: rdbmsCtx.RdbmsEngineContext): sqty.ContextualSqlTypes;
  retrieveValueSQL?(
    ctx: rdbmsCtx.RdbmsSqlQueryContext,
    expr: ColumnRetrieveValueSQL,
  ): ColumnRetrieveValueSQL;
}

export interface PersistentColumn extends Column {
  readonly primaryKey: boolean;
  references?: TableColumn;
  storeValueSQL?(
    ctx: rdbmsCtx.RdbmsEngineContext,
    av: gimc.AttributeValue,
  ): ColumnStoreValueSQL;
}

export interface TransientColumn extends gimc.Transient, Column {
}

abstract class AbstractPersisentColumn implements PersistentColumn {
  readonly nullable: boolean;

  constructor(
    ctx: rdbmsCtx.RdbmsEngineContext,
    readonly parent: Table,
    readonly sqlType: sqty.AttrSqlType,
  ) {
    this.nullable = !sqlType.forAttr.isRequired(ctx);
  }

  get primaryKey(): boolean {
    if (gimc.isAttribute(this.forSrc)) {
      return gimc.isIdentityManager(this.forSrc.parent)
        ? this.forSrc.parent.isIdentityAttr(this.forSrc)
        : false;
    } else {
      return gimc.isIdentityManager(this.forSrc.entity)
        ? this.forSrc.entity.isIdentityAttr(this.forSrc.attr)
        : false;
    }
  }

  get forSrc(): sqty.AttrMapperSource {
    return this.sqlType.forSrc;
  }

  get forAttr(): gimc.Attribute {
    return this.sqlType.forAttr;
  }

  qualifiedName(ctx: rdbmsCtx.RdbmsEngineContext): QualifiedColumnName {
    if (gimc.isAttribute(this.forSrc)) {
      return ctx.dialect.namingStrategy.qualifiedColumnName(
        { entity: this.forSrc.parent, attr: this.forAttr },
      );
    } else {
      return ctx.dialect.namingStrategy.qualifiedColumnName(this.forSrc);
    }
  }

  name(ctx: rdbmsCtx.RdbmsEngineContext): ColumnName {
    if (gimc.isAttribute(this.forSrc)) {
      return ctx.dialect.namingStrategy.tableColumnName(
        { entity: this.forSrc.parent, attr: this.forAttr },
      );
    } else {
      return ctx.dialect.namingStrategy.tableColumnName(this.forSrc);
    }
  }

  sqlTypes(ctx: rdbmsCtx.RdbmsEngineContext): sqty.ContextualSqlTypes {
    return this.sqlType.sqlTypes(ctx);
  }
}

export class AutoIdentityNativeColumn extends AbstractPersisentColumn {
}

export class NumericIdentityColumn extends AbstractPersisentColumn {
}

export class TextIdentityColumn extends AbstractPersisentColumn {
}

export class TextColumn extends AbstractPersisentColumn {
}

export class PostgreSqlEncryptedTextColumn extends TextColumn {
  storeValueSQL(
    ctx: rdbmsCtx.RdbmsEngineContext,
    av: gimc.AttributeValue,
  ): ColumnStoreValueSQL {
    // TODO add check to make sure ctx is PostgreSQL Engine
    return `crypt('${av.attrValue}', gen_salt('bf'))`;
  }
}

export class UuidColumn extends AbstractPersisentColumn {
}

export class DateColumn extends AbstractPersisentColumn {
}

export class DateTimeColumn extends AbstractPersisentColumn {
}

export class IntegerColumn extends AbstractPersisentColumn {
}

export class JsonColumn extends AbstractPersisentColumn {
}

export class BooleanColumn extends AbstractPersisentColumn {
}

export class JsonbColumn extends AbstractPersisentColumn {
}

export class SelfReferenceColumn extends AbstractPersisentColumn {
}

export class RelationshipColumn extends AbstractPersisentColumn {
}

abstract class AbstractTransientColumn implements TransientColumn {
  readonly isTransient = true;
  readonly nullable: boolean;

  constructor(
    ctx: rdbmsCtx.RdbmsEngineContext,
    readonly parent: gimc.TransientEntity,
    readonly sqlType: sqty.AttrSqlType,
  ) {
    this.nullable = !sqlType.forAttr.isRequired(ctx);
  }

  get forSrc(): sqty.AttrMapperSource {
    return this.sqlType.forSrc;
  }

  get forAttr(): gimc.Attribute {
    return this.sqlType.forAttr;
  }

  qualifiedName(ctx: rdbmsCtx.RdbmsEngineContext): QualifiedColumnName {
    if (gimc.isAttribute(this.forSrc)) {
      return ctx.dialect.namingStrategy.qualifiedColumnName(
        { entity: this.forSrc.parent, attr: this.forAttr },
      );
    } else {
      return ctx.dialect.namingStrategy.qualifiedColumnName(this.forSrc);
    }
  }

  name(ctx: rdbmsCtx.RdbmsEngineContext): ColumnName {
    if (gimc.isAttribute(this.forSrc)) {
      return ctx.dialect.namingStrategy.tableColumnName(
        { entity: this.forSrc.parent, attr: this.forAttr },
      );
    } else {
      return ctx.dialect.namingStrategy.tableColumnName(this.forSrc);
    }
  }

  sqlTypes(ctx: rdbmsCtx.RdbmsEngineContext): sqty.ContextualSqlTypes {
    return this.sqlType.sqlTypes(ctx);
  }
}

export class AutoIdentityNativeTransientColumn extends AbstractTransientColumn {
}

export class NumericIdentityTransientColumn extends AbstractTransientColumn {
}

export class TextIdentityTransientColumn extends AbstractTransientColumn {
}

export class TextTransientColumn extends AbstractTransientColumn {
}

export class PostgreSqlEncryptedTextTransientColumn
  extends TextTransientColumn {
  retrieveValueSQL(
    ctx: rdbmsCtx.RdbmsSqlQueryContext,
    expr: ColumnRetrieveValueSQL,
  ): ColumnRetrieveValueSQL {
    // TODO add check to make sure ctx is PostgreSQL Engine and wrap whatever is required
    return expr;
  }
}

export class UuidTransientColumn extends AbstractTransientColumn {
}

export class DateTransientColumn extends AbstractTransientColumn {
}

export class DateTimeTransientColumn extends AbstractTransientColumn {
}

export class IntegerTransientColumn extends AbstractTransientColumn {
}

export class BooleanTransientColumn extends AbstractTransientColumn {
}

export class JsonTransientColumn extends AbstractTransientColumn {
}

export class JsonbTransientColumn extends AbstractTransientColumn {
}

export class SelfReferenceTransientColumn extends AbstractTransientColumn {
}

export class RelationshipTransientColumn extends AbstractTransientColumn {
}
