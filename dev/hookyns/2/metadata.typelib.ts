import { ModuleImporter } from "rttist";
import { Metadata } from "./.metadata/metadata.typelib";

ModuleImporter.registerImporters({
	"@@this/controllers/HomeController": () => import("./controllers/HomeController"),
});

export { Metadata };
