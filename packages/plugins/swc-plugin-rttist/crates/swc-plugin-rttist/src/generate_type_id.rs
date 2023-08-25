use crate::generate_module_id::ModuleIdentifier;
use swc_core::ecma::{
	ast,
	visit::{as_folder, FoldWith, VisitMut, VisitMutWith},
};

// pub fn generate_type_id(file_path: String, declaration: &ast::ClassDecl) -> String {
// 	"module id".to_string()
// }

pub struct TypeIdentifier {
	pub id: String,
}

pub trait IntoTypeIdentifier {
	fn into(self, module_identifier: &ModuleIdentifier) -> TypeIdentifier;
}

impl TypeIdentifier {
	pub fn new<A>(args: A, module_identifier: &ModuleIdentifier) -> TypeIdentifier
		where A: IntoTypeIdentifier
	{
		args.into(module_identifier)
	}
}

impl IntoTypeIdentifier for &ast::ClassDecl {
	fn into(self, module_identifier: &ModuleIdentifier) -> TypeIdentifier {
		TypeIdentifier {
			id: format!("{}:{}", module_identifier.id, self.ident.sym.to_string())
			// id: (module_identifier.id.to_string().push_str(":class") ).to_string(),
		}
	}
}

impl IntoTypeIdentifier for &ast::FnDecl {
	fn into(self, module_identifier: &ModuleIdentifier) -> TypeIdentifier {
		TypeIdentifier {
			id: format!("{}:{}", module_identifier.id, ":fnc")
		}
	}
}

impl IntoTypeIdentifier for &ast::TsType {
	fn into(self, module_identifier: &ModuleIdentifier) -> TypeIdentifier {
		if let Some(type_ref) = self.as_ts_type_ref() {
			return TypeIdentifier {
				// TODO: Use SyntaxScope to resolve source module
				id: format!("{}:{}", module_identifier.id, type_ref.type_name.as_ident().unwrap().sym.to_string())
				// id: module_identifier.id.to_string().push_str(":").push_str(type_ref.type_name.as_ident().unwrap().sym.to_string().as_str()).to_string(),
			}
		}
		// if let Some(keyword) = self.as_ts_keyword_type() {
		// 	return TypeIdentifier {
		// 		id: format!("::native:{}", module_identifier.id, keyword.kind.)
		// 		// id: module_identifier.id.to_string().push_str(":").push_str(type_ref.type_name.as_ident().unwrap().sym.to_string().as_str()).to_string(),
		// 	}
		// }

		TypeIdentifier {
			id: "::invalid::Invalid".to_string(),
		}
	}
}