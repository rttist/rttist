use std::path::{Path, PathBuf, Component};

pub fn remove_extension(file_path: String) -> String {
    let mut end = file_path.len();

    if file_path.ends_with(".ts") || file_path.ends_with(".js") {
        end = file_path.len() - 3;
    } else if file_path.ends_with(".tsx") || file_path.ends_with(".jsx") || file_path.ends_with(".cjs") || file_path.ends_with(".mjs") {
        end = file_path.len() - 4;
    }

    return file_path.as_str()[..end].to_string();
}

pub fn normalize_path(file_path: String) -> String {
    return file_path.replace("\\", "/");
}

pub fn resolve_path(path: &Path) -> PathBuf {
    let mut components = path.components().peekable();
    let mut ret = if let Some(c @ Component::Prefix(..)) = components.peek().cloned() {
        components.next();
        PathBuf::from(c.as_os_str())
    } else {
        PathBuf::new()
    };

    for component in components {
        match component {
            Component::Prefix(..) => unreachable!(),
            Component::RootDir => {
                ret.push(component.as_os_str());
            }
            Component::CurDir => {}
            Component::ParentDir => {
                ret.pop();
            }
            Component::Normal(c) => {
                ret.push(c);
            }
        }
    }
    ret
}