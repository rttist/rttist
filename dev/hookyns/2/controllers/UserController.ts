import { route }       from "../framework/controllers/decorators/route";
import { IController } from "../framework/controllers/IController";

const users = [
	{
		name: "Ryan Dahl",
		projects: [
			"node.js",
			"deno"
		]
	},
	{
		name: "John Smith",
		projects: [
			"Mr & Mrs Smith",
		]
	}
];

@route("users")
export class UserController implements IController
{
	get(id?: number)
	{
		if (id !== undefined)
		{
			return users[id] ?? "Unknown user";
		}

		return users;
	}
}