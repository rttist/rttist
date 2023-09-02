const $fs = require("fs");

// Create `dist` folder if it doesn't exist
$fs.mkdirSync("dist", { recursive: true });

// Copy WASM file
$fs.copyFileSync("../../target/wasm32-wasi/release/swc_plugin_rttist.wasm", "./dist/swc_plugin_rttist.wasm");
