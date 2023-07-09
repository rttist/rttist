import { route } from "../framework/controllers/decorators/route";
import { IController } from "../framework/controllers/IController";

@route("/dummy6")
export class Dummy6Controller implements IController {
	get() {
		return {};
	}
}
