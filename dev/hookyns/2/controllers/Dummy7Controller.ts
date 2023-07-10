import { route } from "../framework/controllers/decorators/route";
import { IController } from "../framework/controllers/IController";

@route("/dummy7")
export class Dummy7Controller implements IController {
	get() {
		return {};
	}
}
