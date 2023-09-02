use swc_core::ecma::{
	ast::Program,
	visit::{as_folder, FoldWith},
};
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};
use rttist_swc_transformer::TransformVisitor;

#[plugin_transform]
pub fn process_transform(program: Program, _metadata: TransformPluginProgramMetadata) -> Program {
	let transformed_program = program.fold_with(&mut as_folder(
		TransformVisitor::new(_metadata.source_map.source_file.get().unwrap().name.to_string())
	));
	transformed_program
}
