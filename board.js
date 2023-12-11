class Board {
	constructor() {
		// empty 2d 8x8 array
		this.board = new Array(8).fill(0).map((_) => new Array(8));
		this.loaded = false;
	}

	getPieces() {
		// native js array function,
		// turns 2d array into 1d array and also removes empty elements
		return this.board.flat();
	}

	colorFromLetterFEN(letter) {
		if (letter.toLowerCase() == letter) {
			// black pieces are lowercase
			return Piece.BLACK;
		} else {
			// white pieces are uppercase
			return Piece.WHITE;
		}
	}

	typeFromLetterFEN(letter) {
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

	boardArrayFromPlacementFEN(placement) {
		const board = new Array(8).fill(0).map((_) => new Array(8));

		const rows = placement.split("/");

		for (let row_index = 0; row_index < 8; row_index++) {
			const row = rows[row_index];

			for (let col_index = 0; col_index < 8; col_index++) {
				const piece_letter = row[col_index];

				const color = this.colorFromLetterFEN(piece_letter);

				const type = this.typeFromLetterFEN(piece_letter);

				if (type == -1 && !isNaN(piece_letter)) {
					// if it's a number (N), we skip N cells since they're empty
					col_index += window.parseInt(piece_letter);
				}

				board[row_index][col_index] = new Piece(row_index, col_index, color, type);
			}
		}

		return board;
	}

	loadFromFEN(fenString) {
		// https://en.wikipedia.org/wiki/Forsyth-Edwards_Notation

		let [placement, active_color, castling, enpassant, halfmove, fullmove] = fenString.split(' ');

		this.board = this.boardArrayFromPlacementFEN(placement);

		if (active_color == 'w') {
			this.active_color = Piece.WHITE;
		} else if (active_color == 'b') {
			this.active_color = Piece.BLACK;
		} else {
			this.active_color = null;
			console.error("Invalid FEN active color");
		}

		if (castling != "-") {
			this.castling = castling;
		} else {
			this.castling = null;
		}

		if (enpassant != '-') {
			this.enpassant_col = this.algToCol(enpassant);
			this.enpassant_row = this.algToRow(enpassant);
		} else {
			this.enpassant_col = null;
			this.enpassant_row = null;
		}

		this.halfmove = window.parseInt(halfmove);
		this.fullmove = window.parseInt(fullmove);
	}

	// takes in a string in algebraic notation and returns it's row
	algToRow(algNot) {
		return 8 - window.parseInt(algNot[1]);
	}

	// takes in a string in algebraic notation and returns it's column
	algToCol(algNot) {
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
