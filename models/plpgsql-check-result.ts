import {
  govnImCore as gimc,
  govnImTypical as gimTyp,
} from "./deps.ts";

export class PlPgSqlCheckResult extends gimTyp.TypicalPersistentEntity {
  readonly functionId: gimc.Text;
  readonly lineNo: gimc.Integer;
  readonly statement: gimc.Text;
  readonly sqlState: gimc.Text;
  readonly message: gimc.Text;
  readonly detail: gimc.Text;
  readonly hint: gimc.Text;
  readonly level: gimc.Text;
  readonly position: gimc.Text;
  readonly query: gimc.Text;
  readonly context: gimc.Text;

  constructor(
    params: gimTyp.TypicalInfoModelStructParams,
  ) {
    super(
      gimc.entityName("plpgsql_check_result;"),
      params.entityParams,
    );

    this.functionId = this.text("function_id", false);
    this.lineNo = this.integer("line_no", false);
    this.statement = this.text("statement", false);
    this.sqlState = this.text("sql_state", false);
    this.message = this.text("message", false);
    this.detail = this.text("detail", false);
    this.hint = this.text("hint", false);
    this.level = this.text("level", false);
    this.position = this.text("position", false);
    this.query = this.text("query", false);
    this.context = this.text("context", false);

    this.insertAttrs(
      this.functionId,
      this.lineNo,
      this.statement,
      this.sqlState,
      this.message,
      this.detail,
      this.hint,
      this.level,
      this.position,
      this.query,
      this.context,
    );
  }
}
export class PlPgSqlCheckFactory {
  readonly plPgSqlCheckResult: PlPgSqlCheckResult;
  constructor(params: gimTyp.TypicalInfoModelStructParams) {
    this.plPgSqlCheckResult = new PlPgSqlCheckResult(
      params,
    );
  }
}
