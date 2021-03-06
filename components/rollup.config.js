import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import typescript from "rollup-plugin-typescript2";
import packageJson from "./package.json";
import json from "@rollup/plugin-json";

export default [
  {
    input: "./src/index.tsx",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [peerDepsExternal(), resolve(), commonjs(), typescript()],
  },
  {
    input: "./src/generate.ts",
    output: [
      {
        banner: "#!/usr/bin/env node",
        file: packageJson.bin["generate-css"],
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [resolve({ preferBuiltins: true }), typescript(), json()],
  },
];
