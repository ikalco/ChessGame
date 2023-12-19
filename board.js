class Board {
	// 2d array representing the actual chess board using Piece objects
	#board;

	// boolean value, whether board is loaded, with FEN for example
	#loaded;

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
		this.#loaded = false;
	}

	getPieces() {
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

	loadFromFEN(fenString) {
		// https://en.wikipedia.org/wiki/Forsyth-Edwards_Notation

		let [placement, active_color, castling, enpassant, halfmove, fullmove] = fenString.split(' ');

		this.#board = this.#boardArrayFromPlacementFEN(placement);

		if (active_color == 'w') {
			this.#active_color = Piece.WHITE;
		} else if (active_color == 'b') {
			this.#active_color = Piece.BLACK;
		} else {
			this.#active_color = null;
			console.error("Invalid FEN active color");
		}

		if (castling != "-") {
			this.#castling = castling;
		} else {
			this.#castling = null;
		}

		if (enpassant != '-') {
			this.#enpassant_col = this.#algToCol(enpassant);
			this.#enpassant_row = this.#algToRow(enpassant);
		} else {
			this.#enpassant_col = null;
			this.#enpassant_row = null;
		}

		this.#halfmove = window.parseInt(halfmove);
		this.#fullmove = window.parseInt(fullmove);
	}

	#boardArrayFromPlacementFEN(placement) {
		const board = new Array(8).fill(0).map((_) => new Array(8));

		const rows = placement.split("/");

		for (let row_index = 0; row_index < 8; row_index++) {
			const row = rows[row_index];

			for (let col_index = 0; col_index < 8; col_index++) {
				const piece_letter = row[col_index];

				const color = this.#colorFromLetterFEN(piece_letter);

				const type = this.#typeFromLetterFEN(piece_letter);

				if (type == -1 && !isNaN(piece_letter)) {
					// if it's a number (N), we skip N cells since they're empty
					col_index += window.parseInt(piece_letter);
					continue;
				}

				board[row_index][col_index] = new Piece(row_index, col_index, color, type);
			}
		}

		return board;
	}

	#colorFromLetterFEN(letter) {
		if (letter.toLowerCase() == letter) {
			// black pieces are lowercase
			return Piece.BLACK;
		} else {
			// white pieces are uppercase
			return Piece.WHITE;
		}
	}

	#typeFromLetterFEN(letter) {
		switch (letter.toLowerCase()) {
			case 'p':
				return Piece.PAWN;
			case 'n':
				return Piece.KNIGHT;
			case 'b':
				return Piece.BISHOP;
			case 'r':
				return Piece.ROOK;
			case 'q':
				return Piece.QUEEN;
			case 'k':
				return Piece.KING;
			default:
				return -1;
		}
	}

	// takes in a string in algebraic notation and returns it's row
	#algToRow(algNot) {
		return 8 - window.parseInt(algNot[1]);
	}

	// takes in a string in algebraic notation and returns it's column
	#algToCol(algNot) {
		const lookup = {
			'a': 1,
			'b': 2,
			'c': 3,
			'd': 4,
			'e': 5,
			'f': 6,
			'g': 7,
			'h': 8,
		}

		return lookup[str[0]] - 1;
	}
}
