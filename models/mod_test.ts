import * as tm from "./test-model.gim.ts";
import { testingAsserts as ta } from "./deps-test.ts";

Deno.test("TestModelStructure validation", () => {
  const model = new tm.TestModel();
  // TODO: validate contents of the model, not that it just parsed
  ta.assert(model);
});
