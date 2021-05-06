import fs from "fs";
import path from "path";
import { RegisterOptions } from "ts-node";
import yargs from "yargs";
import pkg from "../package.json";
const chokidar = require("chokidar");

const argv = yargs(process.argv.slice(2))
  .version(pkg.version)
  .usage("Usage: $0 --input [filepath] --output [filepath] --watch [filepath]")
  .alias("input", "i")
  .describe("input", "Path to theme entrypoint, example 'src/theme.ts'")
  .alias("output", "o")
  .describe("output", "Path to generate stylesheet, example 'src/style.css'")
  .alias("watch", "w")
  .describe("watch", "Path to file or folder to watch for changes")
  .demandOption(["input", "output"]).argv;

let { input, output, watch } = argv as {
  input: string;
  output: string;
  watch?: string;
};

const tsNodeRegisterOptions: RegisterOptions = {
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
    target: "es6",
  },
};

require("ts-node").register(tsNodeRegisterOptions);

input = path.resolve(process.cwd(), input);
output = path.resolve(process.cwd(), output);
watch = watch ? path.resolve(process.cwd(), watch) : watch;

function generate(changedFile?: string) {
  // required to get new versions when watching
  delete require.cache[require.resolve(input)];
  if (changedFile) {
    console.log(`Deleting cache for ${changedFile}`);
    delete require.cache[require.resolve(changedFile)];
  }
  const { css } = require(input);

  if (!css)
    throw new Error(
      `css export missing from ${input}\n\nMake sure to add:\n\nexport { css } from "@tone-row/components";\n\nat the end of your file`
    );

  fs.writeFileSync(output, css(), "utf-8");
  console.log(`Generated ${output}`);
}

if (watch) {
  const watcher = chokidar.watch(watch, {
    ignored: /\.css/,
    persistent: true,
    usePolling: true,
  });
  watcher.on("change", (changedFile: string) => {
    generate(changedFile);
  });
  watcher.on("ready", () => {
    generate();
    console.log("Watching for changes 👀");
  });
} else {
  generate();
}
