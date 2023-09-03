use crate::types::TransformerContext;
use crate::utils::{remove_extension, resolve_path};
use std::path::{Path, PathBuf};

pub struct ModuleIdentifier {
    pub id: String,
}

impl ModuleIdentifier {
    pub fn for_file(module_path: String, transformer_context: &TransformerContext) -> ModuleIdentifier {
        return module_path.rfind("node_modules").map(|node_modules_index| {
            ModuleIdentifier {
                id: format!("@{}", &module_path[node_modules_index + 13..].replace("\\", "/"))
            }
        }).unwrap_or_else(|| {
            let relative_path = remove_extension(module_path.replace("\\", "/").replace(&transformer_context.package_info.root_dir, ""));

            if relative_path.starts_with("/") {
                ModuleIdentifier {
                    id: format!("@{}{}", transformer_context.package_info.name, relative_path)
                }
            } else {
                ModuleIdentifier {
                    id: format!("@{}/{}", transformer_context.package_info.name, relative_path)
                }
            }
        });
    }
    pub fn for_import(module_path: String, import_specifier: String, transformer_context: &TransformerContext) -> ModuleIdentifier {
        if import_specifier.starts_with(".") {
            let module_dirname = Path::new(module_path.as_str()).parent().unwrap_or_else(|| {
                panic!("Could not get dirname of module path: {}", module_path);
            });

            let mut path = PathBuf::from(module_dirname);
            path.push(remove_extension(import_specifier));

            return ModuleIdentifier::for_file(resolve_path(path.as_path()).to_str().unwrap().to_string(), transformer_context);
        }
        // Probably alias
        else if import_specifier.starts_with("@") {
            // TODO: Handle alias
        }

        return ModuleIdentifier {
            id: format!("@{}", remove_extension(import_specifier))
        };
    }
}