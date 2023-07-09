import { route } from "../framework/controllers/decorators/route";
import { IController } from "../framework/controllers/IController";

@route("/dummy3")
export class Dummy3Controller implements IController {
	get() {
		return {};
	}
}
