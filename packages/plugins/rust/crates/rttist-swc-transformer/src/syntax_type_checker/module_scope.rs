use std::collections::HashMap;

pub struct ModuleScope {
    import_declarations: HashMap<String, ImportDeclarationInfo>
}

impl ModuleScope {
    pub fn new() -> ModuleScope {
        ModuleScope {
            import_declarations: HashMap::new()
        }
    }

    pub fn add_import_declaration(&mut self, name: String, declaration: ImportDeclarationInfo) {
        self.import_declarations.insert(name, declaration);
    }

    pub fn get_import_declaration(&self, name: String) -> Option<&ImportDeclarationInfo> {
        self.import_declarations.get(&name)
    }

    pub fn get_imported_module_identifiers(&self) -> Vec<ModuleIdentifier> {
        self.import_declarations.values().map(|x| x.module_id.clone()).collect()
    }
}


/*
export class ModuleScope extends Scope {
	protected readonly importDeclarations = new Map<string, ImportDeclarationInfo>();

	/**
	 *
	 * @param originator Node that created this scope.
	 * @param id
	 */
	constructor(
		originator: ts.SourceFile,
		public readonly id: ModuleIdentifier
	) {
		super(originator, null!);
	}

	addImportDeclaration(name: string, declaration: ImportDeclarationInfo): void {
		this.importDeclarations.set(name, declaration);
	}

	getImportDeclaration(name: string) {
		return this.importDeclarations.get(name);
	}

	getImportedModuleIdentifiers() {
		return Array.from(this.importDeclarations.values()).map((x) => x.moduleId);
	}
}

 */