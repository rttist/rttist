import { route }       from "../framework/controllers/decorators/route";
import { IController } from "../framework/controllers/IController";

@route("/")
export class UserController implements IController
{
	get()
	{
		return `
		<h1>Hello World!</h1>
		<p>Get list of users by <code>GET /users/:id</code></p>.
		`;
	}
}