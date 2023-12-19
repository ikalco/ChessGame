import { Piece, PieceColor } from "piece"

export class Board {
	// defines and initializes class properties in constructor
	constructor(
		private _board: (Piece | undefined)[][],
		public active_color: PieceColor,
		public castling: string,
		public enpassant_col: number,
		public enpassant_row: number,
		public halfmove: number,
		public fullmove: number,
	) { }

	get pieces(): (Piece | undefined)[] {
		// native js array function,
		// turns 2d array into 1d array and also removes empty elements, so convenient
		return this._board.flat();
	}

	at(row: number, col: number): (Piece | undefined) {
		if (this._board[row] != undefined)
			return this._board[row][col];
		else
			return undefined;
	}

	move(from_row: number, from_col: number, to_row: number, to_col: number): boolean {
		// skip if out of bounds
		if (from_col < 0 || from_col > 7 ||
			from_row < 0 || from_row > 7 ||
			to_col < 0 || to_col > 7 ||
			to_row < 0 || to_row > 7
		) return false;

		// skip if moving to same position
		if (from_col == to_col && from_row == to_row) return false;

		// skip if not moving an actual piece
		if (typeof this._board[from_row][from_col] === undefined) return false;

		// actually move piece
		this._board[to_row][to_col] = this._board[from_row][from_col];

		// update piece col & row
		this._board[to_row][to_col]!.col = to_col;
		this._board[to_row][to_col]!.row = to_row;

		// delete old one from board
		delete this._board[from_row][from_col];

		return true;
	}
}
