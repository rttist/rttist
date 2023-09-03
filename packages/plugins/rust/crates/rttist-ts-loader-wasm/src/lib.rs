use std::fs;
use wasm_bindgen::prelude::*;
use rttist_swc_transformer::types::{TransformerContext, PackageInfo as TransformerPackageInfo};

#[wasm_bindgen(skip_typescript)]
pub struct PackageInfo {
    name: String,
    root_dir: String,
}

#[wasm_bindgen]
impl PackageInfo {
    #[wasm_bindgen(constructor)]
    pub fn new(name: String, root_dir: String) -> PackageInfo {
        PackageInfo {
            name,
            root_dir
        }
    }

    #[wasm_bindgen(getter)]
    pub fn name(&self) -> String {
        self.name.as_str().to_string()
    }

    #[wasm_bindgen(getter)]
    pub fn root_dir(&self) -> String {
        self.root_dir.as_str().to_string()
    }
}

#[wasm_bindgen(typescript_custom_section)]
const INTERFACE_DEFINITIONS: &'static str = r#"
/**
 * Object that contains information about the package(/project) being transformed.
 */
export class PackageInfo {
    /**
    * @param {string} name
    * @param {string} rootDir
    */
    constructor(name: string, rootDir: string);
}

/**
 * Transforms the code to be compatible with the RTTIST reflection.
 * @param code
 * @param path
 * @param packageInfo
 */
export function transform(code: string, path: string, packageInfo: PackageInfo): string;

/**
 * Loads a file from the file system and returns code compatible with the RTTIST reflection.
 * @description This function is available only in WASI.
 * @param path
 * @param packageInfo
 */
export function load(path: string, packageInfo: PackageInfo): string;
"#;

#[wasm_bindgen(js_name = "transform", skip_typescript)]
pub fn transform(source_code: String, path: String, package_info: PackageInfo) -> Result<String, JsValue> {
    let res = rttist_swc_transformer::transform(
        path,
        source_code,
        TransformerContext::new(TransformerPackageInfo::new(package_info.name, package_info.root_dir)),
    );
    return Ok(res);
}

// This will not work in WASM, because WASM has no access to FS; it can work only in WASI
#[wasm_bindgen(js_name = "load", skip_typescript)]
pub fn load(path: String, package_info: PackageInfo) -> Result<String, JsValue> {
    return match fs::read_to_string(path.clone()) {
        Ok(code) => Ok(rttist_swc_transformer::transform(
            path,
            code,
            TransformerContext::new(TransformerPackageInfo::new(package_info.name, package_info.root_dir)),
        )),
        Err(err) => Err(JsValue::from_str(format!("Unable to load file '{}'.\n{}", path, err.to_string()).as_str()))
    };
}