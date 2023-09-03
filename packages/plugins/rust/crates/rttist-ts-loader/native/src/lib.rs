use neon::prelude::*;
use neon::result::Throw;
use std::fs;
use swc_core::common::{GLOBALS};
use rttist_swc_transformer::types::{PackageInfo, TransformerContext};

pub fn transform(mut cx: FunctionContext) -> JsResult<JsString> {
    let source_code = cx.argument::<JsString>(0)?.value();
    let path = cx.argument::<JsString>(1)?.value();
    let package_info_obj = cx.argument::<JsObject>(2)?;
    // let package_info = get_package_info(&mut cx, package_info_obj)?;

    let package_name_prop: Handle<JsString> = package_info_obj.get(&mut cx, "name")?;
    let package_root_dir_prop: Handle<JsString> = package_info_obj.get(&mut cx, "rootDir")?;

    let package_info = PackageInfo {
        name: package_name_prop.value(),
        root_dir: package_root_dir_prop.value(),
    };

    let res = GLOBALS.set(&Default::default(), || rttist_swc_transformer::transform(
        path,
        source_code,
        TransformerContext::new(package_info),
    ));
    return Ok(cx.string(res));
}

pub fn load(mut cx: FunctionContext) -> JsResult<JsString> {
    let path = cx.argument::<JsString>(0)?.value();
    let package_info_obj = cx.argument::<JsObject>(1)?;
    // let package_info = get_package_info(&mut cx, package_info_obj)?;

    let package_name_prop: Handle<JsString> = package_info_obj.get(&mut cx, "name")?;
    let package_root_dir_prop: Handle<JsString> = package_info_obj.get(&mut cx, "rootDir")?;

    let package_info = PackageInfo {
        name: package_name_prop.value(),
        root_dir: package_root_dir_prop.value(),
    };

    return match fs::read_to_string(path.clone()) {
        Ok(code) => Ok(
            cx.string(GLOBALS.set(&Default::default(), || rttist_swc_transformer::transform(
                path,
                code,
                TransformerContext::new(package_info),
            )))
        ),
        Err(err) => cx.throw_error(format!("Unable to load file '{}'.\n\t{}", path, err.to_string()))
    };
}

// TODO: Solve this refactor; throws error...
// fn get_package_info(mut cx: &mut FunctionContext, package_info_obj: Handle<JsObject>) -> Result<PackageInfo, Throw> {
//     let package_name_prop: Handle<JsString> = package_info_obj.get(&mut cx, "name")?;
//     let package_root_dir_prop: Handle<JsString> = package_info_obj.get(&mut cx, "rootDir")?;
//
//     let package_info = PackageInfo {
//         name: package_name_prop.value(),
//         root_dir: package_root_dir_prop.value(),
//     };
//
//     Ok(package_info)
// }

register_module!(mut cx, {
    cx.export_function("load", load).expect("Function 'load' exported.");
    cx.export_function("transform", transform).expect("Function 'transform' exported.");

    Ok(())
});
