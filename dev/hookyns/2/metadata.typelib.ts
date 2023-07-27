import { ModuleImporter, Type } from "rttist";
import { Metadata } from "./.metadata/metadata.typelib";

// TODO: Generate this file automatically, but only when there is a new file or some file was removed.

Type.configure({
	nullability: false,
});

ModuleImporter.registerImporters({
	"@@this/controllers/HomeController": () => import("./controllers/HomeController"),
});

export { Metadata };
