/**
 * @fileoverview All rules
 * @author Arpan Laha
 */

import { rule as tsConfigAllowSyntheticDefaultImports } from "./ts-config-allowsyntheticdefaultimports";
import { rule as tsConfigDeclaration } from "./ts-config-declaration";
import { rule as tsConfigEsModuleInterop } from "./ts-config-esmoduleinterop";
import { rule as tsConfigForceConsistentCasingInFileNames } from "./ts-config-forceconsistentcasinginfilenames";
import { rule as tsConfigImportHelpers } from "./ts-config-importhelpers";
import { rule as tsConfigStrict } from "./ts-config-strict";

export const rules = {
  "ts-config-allowsyntheticdefaultimports": tsConfigAllowSyntheticDefaultImports,
  "ts-config-declaration": tsConfigDeclaration,
  "ts-config-esmoduleinterop": tsConfigEsModuleInterop,
  "ts-config-forceconsistentcasinginfilenames": tsConfigForceConsistentCasingInFileNames,
  "ts-config-importhelpers": tsConfigImportHelpers,
  "ts-config-strict": tsConfigStrict
};
