const g_iDoubleQuoteCharacter = 34; // '"'
const g_iAmpCharacter = 38; // '&'
const g_iSingleQuoteCharacter = 39; // '''
const g_iLessThanCharacter = 60; // '<'
const g_iGreaterThanCharacter = 62; // '>'

const sizeAsciiTable =
[
	1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,
	1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,
	1,   1,   6,   1,   1,   1,   5,   6,   1,   1,   1,   1,   1,   1,   1,   1,
	1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   4,   1,   4,   1,
	1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,
	1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,
	1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,
	1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,
	1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,
	1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,
	1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,
	1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,
	1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,
	1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,
	1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,
	1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1
];

let escapeHtmlSymbols = function (str) {
	let result = undefined;

	/* let aPositions = []; */
	let aPositionsObject = {};
	let strLength = 0;
	let bWasFound = false;

	for(let i = 0, l = str.length, ch = undefined, replacementLength = undefined; i < l; i++) {
		ch = str.charCodeAt(i);
		if(ch < 0x0080) {
			replacementLength = sizeAsciiTable[ch];

			if(replacementLength > 1) {
				/* aPositions.push(strLength); */
				aPositionsObject[strLength] = null;
				bWasFound = true;
			}

			strLength += replacementLength;
		}
		else if(ch < 0x0800) strLength += 2;
		else if(ch < 0xD800) strLength += 3;
		else if(ch < 0xDC00) {
			i++;
			if(i < l) {
				ch = str.charCodeAt(i);
				if(ch >= 0xDC00 && ch <= 0xDFFF) {
					strLength += 4;
					continue;
				}
			}
			else {
				return result; // bad sequency
			}
		}
		else if(ch < 0xE000) {
			return result; // bad sequency
		}
		else {
			strLength += 3;
		}
	}

	if(!bWasFound) return result;
	if(str.length === strLength) return result;

	let buffer = new ArrayBuffer(strLength);

	let view = new Uint8Array(buffer);
	let uint8Array = new TextEncoder().encode(str);

	let _iLastFoundIndex = 0;

	for(let i = 0, l = 0; i < strLength; i++) {
		if(aPositionsObject[l] === undefined) {
			view[l] = uint8Array[i];
			l++;
		}
		else {
			switch(uint8Array[i]) {
				case g_iDoubleQuoteCharacter: {
					view[l] = 38; // '&'
					view[l+=1] = 113; // 'q'
					view[l+=1] = 117; // 'u'
					view[l+=1] = 111; // 'o'
					view[l+=1] = 116; // 't'
					view[l+=1] = 59; // ';'
					l++;
					break;
				}
				case g_iAmpCharacter: {
					view[l] = 38; // '&'
					view[l+=1] = 97; // 'a'
					view[l+=1] = 109; // 'm'
					view[l+=1] = 112; // 'p'
					view[l+=1] = 59; // ';'
					l++;
					break;
				}
				case g_iSingleQuoteCharacter: {
					view[l] = 38; // '&'
					view[l+=1] = 97; // 'a'
					view[l+=1] = 112; // 'p'
					view[l+=1] = 111; // 'o'
					view[l+=1] = 115; // 's'
					view[l+=1] = 59; // ';'
					l++;
					break;
				}
				case g_iLessThanCharacter: {
					view[l] = 38; // '&'
					view[l+=1] = 108; // 'l'
					view[l+=1] = 116; // 't'
					view[l+=1] = 59; // ';'
					l++;
					break;
				}
				case g_iGreaterThanCharacter: {
					view[l] = 38; // '&'
					view[l+=1] = 103; // 'g'
					view[l+=1] = 116; // 't'
					view[l+=1] = 59; // ';'
					l++;
					break;
				}
			}
		}
	}

	result = new TextDecoder().decode(view);
 
	_iLastFoundIndex = undefined;
	uint8Array = undefined;
	view = undefined;
	buffer = undefined;
	bWasFound = undefined;
	strLength = undefined;
	aPositionsObject = undefined;

	return result;
}