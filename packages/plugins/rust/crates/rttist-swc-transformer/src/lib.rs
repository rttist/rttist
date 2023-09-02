pub mod generate_module_id;
pub mod generate_type_id;

use swc_core::ecma::{
	ast,
	// ast::Program,
	ast::CallExpr,
	ast::EsVersion,
	ast::Ident,
	ast::Callee,
	ast::MemberExpr,
	ast::MemberProp,
	ast::Expr,
	ast::ExprOrSpread,
	ast::Str,
	ast::ModuleItem,
	ast::ModuleDecl,
	ast::ImportDecl,
	ast::ImportSpecifier,
	// transforms::testing::test,
	visit::{as_folder, FoldWith, VisitMut, VisitMutWith},
};
// use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};
use swc_ecma_parser::{/*parse_file_as_module, */parse_file_as_program, Syntax, TsConfig};
use swc_core::common::{FileName, SourceMap, sync::Lrc, Span};
use swc::{Compiler};
use swc::config::{SourceMapsConfig};
use swc_core::ecma::ast::{BlockStmt, ClassDecl, ClassMember, FnDecl, Module, Stmt};
use crate::generate_module_id::{generate_module_id, ModuleIdentifier};
use crate::generate_type_id::{TypeIdentifier};

const METADATA_IMPORT_IDENTIFIER: &str = "___metadataImport___";
const PROTOTYPE_TYPE_PROPERTY_NAME: &str = "[[type]]";

pub struct TransformVisitor {
	// module: *mut Module,
	module_id: ModuleIdentifier,
	add_import: bool,
}

impl TransformVisitor {
	pub fn new(module_id: String) -> TransformVisitor {
		TransformVisitor {
			module_id: generate_module_id(module_id),
			add_import: false
		}
	}
}

impl VisitMut for TransformVisitor {
	fn visit_mut_call_expr(&mut self, call_expression: &mut CallExpr) {
		call_expression.visit_mut_children_with(self);

		// if let Some(type_args) = call_expression.type_args {
		if call_expression.type_args.is_some() {
			if let Some(expr) = call_expression.callee.as_expr() {
				if let Some(identifier) = expr.as_ident() {
					if identifier.sym.to_string() == "getType".to_string() {
						self.add_import = true;

						let rtrn = CallExpr {
							span: Span::default(),
							// args: call_expression.args.clone(),
							args: vec![ExprOrSpread::from(Expr::from(Str {
								span: Span::default(),
								value: TypeIdentifier::new(&*(call_expression.type_args.as_ref().unwrap()).params[0], &self.module_id).id.into(),
								raw: None,
							}))/*, ArrayLit {
						span: Span::default(),
						elems: call_expression.args.clone(),
					}.as_arg()*/],
							callee: Callee::Expr(Box::new(MemberExpr {
								span: Span::default(),
								obj: Box::new(Ident {
									span: Span::default(),
									sym: METADATA_IMPORT_IDENTIFIER.into(),
									optional: false,
								}.into()),
								prop: MemberProp::from(Ident::new("resolveType".into(), Default::default())),
							}.into())),
							type_args: Default::default(),
						};

						*call_expression = rtrn
					}
				}
			}
		}
	}

	fn visit_mut_class_decl(&mut self, declaration: &mut ClassDecl) {
		declaration.visit_mut_children_with(self);

		/*
		add static block:
		static {
			ClassName.prototype["[[type]]"] = "@TypeId"
		}
		 */
		declaration.class.body.insert(0, ClassMember::StaticBlock(ast::StaticBlock {
			span: Span::default(),
			body: BlockStmt {
				span: Span::default(),
				stmts: vec![
					Stmt::Expr(ast::ExprStmt {
						span: Span::default(),
						expr: Box::new(Expr::Assign(ast::AssignExpr {
							span: Span::default(),
							op: ast::AssignOp::Assign,
							left: ast::PatOrExpr::Expr(Box::new(Expr::Member(MemberExpr {
								span: Span::default(),
								obj: Box::new(Expr::Member(MemberExpr {
									span: Span::default(),
									obj: Box::new(declaration.ident.clone().into()),
									prop: MemberProp::Ident(Ident::new("prototype".into(), Span::default())),
								})),
								prop: MemberProp::Computed(ast::ComputedPropName {
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
									expr: Box::new(Expr::Lit(ast::Lit::Str(Str {
										span: Span::default(),
										value: PROTOTYPE_TYPE_PROPERTY_NAME.into(),
										raw: None,
									}))),
								}),
							}))),
							right: Box::new(Expr::from(Str {
								span: Span::default(),
								value: TypeIdentifier::new(&*declaration, &self.module_id).id.into(),
								raw: None,
							})),
						})),
					}),
				],
			},
		}));
	}

