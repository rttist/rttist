pub struct ModuleIdentifier {
	pub id: String,
}

pub fn generate_module_id(file_path: String) -> ModuleIdentifier {
	let mut end = file_path.len();

	if file_path.ends_with(".ts") || file_path.ends_with(".js") {
		end = file_path.len() - 3;
	} else if file_path.ends_with(".tsx") || file_path.ends_with(".jsx") || file_path.ends_with(".cjs") || file_path.ends_with(".mjs") {
		end = file_path.len() - 4;
	}

	ModuleIdentifier {
		id: format!("@{}", &file_path[16..end]) // TODO: Implement properly
	}
}