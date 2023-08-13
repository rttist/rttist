const fs = require("fs");
const path = require("path");
fs.writeFileSync(path.join(__dirname, "dist/esm/package.json"), '{\n  "type": "module"\n}', { encoding: "utf-8" });
