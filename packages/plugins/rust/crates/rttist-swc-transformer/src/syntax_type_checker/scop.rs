struct Scope {
    declarations: HashMap<String, DeclarationInfo>,
    type_declarations: HashMap<String, TypeDeclarationInfo>,
    module_scope: ModuleScope,
}

impl Scope {
    pub fn new(module_scope: ModuleScope) -> Scope {
        Scope {
            declarations: HashMap::new(),
            type_declarations: HashMap::new(),
            module_scope
        }
    }

    pub fn add_declaration(&mut self, name: String, declaration: DeclarationInfo) {
        self.declarations.insert(name, declaration);
    }

    pub fn add_type_declaration(&mut self, name: String, declaration: TypeDeclarationInfo) {
        self.type_declarations.insert(name, declaration);
    }

    pub fn get_type_declaration(&self, name: String) -> Option<&TypeDeclarationInfo> {
        self.type_declarations.get(&name)
    }

    pub fn get_declaration(&self, name: String) -> Option<&DeclarationInfo> {
        self.declarations.get(&name)
    }

    pub fn get_imported_module_identifiers(&self) -> Vec<ModuleIdentifier> {
        self.module_scope.get_imported_module_identifiers()
    }

    pub fn get_import_declaration(&self, name: String) -> Option<&ImportDeclarationInfo> {
        self.module_scope.get_import_declaration(name)
    }

    pub fn get_module_id(&self) -> &ModuleIdentifier {
        self.module_scope.get_module_id()
    }

    pub fn get_module_scope(&self) -> &ModuleScope {
        &self.module_scope
    }


}


/*
export class Scope {
	protected readonly declarations = new Map<string, DeclarationInfo>();
	protected readonly typeDeclarations: Map<string, TypeDeclarationInfo>;

	/**
	 * It's not exactly module scope; it's the top scope that is tracked.
	 * It should be scope of the SourceFile (so module scope).
	 */
	public readonly moduleScope: ModuleScope;

	/**
	 *
	 * @param originator Node that created this scope.
	 * @param parent Parent scope.
	 */
	constructor(originator: ts.Node, parent: Scope);
	constructor(
		private readonly originator: ts.Node,
		protected readonly parent?: Scope
	) {
		this.typeDeclarations = hasTypeParameters(originator)
			? new Map(
					originator.typeParameters.map((tp) => [
						tp.name.getText(),
						{
							kind: InfoKind.TypeParameterDeclaration,
							declaration: tp,
						},
					])
			  )
			: new Map();

		this.moduleScope = (parent?.moduleScope ?? this) as ModuleScope;
	}

	addDeclaration(name: string, declaration: DeclarationInfo): void {
		this.declarations.set(name, declaration);
	}

	addTypeDeclaration(name: string, declaration: TypeDeclarationInfo): void {
		this.typeDeclarations.set(name, declaration);
	}

	/**
	 * Return type declaration by name.
	 * @param name
	 */
	getTypeDeclaration(name: string): TypeDeclarationInfo | ImportDeclarationInfo | undefined {
		return (
			this.typeDeclarations?.get(name) ||
			this.parent?.getTypeDeclaration(name) ||
			this.moduleScope.getImportDeclaration(name)
		);
	}

	/**
	 * Return declaration by name.
	 * @param name
	 */
	getDeclaration(name: string): NamedDeclarationInfo | ImportDeclarationInfo | undefined {
		if (name === "this") {
			return {
				kind: InfoKind.NamedDeclaration,
				declaration: this.getContextScope()?.originator as ts.NamedDeclaration,
			};
		}

		return (
			this.declarations.get(name) ||
			this.parent?.getDeclaration(name) ||
			this.moduleScope.getImportDeclaration(name)
		);
	}

	private getContextScope(): Scope | undefined {
		let scope: Scope | undefined = this;

		do {
			if (scope.isContextNode()) {
				return scope;
			}
			scope = scope.parent;
		} while (scope !== undefined);

		return undefined;
	}

	/**
	 * Check if the originator creates "this" context.
	 */
	private isContextNode(): boolean {
		return (
			ts.isClassLike(this.originator) ||
			ts.isFunctionDeclaration(this.originator) ||
			ts.isFunctionExpression(this.originator) ||
			ts.isObjectLiteralExpression(this.originator)
		);
	}
}
