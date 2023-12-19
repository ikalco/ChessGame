class ChessNotation {
	static boardFromFEN(fen_string) {
		// https://en.wikipedia.org/wiki/Forsyth-Edwards_Notation
		const board = new Board();

		let [placement, active_color, castling, enpassant, halfmove, fullmove] = fen_string.split(' ');

		board.board = ChessNotation.#boardArrayFromPlacementFEN(placement);

		if (active_color == 'w') {
			board.active_color = Piece.WHITE;
		} else if (active_color == 'b') {
			board.active_color = Piece.BLACK;
		} else {
			board.active_color = null;
			console.error("Invalid FEN active color");
		}

		if (castling != "-") {
			board.castling = castling;
		} else {
			board.castling = null;
		}

		if (enpassant != '-') {
			board.enpassant_col = ChessNotation.#algToCol(enpassant);
			board.enpassant_row = ChessNotation.#algToRow(enpassant);
		} else {
			board.enpassant_col = null;
			board.enpassant_row = null;
		}

		board.halfmove = window.parseInt(halfmove);
		board.fullmove = window.parseInt(fullmove);

		return board;
	}

	static #boardArrayFromPlacementFEN(placement) {
		const board = new Array(8).fill(0).map((_) => new Array(8));

		const rows = placement.split("/");

		for (let row_index = 0; row_index < 8; row_index++) {
			const row = rows[row_index];

			for (let col_index = 0; col_index < 8; col_index++) {
				const piece_letter = row[col_index];

				const color = ChessNotation.#colorFromLetterFEN(piece_letter);

				const type = ChessNotation.#typeFromLetterFEN(piece_letter);

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

	static #colorFromLetterFEN(letter) {
		if (letter.toLowerCase() == letter) {
			// black pieces are lowercase
			return Piece.BLACK;
		} else {
			// white pieces are uppercase
			return Piece.WHITE;
		}
	}

	static #typeFromLetterFEN(letter) {
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
	static #algToRow(algNot) {
		return 8 - window.parseInt(algNot[1]);
	}

	// takes in a string in algebraic notation and returns it's column
	static #algToCol(algNot) {
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
