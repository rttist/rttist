use std::collections::HashMap;
use swc::atoms::once_cell::sync::Lazy;
use crate::generate_module_id::ModuleIdentifier;
use crate::type_ids::TypeIds;
use swc_core::ecma::ast;
use crate::utils::{keyword_kind_to_type_identifier, literal_to_type_identifier};

pub static WELL_KNOWN_TYPES: Lazy<HashMap<&'static str, &'static str>> = Lazy::new(|| HashMap::from([
    ("object", TypeIds::NonPrimitiveObject.to_str()),
    // (ts.SyntaxKind.ObjectKeyword, TypeIds::NonPrimitiveObject.to_str()),
    ("Function", TypeIds::Function.to_str()),
    ("any", TypeIds::Any.to_str()),
    // (ts.SyntaxKind.AnyKeyword, TypeIds::Any.to_str()),
    ("unknown", TypeIds::Unknown.to_str()),
    // (ts.SyntaxKind.UnknownKeyword, TypeIds::Unknown.to_str()),
    ("void", TypeIds::Void.to_str()),
    // (ts.SyntaxKind.VoidKeyword, TypeIds::Void.to_str()),
    ("never", TypeIds::Never.to_str()),
    // (ts.SyntaxKind.NeverKeyword, TypeIds::Never.to_str()),
    ("null", TypeIds::Null.to_str()),
    // (ts.SyntaxKind.NullKeyword, TypeIds::Null.to_str()),
    ("undefined", TypeIds::Undefined.to_str()),
    // (ts.SyntaxKind.UndefinedKeyword, TypeIds::Undefined.to_str()),
    ("String", TypeIds::String.to_str()),
    // (ts.SyntaxKind.StringKeyword, TypeIds::String.to_str()),
    ("Number", TypeIds::Number.to_str()),
    // (ts.SyntaxKind.NumberKeyword, TypeIds::Number.to_str()),
    ("BigInt", TypeIds::BigInt.to_str()),
    // (ts.SyntaxKind.BigIntKeyword, TypeIds::BigInt.to_str()),
    ("Boolean", TypeIds::Boolean.to_str()),
    // (ts.SyntaxKind.BooleanKeyword, TypeIds::Boolean.to_str()),
    ("true", TypeIds::True.to_str()),
    // (ts.SyntaxKind.TrueKeyword, TypeIds::True.to_str()),
    ("false", TypeIds::False.to_str()),
    // (ts.SyntaxKind.FalseKeyword, TypeIds::False.to_str()),
    ("Date", TypeIds::Date.to_str()),
    ("Error", TypeIds::Error.to_str()),
    ("Symbol", TypeIds::Symbol.to_str()),
    // (ts.SyntaxKind.SymbolKeyword, TypeIds::Symbol.to_str()),
    ("UniqueSymbol", TypeIds::UniqueSymbol.to_str()),
    ("RegExp", TypeIds::RegExp.to_str()),
    ("Int8Array", TypeIds::Int8Array.to_str()),
    ("Uint8Array", TypeIds::Uint8Array.to_str()),
    ("Uint8ClampedArray", TypeIds::Uint8ClampedArray.to_str()),
    ("Int16Array", TypeIds::Int16Array.to_str()),
    ("Uint16Array", TypeIds::Uint16Array.to_str()),
    ("Int32Array", TypeIds::Int32Array.to_str()),
    ("Uint32Array", TypeIds::Uint32Array.to_str()),
    ("Float32Array", TypeIds::Float32Array.to_str()),
    ("Float64Array", TypeIds::Float64Array.to_str()),
    ("BigInt64Array", TypeIds::BigInt64Array.to_str()),
    ("BigUint64Array", TypeIds::BigUint64Array.to_str()),
    ("Array", TypeIds::ArrayDefinition.to_str()),
    ("ReadonlyArray", TypeIds::ReadonlyArrayDefinition.to_str()),
    ("Map", TypeIds::MapDefinition.to_str()),
    ("WeakMap", TypeIds::WeakMapDefinition.to_str()),
    ("Set", TypeIds::SetDefinition.to_str()),
    ("WeakSet", TypeIds::WeakSetDefinition.to_str()),
    ("Promise", TypeIds::PromiseDefinition.to_str()),
    ("Generator", TypeIds::GeneratorDefinition.to_str()),
    ("AsyncGenerator", TypeIds::AsyncGeneratorDefinition.to_str()),
    ("Iterator", TypeIds::IteratorDefinition.to_str()),
    ("Iterable", TypeIds::IterableDefinition.to_str()),
    ("IterableIterator", TypeIds::IterableIteratorDefinition.to_str()),
    ("AsyncIterator", TypeIds::AsyncIteratorDefinition.to_str()),
    ("AsyncIterable", TypeIds::AsyncIterableDefinition.to_str()),
    ("AsyncIterableIterator", TypeIds::AsyncIterableIteratorDefinition.to_str()),
    ("ArrayBuffer", TypeIds::ArrayBuffer.to_str()),
    ("SharedArrayBuffer", TypeIds::SharedArrayBuffer.to_str()),
    ("Atomics", TypeIds::Atomics.to_str()),
    ("DataView", TypeIds::DataView.to_str()),
]));

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
        // KEYWORD
        if let Some(keyword) = self.as_ts_keyword_type() {
            return keyword_kind_to_type_identifier(keyword.kind);
        }

        // LITERAL TYPE
        if let Some(lit_type) = self.as_ts_lit_type() {
            return literal_to_type_identifier(&lit_type.lit);
        }

        // TYPE REFERENCE
        if let Some(type_ref) = self.as_ts_type_ref() {
            let type_identifier = &type_ref.type_name.as_ident().unwrap().sym.to_string();
            let id: String;
            let mut type_args: String = "".to_string();
            let nullable = ""; // TODO: Handle nullable types; should be "?" if nullable

            // WELL KNOWN TYPES
            let type_match = WELL_KNOWN_TYPES.get(type_identifier.as_str());

            if let Some(type_id) = type_match {
                id = type_id.to_string();
            }
            // REST...
            else {
                id = format!("{}:{}", module_identifier.id, type_identifier);
            }

            // type parameters
            if let Some(type_params) = &type_ref.type_params {
                if type_params.params.len() > 0 {
                    type_args = format!("{{{}}}", type_params.params.iter().map(|param| {
                        TypeIdentifier::new(param.as_ref(), &module_identifier).id
                    }).collect::<Vec<String>>().join(","))
                }
            }

            return TypeIdentifier {
                // TODO: Use SyntaxScope to resolve source module
                id: format!("{}{}{}", id, type_args, nullable)
            };
        }


        TypeIdentifier {
            id: TypeIds::Invalid.to_string(),
        }
    }
}