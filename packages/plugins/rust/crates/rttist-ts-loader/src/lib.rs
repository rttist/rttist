// use std::error::Error;
// use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};
use std::fs;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(typescript_custom_section)]
const INTERFACE_DEFINITIONS: &'static str = r#"
/**
 * Loads a file from the file system and returns code compatible with the RTTIST reflection.
 * @param path
 */
export function load(path: string): string;

/**
 * Transforms the code to be compatible with the RTTIST reflection.
 * @param code
 * @param path
 */
export function transform(code: string, path: string): string;
"#;

#[wasm_bindgen(js_name = "transform",skip_typescript)]
pub fn transform(source_code: String, path: String) -> Result<String, JsValue> {
	let res = rttist_swc_transformer::transform(path, source_code);
	return Ok(res);
}

#[wasm_bindgen(js_name = "load",skip_typescript)]
pub fn load(path: String) -> Result<String, JsValue> {
	// if let Ok(code) = fs::read_to_string(path.clone()) {
	// 	let res = transform(path, code);
	// 	return res;
	// }

	return match fs::read_to_string(path.clone()) {
		Ok(code) => Ok(rttist_swc_transformer::transform(path, code)),
		Err(err) => Err(JsValue::from_str(format!("Unable to load file '{}'.\n{}", path, err.to_string()).as_str()))
	};
}

// build_transform!(#[wasm_bindgen(js_name = "transform", typescript_type = "transform",skip_typescript)]);
// build_load!(#[wasm_bindgen(js_name = "load", typescript_type = "load",skip_typescript)]);