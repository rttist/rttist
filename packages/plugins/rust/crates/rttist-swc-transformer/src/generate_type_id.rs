use crate::generate_module_id::ModuleIdentifier;
use swc_core::ecma::ast;
use crate::utils::{keyword_kind_to_type_identifier, literal_to_type_identifier};

pub struct TypeIdentifier {
	pub id: String,
}

pub trait IntoTypeIdentifier {
	fn into(&self, module_identifier: &ModuleIdentifier) -> TypeIdentifier;
}

impl TypeIdentifier {
	pub fn new<A>(args: &A, module_identifier: &ModuleIdentifier) -> TypeIdentifier
		where A: IntoTypeIdentifier
	{
		args.into(module_identifier)
	}
}

impl IntoTypeIdentifier for ast::ClassDecl {
	fn into(&self, module_identifier: &ModuleIdentifier) -> TypeIdentifier {
		TypeIdentifier {
			id: format!("{}:{}", module_identifier.id, self.ident.sym.to_string())
		}
	}
}

impl IntoTypeIdentifier for ast::FnDecl {
	fn into(&self, module_identifier: &ModuleIdentifier) -> TypeIdentifier {
		TypeIdentifier {
			id: format!("{}:{}", module_identifier.id, self.ident.sym.to_string())
		}
	}
}

impl IntoTypeIdentifier for ast::TsType {
	fn into(&self, module_identifier: &ModuleIdentifier) -> TypeIdentifier {
		// TYPE REFERENCE
		if let Some(type_ref) = self.as_ts_type_ref() {
			return TypeIdentifier {
				// TODO: Use SyntaxScope to resolve source module
				id: format!("{}:{}", module_identifier.id, type_ref.type_name.as_ident().unwrap().sym.to_string())
			}
		}

		// KEYWORD
		if let Some(keyword) = self.as_ts_keyword_type() {
			return keyword_kind_to_type_identifier(keyword.kind)
		}

		// LITERAL TYPE
		if let Some(lit_type) = self.as_ts_lit_type() {
			return literal_to_type_identifier(&lit_type.lit)
		}

		TypeIdentifier {
			id: "::invalid::Invalid".to_string(),
		}
	}
}