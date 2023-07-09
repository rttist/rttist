import { route } from "../framework/controllers/decorators/route";
import { IController } from "../framework/controllers/IController";

@route("/dummy5")
export class Dummy5Controller implements IController {
	get() {
		return {};
	}
}
