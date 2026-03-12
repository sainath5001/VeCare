import fs from "fs";
import path from "path";

export const updateConfig = async (
  newConfig: unknown,
  abi: string,
  abiExportName: string = "ECO_SOL_ABI"
) => {
  const toWrite =
    `export const config = ` +
    JSON.stringify(newConfig, null, 2) +
    ";\n" +
    `export const ${abiExportName} = ` +
    JSON.stringify(abi, null, 2) +
    " as const;\n";

  fs.writeFileSync(path.join(__dirname, "config.ts"), toWrite);
};
