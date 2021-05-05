import fs from "fs";
import path from "path";
import { RegisterOptions } from "ts-node";

const tsNodeRegisterOptions: RegisterOptions = {
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
    target: "es6",
  },
};

require("ts-node").register(tsNodeRegisterOptions);

const themeIndex = process.argv[2];
const style = process.argv[3] ?? "./style.css";
if (!themeIndex)
  throw new Error("Argument 0 should be the path to the root of your theme");

const themeIndexPath = path.resolve(process.cwd(), themeIndex);

function generateTheme() {
  // required to get new versions when watching
  delete require.cache[require.resolve(themeIndexPath)];
  const { css } = require(themeIndexPath);
  if (!css)
    throw new Error(
      `css export missing from ${themeIndex}\n\nMake sure to add:\n\nexport { css } from "@tone-row/components";\n\nat the end of your file`
    );

  const stylePath = path.resolve(process.cwd(), style);
  fs.writeFileSync(stylePath, css(), "utf-8");
  console.log(`Generated ${style}`);
}

if (process.argv.includes("--watch")) {
  generateTheme();
  console.log("Watching config for changes 👀");
  fs.watch(themeIndexPath, { encoding: "utf-8" }, () => {
    try {
      generateTheme();
    } catch (e) {
      console.error(e);
    }
  });
} else {
  generateTheme();
}
