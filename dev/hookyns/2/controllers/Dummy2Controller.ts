import { route } from "../framework/controllers/decorators/route";
import { IController } from "../framework/controllers/IController";

@route("/dummy2")
export class Dummy2Controller implements IController {
	get() {
		return {};
	}
}
