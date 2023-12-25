pub mod generate_module_id;
pub mod generate_type_id;
pub mod types;
pub mod type_ids;
mod utils;
mod syntax_type_checker;

use std::sync::Arc;
use swc_core::ecma::{
	ast,
	ast::EsVersion,
	visit::{as_folder, FoldWith, VisitMut, VisitMutWith},
};
use swc_ecma_utils::{StmtLike};
use swc_ecma_parser::{parse_file_as_program, Syntax, TsConfig};
use swc_core::common::{Span, FileName, source_map::SourceMap};
use swc::{Compiler};
use swc::config::{SourceMapsConfig};

use crate::generate_module_id::{ModuleIdentifier};
use crate::generate_type_id::{TypeIdentifier};
use crate::types::{TransformerContext};
use crate::utils::create_prototype_assign_typeid_statement;

const METADATA_IMPORT_IDENTIFIER: &str = "___metadataImport___";

pub struct TransformVisitor {
	module_id: ModuleIdentifier,
	add_import: bool,
	transformer_context: TransformerContext,
}

impl TransformVisitor {
	pub fn new(module_id: String, transformer_context: TransformerContext) -> TransformVisitor {
		TransformVisitor {
			module_id: ModuleIdentifier::for_file(module_id, &transformer_context),
			add_import: false,
			transformer_context,
		}
	}

	fn visit_mut_stmt_like<T>(&mut self, stmts: &mut Vec<T>)
		where
			Vec<T>: VisitMutWith<Self>,
			T: StmtLike + VisitMutWith<Self>,
	{
		stmts.visit_mut_children_with(self);

		let mut stmts_updated = Vec::with_capacity(stmts.len());

		for stmt in stmts.drain(..) {
			match stmt.try_into_stmt() {
				Err(item) => {
					stmts_updated.push(item);
				}
				Ok(stmt) => {
					let stmt_clone = &stmt;

					if let Some(decl) = stmt_clone.as_decl() {
						if let ast::Decl::Fn(fn_decl) = decl {
							let proto_statement = create_prototype_assign_typeid_statement(&*fn_decl, &self.module_id);
							stmts_updated.push(T::from_stmt(stmt));
							stmts_updated.push(T::from_stmt(proto_statement));
							continue;
						}
					}

					stmts_updated.push(T::from_stmt(stmt));
				}
			}
		}

		*stmts = stmts_updated;
	}
}

impl VisitMut for TransformVisitor {
	fn visit_mut_call_expr(&mut self, call_expression: &mut ast::CallExpr) {
		call_expression.visit_mut_children_with(self);

		// if let Some(type_args) = call_expression.type_args {
		if call_expression.type_args.is_some() {
			if let Some(expr) = call_expression.callee.as_expr() {
				if let Some(identifier) = expr.as_ident() {
					if identifier.sym.to_string() == "getType".to_string() {
						self.add_import = true;

						let rtrn = ast::CallExpr {
							span: Span::default(),
							// args: call_expression.args.clone(),
							args: vec![ast::ExprOrSpread::from(ast::Expr::from(ast::Str {
								span: Span::default(),
								value: TypeIdentifier::new(&*(call_expression.type_args.as_ref().unwrap()).params[0], &self.module_id).id.into(),
								raw: None,
							}))/*, ArrayLit {
						span: Span::default(),
						elems: call_expression.args.clone(),
					}.as_arg()*/],
							callee: ast::Callee::Expr(Box::new(ast::MemberExpr {
								span: Span::default(),
								obj: Box::new(ast::Ident {
									span: Span::default(),
									sym: METADATA_IMPORT_IDENTIFIER.into(),
									optional: false,
								}.into()),
								prop: ast::MemberProp::from(ast::Ident::new("resolveType".into(), Default::default())),
							}.into())),
							type_args: Default::default(),
						};

						*call_expression = rtrn
					}
				}
			}
		}
	}

	fn visit_mut_class_decl(&mut self, declaration: &mut ast::ClassDecl) {
		declaration.visit_mut_children_with(self);

		/*
		add static block:
		static {
			ClassName.prototype["[[type]]"] = "@TypeId"
		}
		 */
		declaration.class.body.insert(0, ast::ClassMember::StaticBlock(ast::StaticBlock {
			span: Span::default(),
			body: ast::BlockStmt {
				span: Span::default(),
				stmts: vec![
					create_prototype_assign_typeid_statement(&*declaration, &self.module_id),
				],
			},
		}));
	}

