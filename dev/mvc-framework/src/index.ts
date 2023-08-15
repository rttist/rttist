import { Application } from "./framework/Application";

new Application().run({ port: 8080 }).catch((err) => {
	console.error(err);
});
