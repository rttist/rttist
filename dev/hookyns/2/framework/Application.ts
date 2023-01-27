import { Server }                  from "hyper-express";
import { BasePathParameterParser } from "./controllers/BasePathParameterParser";
import { Router }                  from "./Router";

export class Application
{
	async run(options: { port: number })
	{
		const webServer = new Server();
		const pathParamParser = new BasePathParameterParser();
		const router = new Router(webServer, pathParamParser);
		
		await router.registerControllers();
		
		await webServer.listen(options.port);
		console.info(`Server started. Listening on port ${options.port}.`);
	}
}