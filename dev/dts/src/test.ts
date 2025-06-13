import { Metadata } from "./metadata.typelib";

console.log(Metadata.getTypes().filter((x) => x.id.startsWith("@")));
