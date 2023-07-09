import { route } from "../framework/controllers/decorators/route";
import { IController } from "../framework/controllers/IController";

@route("/dummy1")
export class Dummy1Controller implements IController {
	get() {
		return {};
	}
}
