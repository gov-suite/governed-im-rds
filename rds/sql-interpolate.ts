import type * as ctx from "./context.ts";
import {
  govnImCore as gimc,
  textInflect as infl,
  textInterpolate as ti,
  textWhitespace as tw,
  valueMgr as vm,
} from "./deps.ts";
import type * as dia from "./dialect.ts";
import type * as st from "./sql-type.ts";
import type * as tbl from "./table.ts";

function entityAttrFetcher(
  params: ti.InterpolatePropFetcherParams,
): ti.InterpolatePropFetcherResult {
  const name = params.findExpr;
  if (gimc.isInformationModelStructure(params.lookInObj)) {
    for (const e of params.lookInObj.entities) {
      const entityName = e.name;
      if (
        entityName.singular.inflect() == name ||
        entityName.plural.inflect() == name ||
        infl.toCamelCase(entityName.singular) == name ||
        infl.toCamelCase(entityName.plural) == name
      ) {
        return { params: params, foundExpr: true, foundObj: e };
      }
    }
  }
  if (gimc.isEntity(params.lookInObj)) {
    for (const a of params.lookInObj.attrs) {
      const attrName = a.name;
      if (
        infl.toCamelCase(attrName.objectFieldName) == name ||
        attrName.relationalColumnName.inflect() == name
      ) {
        return { params: params, foundExpr: true, foundObj: a };
      }
    }
  }
  if (name in params.lookInObj) {
    return {
      params: params,
      foundExpr: true,
      foundObj: params.lookInObj[name],
    };
  }
  return { params: params, foundExpr: false, foundObj: undefined };
}

export interface InterpolateWithEntities {
  [k: string]: gimc.Entity;
}

export type InterpolateEntityAttrNamesInSqlWith =
  | InterpolateWithEntities
  // deno-lint-ignore ban-types
  | object[]
  // deno-lint-ignore ban-types
  | object;

export interface InterpolateEntityAttrNamesInSqlParams {
  readonly sql: string;
  readonly with: InterpolateEntityAttrNamesInSqlWith;
  readonly emitAsSingleLine?: boolean;
  readonly unindentBlock?: boolean;
  readonly emitAttrType?: (
    a: gimc.Attribute,
    st: st.AttrSqlType,
    ipfr: ti.InterpolatePropFetcherResult,
  ) => string;
}

const interpolateQualifiedColName = ".";
const interpolateColumnName = ":";

const interpolationOptions: ti.InterpolationExprOptions = {
  bracketPrefixes: ["&"],
  openBracket: "{",
  pathDelims: [interpolateQualifiedColName, interpolateColumnName],
  closeBracket: "}",
};

export function interpolateEntityAttrNamesInSQL(
  ctx: ctx.RdbmsEngineContext,
  params: InterpolateEntityAttrNamesInSqlParams,
): string {
  const results = ti.interpolate(
    params.sql,
    ti.interpolationPropSupplier(
      params.with,
      interpolationOptions,
      entityAttrFetcher,
      [
        {
          prefixedBracket: false,
          handler: (ipfr: ti.InterpolatePropFetcherResult): string => {
            const guessName = ipfr.foundObj
              ? ctx.dialect.namingStrategy.guessName(
                {
                  obj: ipfr.foundObj,
                  includeEntityNameWithAttrName:
                    ipfr.params.parentDelim == interpolateQualifiedColName,
                },
              )
              : undefined;
            return guessName ? guessName : `{${ipfr.params.findExpr}?}`;
          },
        },
        {
          prefixedBracket: true,
          bracketPrefixes: ["&"],
          handler: (ipfr: ti.InterpolatePropFetcherResult): string => {
            if (gimc.isAttribute(ipfr.foundObj)) {
              const foundAttr = ipfr.foundObj;
              const sqlType = ctx.dialect.sqlType(ctx, foundAttr);
              if (sqlType) {
                if (params.emitAttrType) {
                  return params.emitAttrType(foundAttr, sqlType, ipfr);
                }
                const emitSqlType = vm.resolveTextValue(
                  ctx,
                  sqlType.sqlTypes(ctx).fKRefDDL,
                );
                if (ipfr.params.parentDelim == ":") {
                  const colName = ctx.dialect.namingStrategy.tableColumnName(
                    { entity: foundAttr.parent, attr: foundAttr },
                  );
                  return `${colName} ${emitSqlType}`;
                } else {
                  return emitSqlType;
                }
              } else {
                return `{${ipfr.params.findExpr}&??}`;
              }
            } else {
              return `{${ipfr.params.findExpr}&?}`;
            }
          },
        },
      ],
    ),
    interpolationOptions,
  );
  if (results && params.unindentBlock) {
    tw.unindentWhitespace(results);
  }
  return params.emitAsSingleLine ? tw.singleLineTrim(results) : results;
}

// used for passing in to Attribute.value() when value should be literal SQL
export function interpolatedLiteralSQL(
  params: InterpolateEntityAttrNamesInSqlParams,
): dia.PrepareValueSQL {
  return (
    rsCtx: ctx.RdbmsSqlValueContext,
    tc: tbl.TableColumn,
    av: gimc.AttributeValue,
  ): string => {
    return interpolateEntityAttrNamesInSQL(rsCtx, params);
  };
}
