const encoder = new TextEncoder();

export function encodeString(string: string): Uint8Array
{
	return encoder.encode(string);
}