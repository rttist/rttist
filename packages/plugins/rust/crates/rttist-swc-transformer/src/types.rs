pub struct PackageInfo {
    pub name: String,
    pub root_dir: String,
}

impl PackageInfo {
    pub fn new(name: String, root_dir: String) -> PackageInfo {
        PackageInfo {
            name,
            root_dir: root_dir.replace("\\", "/")
        }
    }
}

pub struct TransformerContext {
    pub package_info: PackageInfo,
}

impl TransformerContext {
    pub fn new(package_info: PackageInfo) -> TransformerContext {
        TransformerContext {
            package_info,
        }
    }
}