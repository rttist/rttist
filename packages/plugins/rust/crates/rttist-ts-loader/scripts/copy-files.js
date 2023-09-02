const $fs = require("fs");

// Create `dist` folder if it doesn't exist
$fs.mkdirSync("dist", { recursive: true });

// Copy WASM file
$fs.copyFileSync("../../target/wasm32-unknown-unknown/release/rttist_ts_loader.wasm", "./dist/rttist_ts_loader.wasm");
