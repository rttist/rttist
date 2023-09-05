use std::path::{Path, PathBuf, Component};
use swc_core::ecma::{
	ast,
};
use swc_core::common::{Span};
use swc_ecma_ast::{TsKeywordTypeKind, TsLit, TsLitType};
use crate::generate_module_id::ModuleIdentifier;
use crate::generate_type_id::{IntoTypeIdentifier, TypeIdentifier};

pub fn remove_extension(file_path: String) -> String {
    let mut end = file_path.len();

    if file_path.ends_with(".ts") || file_path.ends_with(".js") {
        end = file_path.len() - 3;
    } else if file_path.ends_with(".tsx") || file_path.ends_with(".jsx") || file_path.ends_with(".cjs") || file_path.ends_with(".mjs") {
        end = file_path.len() - 4;
    }

    return file_path.as_str()[..end].to_string();
}

pub fn normalize_path(file_path: String) -> String {
    return file_path.replace("\\", "/");
}

pub fn resolve_path(path: &Path) -> PathBuf {
    let mut components = path.components().peekable();
    let mut ret = if let Some(c @ Component::Prefix(..)) = components.peek().cloned() {
        components.next();
        PathBuf::from(c.as_os_str())
    } else {
        PathBuf::new()
    };

    for component in components {
        match component {
            Component::Prefix(..) => unreachable!(),
            Component::RootDir => {
                ret.push(component.as_os_str());
            }
            Component::CurDir => {}
            Component::ParentDir => {
                ret.pop();
            }
            Component::Normal(c) => {
                ret.push(c);
            }
        }
    }
    ret
}

pub trait DeclarationWithPrototype
	where Self : Sized + IntoTypeIdentifier
{
	fn get_type_identifier(&self, module_identifier: &ModuleIdentifier) -> TypeIdentifier {
		self.into(module_identifier)
	}

	fn get_identifier(&self) -> ast::Ident;
}

impl DeclarationWithPrototype for ast::ClassDecl {
	fn get_identifier(&self) -> ast::Ident {
		self.ident.clone()
	}
}

impl DeclarationWithPrototype for ast::FnDecl {
	fn get_identifier(&self) -> ast::Ident {
		self.ident.clone()
	}
}

const PROTOTYPE_TYPE_PROPERTY_NAME: &str = "[[type]]";

pub fn create_prototype_assign_typeid_statement<T>(declaration: &T, module_identifier: &ModuleIdentifier) -> ast::Stmt
	where T: DeclarationWithPrototype
{
	ast::Stmt::Expr(ast::ExprStmt {
		span: Span::default(),
		expr: Box::new(ast::Expr::Assign(ast::AssignExpr {
			span: Span::default(),
			op: ast::AssignOp::Assign,
			left: ast::PatOrExpr::Expr(Box::new(ast::Expr::Member(ast::MemberExpr {
				span: Span::default(),
				obj: Box::new(ast::Expr::Member(ast::MemberExpr {
					span: Span::default(),
					obj: Box::new(declaration.get_identifier().into()),
					prop: ast::MemberProp::Ident(ast::Ident::new("prototype".into(), Span::default())),
				})),
				prop: ast::MemberProp::Computed(ast::ComputedPropName {
					span: Span::default(),
					// expr: Box::new(MemberExpr {
					// 	span: Span::default(),
					// 	obj: Box::new(Ident {
					// 		span: Span::default(),
					// 		sym: METADATA_IMPORT_IDENTIFIER.into(),
					// 		optional: false,
					// 	}.into()),
					// 	prop: MemberProp::from(Ident::new("symbols".into(), Default::default())),
					// }.into()),
					expr: Box::new(ast::Expr::Lit(ast::Lit::Str(ast::Str {
						span: Span::default(),
						value: PROTOTYPE_TYPE_PROPERTY_NAME.into(),
						raw: None,
					}))),
				}),
			}))),
			right: Box::new(ast::Expr::from(ast::Str {
				span: Span::default(),
				value: declaration.get_type_identifier(&module_identifier).id.into(),
				raw: None,
			})),
		})),
	})
}

pub fn keyword_kind_to_type_identifier(kind: TsKeywordTypeKind) -> TypeIdentifier {
	return match kind {
		TsKeywordTypeKind::TsObjectKeyword => TypeIdentifier {
			id: "#object".to_string(),
		},
		TsKeywordTypeKind::TsAnyKeyword => TypeIdentifier {
			id: "#any".to_string(),
		},
		TsKeywordTypeKind::TsUnknownKeyword => TypeIdentifier {
			id: "#unknown".to_string(),
		},
		TsKeywordTypeKind::TsUndefinedKeyword => TypeIdentifier {
			id: "#undefined".to_string(),
		},
		TsKeywordTypeKind::TsNullKeyword => TypeIdentifier {
			id: "#null".to_string(),
		},
		TsKeywordTypeKind::TsVoidKeyword => TypeIdentifier {
			id: "#void".to_string(),
		},
		TsKeywordTypeKind::TsNeverKeyword => TypeIdentifier {
			id: "#never".to_string(),
		},
		TsKeywordTypeKind::TsNumberKeyword => TypeIdentifier {
			id: "#Number".to_string(),
		},
		TsKeywordTypeKind::TsBigIntKeyword => TypeIdentifier {
			id: "#BigInt".to_string(),
		},
		TsKeywordTypeKind::TsStringKeyword => TypeIdentifier {
			id: "#String".to_string(),
		},
		TsKeywordTypeKind::TsBooleanKeyword => TypeIdentifier {
			id: "#Boolean".to_string(),
		},
		TsKeywordTypeKind::TsSymbolKeyword => TypeIdentifier {
			id: "#Symbol".to_string(),
		},
		default => TypeIdentifier {
			id: "::invalid::Invalid".to_string(),
		},
	}
}

pub fn literal_to_type_identifier(lit: &TsLit) -> TypeIdentifier {
	return match lit {
		TsLit::Bool(bool) => TypeIdentifier {
			id: format!("#L({})", bool.value),
		},
		TsLit::Str(bool) => TypeIdentifier {
			id: format!("#L('{}')", bool.value),
		},
		TsLit::Number(bool) => TypeIdentifier {
			id: format!("#L({})", bool.value),
		},
		TsLit::BigInt(bool) => TypeIdentifier {
			id: format!("#L({}n)", bool.value),
		},
		// TsLit::Tpl(bool) => TypeIdentifier {
		// 	id: format!("#{}", bool.value),
		// },
		default => TypeIdentifier {
			id: "::invalid::Invalid".to_string(),
		},
	}
}