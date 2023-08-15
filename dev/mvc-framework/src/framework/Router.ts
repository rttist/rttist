import type { Server, Request, Response } from "hyper-express";
import { IController } from "./controllers/IController";
import { IPathParameterParser } from "./controllers/IPathParameterParser";
import { ClassType, ParameterInfo, FunctionType, InterfaceType } from "rttist";
import { Metadata } from "../metadata.typelib";

export class Router {
	constructor(
		private readonly webServer: Server,
		private readonly pathParamParser: IPathParameterParser
	) {}

	async registerControllers() {
		//const routeDecoratorType = getType(route);
		const typeRoute = Metadata.getTypes().find(
			(t) => t.isFunction() && t.id.endsWith("/framework/controllers/decorators/route:route")
		) as FunctionType | undefined;

		if (!typeRoute) throw new Error("Unable to find route decorator type.");

		//const typeIController = getType<IController>();
		const typeIController = Metadata.getTypes().find(
			(t) => t.isInterface() && t.id.includes("/framework/controllers/IController:IController")
		) as InterfaceType | undefined;

		if (!typeIController) throw new Error("Unable to find controller interface type.");

		// Find all classes implementing the IController decorated by the @route.
		const controllers = Metadata.getTypes()
			.filter((type) => type.isClass() && !type.abstract && type.exported && type.isDerivedFrom(typeIController))
			.map((type) => ({
				type: type as ClassType,
				routeDecorator: (type as ClassType).getDecorators().find((decorator) => decorator.is(typeRoute)),
			}))
			.filter((x) => x.routeDecorator !== undefined);

		await Promise.all(
			controllers.map(async (controllerInfo) => {
				const module = await controllerInfo.type.module.import();
				// const module =
				// 	(await controllerInfo.type.module.import()) ??
				// 	require(controllerInfo.type.module.path
				// 		.replace("/src/controllers/", "/dist/controllers/")
				// 		.replace(".ts", ".js"));

				if (!module) {
					console.error(`Unable to import module of controller '${controllerInfo.type.name}'.`);
					return;
				}

				// controllerInfo.type.getCtor()
				const ClassCtor: { new (): IController } = module[controllerInfo.type.name];

				// The @route decorator argument
				const route = controllerInfo.routeDecorator!.getArguments()[0];

				// GET
				const getMethod = controllerInfo.type.getMethod("get");

				if (getMethod !== undefined) {
					const parameters = getMethod.getSignatures()[0].getParameters();
					const idIndex = parameters.findIndex((param) => param.name === "id");
					const paramInfo: ParameterInfo | undefined = idIndex === -1 ? undefined : parameters[idIndex];
					let ctor, args, parameterInfo;
					const routePaths =
						!route || route === "/" ? ["/"] : ["/" + route, "/" + route + "/", "/" + route + "/:id"];

					console.info("Registering GET ", routePaths.join(", GET "));

					const handler = (req: Request, res: Response) => {
						ctor = new ClassCtor();

						if (paramInfo === undefined) {
							this.respond(ctor.get!(), res);
							return;
						}

						args = [];
						for (let param in req.params) {
							if (req.params.hasOwnProperty(param)) {
								parameterInfo = parameters.find((p) => p.name === param);

								args.push(
									parameterInfo === undefined
										? undefined
										: this.pathParamParser.parse(req.params[param], paramInfo.type)
								);
							}
						}

						this.respond(ctor.get!(...args), res);
					};

					for (let path of routePaths) {
						this.webServer.get(path, handler);
					}
				}
			})
		);
	}

	private respond(value: any, response: Response) {
		response.send(typeof value === "object" ? JSON.stringify(value) : value.toString());
	}
}