	fn visit_mut_fn_decl(&mut self, declaration: &mut FnDecl) {
		declaration.visit_mut_children_with(self);

		let ass = Box::new(Expr::Assign(ast::AssignExpr {
			span: Span::default(),
			op: ast::AssignOp::Assign,
			left: ast::PatOrExpr::Expr(Box::new(Expr::Member(MemberExpr {
				span: Span::default(),
				obj: Box::new(Expr::Member(MemberExpr {
					span: Span::default(),
					obj: Box::new(declaration.ident.clone().into()),
					prop: MemberProp::Ident(Ident::new("prototype".into(), Span::default())),
				})),
				prop: MemberProp::Computed(ast::ComputedPropName {
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
					expr: Box::new(Expr::Lit(ast::Lit::Str(Str {
						span: Span::default(),
						value: PROTOTYPE_TYPE_PROPERTY_NAME.into(),
						raw: None,
					}))),
				}),
			}))),
			right: Box::new(Expr::from(Str {
				span: Span::default(),
				value: TypeIdentifier::new(&*declaration, &self.module_id).id.into(),
				raw: None,
			})),
		}));

		//
		//
		// /*
		// add assignment after function declaration:
		// FunctionIdentifier.prototype["[[type]]"] = "@TypeId"
		//  */
		// declaration.body.insert(0, ClassMember::StaticBlock(ast::StaticBlock {
		// 	span: Span::default(),
		// 	body: BlockStmt {
		// 		span: Span::default(),
		// 		stmts: vec![
		// 			Stmt::Expr(ast::ExprStmt {
		// 				span: Span::default(),
		// 				expr: Box::new(Expr::Assign(ast::AssignExpr {
		// 					span: Span::default(),
		// 					op: ast::AssignOp::Assign,
		// 					left: ast::PatOrExpr::Expr(Box::new(Expr::Member(MemberExpr {
		// 						span: Span::default(),
		// 						obj: Box::new(Expr::Member(MemberExpr {
		// 							span: Span::default(),
		// 							obj: Box::new(declaration.ident.clone().into()),
		// 							prop: MemberProp::Ident(Ident::new("prototype".into(), Span::default())),
		// 						})),
		// 						prop: MemberProp::Computed(ast::ComputedPropName {
		// 							span: Span::default(),
		// 							// expr: Box::new(MemberExpr {
		// 							// 	span: Span::default(),
		// 							// 	obj: Box::new(Ident {
		// 							// 		span: Span::default(),
		// 							// 		sym: METADATA_IMPORT_IDENTIFIER.into(),
		// 							// 		optional: false,
		// 							// 	}.into()),
		// 							// 	prop: MemberProp::from(Ident::new("symbols".into(), Default::default())),
		// 							// }.into()),
		// 							expr: Box::new(Expr::Lit(ast::Lit::Str(Str {
		// 								span: Span::default(),
		// 								value: PROTOTYPE_TYPE_PROPERTY_NAME.into(),
		// 								raw: None,
		// 							}))),
		// 						}),
		// 					}))),
		// 					right: Box::new(Expr::from(Str {
		// 						span: Span::default(),
		// 						// TODO: Generate type identifier
		// 						value: "type identifier".into(),
		// 						raw: None,
		// 					})),
		// 				})),
		// 			}),
		// 		],
		// 	},
		// }));
	}

	fn visit_mut_module(&mut self, module: &mut Module) {
		// *self.module = &module;

		module.visit_mut_children_with(self);

		if self.add_import {
			module.body.insert(0, ModuleItem::ModuleDecl(
				ModuleDecl::Import(ImportDecl {
					span: Span::default(),
					specifiers: vec![ImportSpecifier::Namespace(ast::ImportStarAsSpecifier {
						span: Span::default(),
						local: Ident {
							span: Span::default(),
							sym: METADATA_IMPORT_IDENTIFIER.into(),
							optional: false,
							// type_ann: Default::default(),
						},
					})],
					src: Box::new(Str {
						span: Span::default(),
						value: "./metadata.typelib".into(),
						raw: None,
					}),
					type_only: false,
					asserts: None,
				})
			));
		}
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

pub fn transform(file_path: String, source_code: String) -> String {
	// pub fn process_transform(program: Program, _metadata: TransformPluginProgramMetadata) -> Program {
	// 	let source_file = swc_core::common::SourceFile::new(swc_core::common::FileName::Real("sourcefile".into()), false, src.into(), );
	let cm: Lrc<SourceMap> = Default::default();
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
	let program = parse_file_as_program(&fm, Syntax::Typescript(TsConfig {
		// let program = parse_file_as_module(&fm, Syntax::Typescript(TsConfig {
		tsx: true, // filename.to_string_lossy().ends_with(".tsx")
		decorators: true,
		dts: false,
		no_early_errors: false,
		disallow_ambiguous_jsx_like: false,
	}), EsVersion::EsNext, Default::default(), &mut errors).unwrap();
	// swc_ecma_parser::parse_file_as_program().unwrap();

	let transformed_program = program.fold_with(&mut as_folder(TransformVisitor {
		// module: &mut program.expect_module(),
		module_id: generate_module_id(file_path.to_string()),
		add_import: false,
	}));

	compiler.print(
		&transformed_program,
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