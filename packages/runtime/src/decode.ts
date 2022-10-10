// MIT, (c) 2021 qntm, github.com/qntm/base32768/blob/main/LICENSE.txt
const BPCH = 15, BPB = 8,
	pS = ["ҠҿԀԟڀڿݠޟ߀ߟကဟႠႿᄀᅟᆀᆟᇠሿበቿዠዿጠጿᎠᏟᐠᙟᚠᛟកសᠠᡟᣀᣟᦀᦟ᧠᧿ᨠᨿᯀᯟᰀᰟᴀᴟ⇠⇿⋀⋟⍀⏟␀␟─❟➀➿⠀⥿⦠⦿⨠⩟⪀⪿⫠⭟ⰀⰟⲀⳟⴀⴟⵀⵟ⺠⻟㇀㇟㐀䶟䷀龿ꀀꑿ꒠꒿ꔀꗿꙀꙟꚠꛟ꜀ꝟꞀꞟꡀꡟ", "ƀƟɀʟ"],
	th = (a: any) => {
		throw new Error(a);
	}, lD: any = {};
pS.forEach((a: any, c: any) => {
	let b: any = [];
	a.match(/../gu).forEach((c: any) => {
		let d = c.codePointAt(0), e = c.codePointAt(1);
		for (let a = d; a <= e; a++)
		{
			b.push(String.fromCodePoint(a));
		}
	}), b.forEach((a: any, b: any) => {
		lD[a] = [15 - 8 * c, b];
	});
});

export function decode(h: any)
{
	let c = h.length, i = new Uint8Array(Math.floor(15 * c / 8)), d = 0, a = 0, e = 0;
	for (let b = 0; b < c; b++)
	{
		let f = h.charAt(b);
		f in lD || th("Invalid char:" + f);
		let [j, k] = lD[f];
		15 !== j && b !== c - 1 && th("Sec. char found before EOI at: " + String(b));
		for (let g = j - 1; g >= 0; g--)
		{
			let l = k >> g & 1;
			a = (a << 1) + l, 8 == ++e && (i[d] = a, d++, a = 0, e = 0);
		}
	}
	return a !== (1 << e) - 1 && th("Padding mismatch"), String.fromCharCode.apply(null, new Uint8Array(i.buffer, 0, d) as any)
}