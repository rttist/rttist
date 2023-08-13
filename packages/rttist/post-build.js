const fs = require("fs");
const path = require("path");
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
