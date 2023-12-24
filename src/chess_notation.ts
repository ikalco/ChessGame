import { Board } from "./board.js";

export namespace ChessNotation {
	export abstract class BoardNotation {
		constructor(public raw_string: string) { }

		abstract load(): Board;
		abstract print(): void;
	}

	// takes in a string in algebraic notation and returns it's row
	export function algToRow(algNot: string): number {
		return 8 - Number(algNot[1]);
	}

	// takes in a string in algebraic notation and returns it's column
	export function algToCol(algNot: string): number {
		switch (algNot[0]) {
			case 'a': return 0;
			case 'b': return 1;
			case 'c': return 2;
			case 'd': return 3;
			case 'e': return 4;
			case 'f': return 5;
			case 'g': return 6;
			case 'h': return 7;
			default: return -1;
		}
	}
}

