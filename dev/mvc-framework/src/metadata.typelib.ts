/*
* This file is generated automatically by the RTTIST TypeGen tool.
* Do not edit it manually.
*/
import { ModuleImporter, Type, MetadataLibrary, createGetTypeFunction } from "rttist";
// @ts-ignore
import { Metadata as InternalMetadataLibrary } from "./internal.typelib";

ModuleImporter.registerImporters({
	"@simple-tests/index": () => import("./index.js"),
	"@simple-tests/controllers/Dummy1Controller": () => import("./controllers/Dummy1Controller.js"),
	"@simple-tests/controllers/Dummy2Controller": () => import("./controllers/Dummy2Controller.js"),
	"@simple-tests/controllers/Dummy3Controller": () => import("./controllers/Dummy3Controller.js"),
	"@simple-tests/controllers/Dummy4Controller": () => import("./controllers/Dummy4Controller.js"),
	"@simple-tests/controllers/Dummy5Controller": () => import("./controllers/Dummy5Controller.js"),
	"@simple-tests/controllers/Dummy6Controller": () => import("./controllers/Dummy6Controller.js"),
	"@simple-tests/controllers/Dummy7Controller": () => import("./controllers/Dummy7Controller.js"),
	"@simple-tests/controllers/HomeController": () => import("./controllers/HomeController.js"),
	"@simple-tests/controllers/UserController": () => import("./controllers/UserController.js"),
	"@simple-tests/framework/Application": () => import("./framework/Application.js"),
	"@simple-tests/framework/Router": () => import("./framework/Router.js"),
	"@simple-tests/framework/controllers/BasePathParameterParser": () => import("./framework/controllers/BasePathParameterParser.js"),
	"@simple-tests/framework/controllers/IController": () => import("./framework/controllers/IController.js"),
	"@simple-tests/framework/controllers/IPathParameterParser": () => import("./framework/controllers/IPathParameterParser.js"),
	"@simple-tests/framework/controllers/decorators/route": () => import("./framework/controllers/decorators/route.js"),
});

export const getType = createGetTypeFunction(InternalMetadataLibrary);

/** @internal */
export const Metadata: MetadataLibrary = InternalMetadataLibrary;