	fn visit_mut_module(&mut self, module: &mut ast::Module) {
		// *self.module = &module;

		module.visit_mut_children_with(self);

		if self.add_import {
			module.body.insert(0, ast::ModuleItem::ModuleDecl(
				ast::ModuleDecl::Import(ast::ImportDecl {
					span: Span::default(),
					specifiers: vec![ast::ImportSpecifier::Namespace(ast::ImportStarAsSpecifier {
						span: Span::default(),
						local: ast::Ident {
							span: Span::default(),
							sym: METADATA_IMPORT_IDENTIFIER.into(),
							optional: false,
							// type_ann: Default::default(),
						},
					})],
					src: Box::new(ast::Str {
						span: Span::default(),
						value: "./metadata.typelib".into(),
						raw: None,
					}),
					type_only: false,
					with: None,
				})
			));
		}
	}

	fn visit_mut_module_items(&mut self, n: &mut Vec<ast::ModuleItem>) {
		self.visit_mut_stmt_like(n);
	}

	fn visit_mut_stmts(&mut self, n: &mut Vec<ast::Stmt>) {
		self.visit_mut_stmt_like(n);
	}
}

// #[plugin_transform]
// pub fn process_transform(program: Program, _metadata: TransformPluginProgramMetadata) -> Program {
// 	let transformed_program = program.fold_with(&mut as_folder(TransformVisitor {
// 		// module: &mut program.expect_module(),
//
// 		module_id: generate_module_id(_metadata.source_map.source_file.get().unwrap().name.to_string()),
// 		add_import: false,
// 	}));
// 	transformed_program
// }

pub fn transform(file_path: String, source_code: String, transformer_context: TransformerContext) -> String {
	// pub fn process_transform(program: Program, _metadata: TransformPluginProgramMetadata) -> Program {
	// 	let source_file = swc_core::common::SourceFile::new(swc_core::common::FileName::Real("sourcefile".into()), false, src.into(), );
	let cm: Arc<SourceMap> = Default::default();
	let fm = cm.new_source_file(FileName::Custom(file_path.to_string()), source_code);
	let compiler = Compiler::new(cm);

	// let source_file = Lrc::new(SourceFile::new_from(
	// 	"filename",
	// 	false,
	// 	"filename",
	// 	src,
	// 	swc_core::common::Pos::from_usize(start_pos),
	// ));

	// let program_result = match is_module {
	// 	IsModule::Bool(true) => {
	// 		parse_file_as_module(&fm, syntax, target, comments, &mut errors)
	// 			.map(Program::Module)
	// 	}
	// 	IsModule::Bool(false) => {
	// 		parse_file_as_script(&fm, syntax, target, comments, &mut errors)
	// 			.map(Program::Script)
	// 	}
	// 	IsModule::Unknown => {
	// 		parse_file_as_program(&fm, syntax, target, comments, &mut errors)
	// 	}
	// };

	let mut errors = vec![];
	// let program = compiler.parse_js(fm).unwrap();
	let program = parse_file_as_program(fm.as_ref(), Syntax::Typescript(TsConfig {
		// let program = parse_file_as_module(&fm, Syntax::Typescript(TsConfig {
		tsx: true, // filename.to_string_lossy().ends_with(".tsx")
		decorators: true,
		dts: false,
		no_early_errors: false,
		disallow_ambiguous_jsx_like: false,
	}), EsVersion::EsNext, Default::default(), &mut errors).unwrap();
	// swc_ecma_parser::parse_file_as_program().unwrap();

	let transformed_program = program.fold_with(&mut as_folder(TransformVisitor::new(file_path.to_string(), transformer_context)));

	compiler.print(
		&transformed_program.expect_module(),
		Some("filename.ts"),
		None,
		false,
		EsVersion::EsNext,
		SourceMapsConfig::Bool(false),
		&Default::default(),
		None,
		false,
		None,
		false,
		false,
		"",
	)
		.expect("Failed to print")
		// .map_err(|err| err.to_string())
		// .unwrap()
		.code
}

// An example to test plugin transform.
// Recommended strategy to test plugin's transform is verify
// the Visitor's behavior, instead of trying to run `process_transform` with mocks
// unless explicitly required to do so.
// test!(
//     Default::default(),
//     |_| as_folder(TransformVisitor),
//     boo,
//     // Input codes
//     r#"console.log("transform");"#,
//     // Output codes after transformed with plugin
//     r#"console.log("transform");"#
// );

// #[test]
// fn test_typescript() {
// 	let source = r#"
// function logParameter(target: Object, propertyName: string) {
//   console.log(target, propertyName);
// }
//
//
// function logClass(target: Function) {
//   console.log(target)
// }
//
// @logClass
// export class Employee {
//   @logParameter
//   name: string;
// }
//     "#.to_string();
//
// 	let res = GLOBALS.set(&Default::default(), || transform(source));
//
//
// 	println!("{}", res);
//
// 	// match res {
// 	// 	Ok(output) => {
// 	// 		println!("{}", output);
// 	// 	}
// 	// 	Err(msg) => {
// 	// 		println!("{}", msg);
// 	// 	}
// 	// };
// }