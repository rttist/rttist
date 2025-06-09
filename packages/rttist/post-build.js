const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

// Create package.json in the ESM output directory
fs.writeFileSync(path.join(__dirname, "dist/esm/package.json"), '{\n  "type": "module"\n}', { encoding: "utf-8" });
console.log("dist/esm/package.json created.");

// Generate TS definition files
const options = {
	declaration: true,
	emitDeclarationOnly: true,
	outDir: path.join(__dirname, "dist"),
};

const host = ts.createCompilerHost(options);
const program = ts.createProgram([path.join(__dirname, "src", "index.ts")], options, host);
program.emit();
console.log(".d.ts files generated.");

// // Copy assets
// const ASSETS_DIR = path.join(__dirname, "assets");
//
// // Make sure assets folder exists
// try {
// 	fs.mkdirSync(path.join(__dirname, "dist", "assets"));
// } catch (e) {}
//
// for (let file of fs.readdirSync(ASSETS_DIR)) {
// 	fs.copyFileSync(path.join(ASSETS_DIR, file), path.join(__dirname, "dist", "assets", file));
// }
//
// console.log("Assets copied.");
