import { route } from "../framework/controllers/decorators/route";
import { IController } from "../framework/controllers/IController";

@route("/dummy4")
export class Dummy4Controller implements IController {
	get() {
		return {};
	}
}
