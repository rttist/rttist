use std::collections::HashMap;
use std::net::ToSocketAddrs;
use swc_core::ecma::ast;
use crate::syntax_type_checker::module_scope::ModuleScope;

// pub enum InfoKind {
//     NamedDeclaration,
//     ImportDeclaration,
//     TypeParameterDeclaration,
//     AnyTypeDeclaration,
// }
//
// pub struct DeclarationInfo;
// pub struct TypeParameterDeclarationInfo {
//
// }
// pub struct AnyTypeDeclarationInfo;
// pub struct TypeDeclarationInfo;
// // pub type TypeDeclarationInfo = TypeParameterDeclarationInfo + AnyTypeDeclarationInfo;
//
// pub struct Scope {
//     declarations: HashMap<String, DeclarationInfo>,
//     type_declarations: HashMap<String, TypeDeclarationInfo>,
//     module_scope: ModuleScope,
// }
// use std::collections::HashMap;
use crate::generate_module_id::ModuleIdentifier;

enum InfoKind {
    NamedDeclaration,
    ImportDeclaration,
    TypeParameterDeclaration,
    AnyTypeDeclaration,
}

pub struct ImportDeclarationInfo {
    kind: InfoKind,
    namespace_import: bool,
    declared_name: String,
    module_id: ModuleIdentifier,
    declaration: ImportDeclaration,
}

pub struct DeclarationInfo {
    kind: InfoKind,
    class_declaration: Option<ast::ClassDecl>,
    function_declaration: Option<ast::FnDecl>,
    variable_declaration: Option<ast::VarDecl>,
}

struct TypeDeclarationInfo {
    kind: InfoKind,
    type_parameter_declaration: Option<ast::TsTypeParam>,
    class_declaration: Option<ast::ClassDecl>,
    function_declaration: Option<ast::FnDecl>,
    interface_declaration: Option<ast::TsInterfaceDecl>,
    type_alias_declaration: Option<ast::TsTypeAliasDecl>,
}


struct Originator {
    class_declaration: Option<ast::ClassDecl>,
    function_declaration: Option<ast::FnDecl>,
    block_statement: Option<ast::BlockStmt>,
}

// trait HasTypeParameters {
//
// }
struct Scope {
    declarations: HashMap<String, DeclarationInfo>,
    type_declarations: HashMap<String, TypeDeclarationInfo>,
    module_scope: ModuleScope,
    originator: ast::Ident,
    parent: Option<Box<Scope>>,
}

impl Scope {
    fn new(
        originator: Originator,
        parent: Option<Box<Scope>>,
        type_parameters: Vec<ast::TsTypeParam>,
    ) -> Scope {
        let type_declarations = type_parameters
            .iter()
            .map(|tp| {
                (
                    tp.name.sym.to_string(),
                    TypeDeclarationInfo {
                        kind: InfoKind::TypeParameterDeclaration,
                        type_parameter_declaration: Some(tp.clone()),
                        class_declaration: None,
                        interface_declaration: None,
                        function_declaration: None,
                        type_alias_declaration: None,
                    }
                )
            })
            .collect();

        Scope {
            declarations: HashMap::new(),
            type_declarations,
            module_scope: parent.as_ref().map_or_else(
                || ModuleScope::new(),
                |p| p.module_scope.clone(),
            ),
            originator,
            parent,
        }
    }

    fn add_declaration(&mut self, name: String, declaration: DeclarationInfo) {
        self.declarations.insert(name, declaration);
    }

    fn add_type_declaration(&mut self, name: String, declaration: TypeDeclarationInfo) {
        self.type_declarations.insert(name, declaration);
    }

    fn get_type_declaration(&self, name: &str) -> Option<TypeDeclarationInfo> {
        self.type_declarations
            .get(name)
            .cloned()
            .or_else(|| self.parent.as_ref().and_then(|p| p.get_type_declaration(name)))
            .or_else(|| self.module_scope.get_import_declaration(name))
    }

    fn get_declaration(&self, name: &str) -> Option<NamedDeclarationInfo> {
        if name == "this" {
            return Some(NamedDeclarationInfo {
                kind: InfoKind::NamedDeclaration,
                declaration: self.get_context_scope()?.originator.clone(),
            });
        }

        self.declarations
            .get(name)
            .cloned()
            .or_else(|| self.parent.as_ref().and_then(|p| p.get_declaration(name)))
            .or_else(|| self.module_scope.get_import_declaration(name))
    }

    fn get_context_scope(&self) -> Option<&Scope> {
        let mut scope = self;

        while let Some(parent) = &scope.parent {
            if scope.is_context_node() {
                return Some(scope);
            }
            scope = parent;
        }

        None
    }

    fn is_context_node(&self) -> bool {
        matches!(
            self.originator,
            Node::ClassLike(_)
                | Node::FunctionDeclaration(_)
                | Node::FunctionExpression(_)
                | Node::ObjectLiteralExpression(_)
        )
    }
}

fn has_type_parameters(node: &Node) -> bool {
    node.type_parameters.is_some()
}

// struct ModuleScope {
//     // Define ModuleScope fields here
// }
//
// impl ModuleScope {
//     fn new() -> ModuleScope {
//         // Initialize ModuleScope fields here
//         ModuleScope {}
//     }
//
//     fn get_import_declaration(&self, name: &str) -> Option<ImportDeclarationInfo> {
//         // Implement getting import declaration here
//         None
//     }
// }

// struct ImportDeclaration {
//     // Define ImportDeclaration fields here
// }
//
// struct NamedDeclaration {
//     // Define NamedDeclaration fields here
// }
//
// struct TypeParameterDeclaration {
//     // Define TypeParameterDeclaration fields here
// }
//
// struct AnyTypeDeclaration {
//     // Define AnyTypeDeclaration fields here
// }