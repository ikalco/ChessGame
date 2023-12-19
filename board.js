class Board {
	// 2d array representing the actual chess board using Piece objects
	#board;

	// the active color/team either white or black
	#active_color;

	// not currently defined, but will probably be boolean of which team has castled so far
	// similar to how FEN represents it
	#castling;

	// last moved pawn position
	#enpassant_col;
	#enpassant_row;

	// halfmoves counted, basically each piece moved
	#halfmove;

	// fullmoves counted, basically each piece moved by black
	#fullmove;

	constructor() {
		// empty 2d 8x8 array
		this.#board = new Array(8).fill(0).map((_) => new Array(8));
	}

	set board(board) {
		// return of console error just exits function and prints error

		// 8 rows
		if (!(board instanceof Array) && board.length != 8)
			return console.error("Invalid board:", board);

		for (const row of board) {
			// each row has 8 columns
			if (!(board instanceof Array) || board.length != 8)
				return console.error("Invalid board due to invalid row:", row);

			for (const cell of row) {
				// each cell is a piece or empty
				if (!(cell instanceof Piece) && cell != undefined)
					return console.error("Invalid board due to invalid cell: ", cell);
			}
		}

		this.#board = board;
	}

	get pieces() {
		// native js array function,
		// turns 2d array into 1d array and also removes empty elements, so convenient
		return this.#board.flat();
	}

	at(row, col) {
		if (this.#board[row] != undefined)
			return this.#board[row][col];
	}

	move(from_row, from_col, to_row, to_col) {
		// skip if out of bounds
		if (from_col < 0 || from_col > 7 ||
			from_row < 0 || from_row > 7 ||
			to_col < 0 || to_col > 7 ||
			to_row < 0 || to_row > 7
		) return;

		// skip if moving to same position
		if (from_col == to_col && from_row == to_row) return;

		// skip if not moving an actual piece
		if (!(this.#board[from_row][from_col] instanceof Piece)) return;

		// actually move piece
		this.#board[to_row][to_col] = this.#board[from_row][from_col];

		// update piece col & row
		this.#board[to_row][to_col].col = to_col;
		this.#board[to_row][to_col].row = to_row;

		// delete old one from board
		delete this.#board[from_row][from_col];
	}
}
