class Board {
	constructor() {
		// 2d 8x8 array
		this.board = new Array(8).fill(0).map((_) => new Array(8));
		this.loaded = false;
	}

	boardArrayFromPlacementFEN(placement) {
		/*
		 * Straight from the Wiki

		 Each rank is described, starting with rank 8 and ending with
		 rank 1, with a "/" between each one; within each rank, the contents of the squares
		 are described in order from the a-file to the h-file. Each piece is identified by a
		 single letter taken from the standard English names in algebraic notation
		 (pawn = "P", knight = "N", bishop = "B", rook = "R", queen = "Q" and king = "K").
		 White pieces are designated using uppercase letters ("PNBRQK"), while black pieces
		 use lowercase letters ("pnbrqk"). A set of one or more consecutive empty squares
		 within a rank is denoted by a digit from "1" to "8", corresponding to the number
		 of squares.
		*/

		const board = new Array(8).fill(0).map((_) => new Array(8));

		const rows = placement.split("/");
		for (let row_index = 7; row_index >= 0; row_index--) {
			const row = rows[row_index];
			for (let col_index = 0; col_index < 8; col_index++) {
				const piece_letter = row[col_index];

				let team;
				if (piece_letter.toLowerCase() == piece_letter) {
					team = Piece.BLACK;
				} else {
					team = Piece.WHITE;
				}

				let type;
				switch (piece_letter.toLowerCase()) {
					case 'p':
						type = Piece.PAWN;
						break;
					case 'n':
						type = Piece.KNIGHT;
						break;
					case 'b':
						type = Piece.BISHOP;
						break;
					case 'r':
						type = Piece.ROOK;
						break;
					case 'q':
						type = Piece.QUEEN;
						break;
					case 'k':
						type = Piece.KING;
						break;
					default:
						// is a number
						if (!isNaN(piece_letter)) {
							col_index += parseInt(piece_letter);
							continue;
						} else {
							console.error("Invalid FEN placement character: " + piece_letter)
						}
						break;
				}

				board[row_index][col_index] = new Piece(row_index, col_index, team, type);
			}
		}

		return board;
	}

	loadFromFEN(fenString) {
		// https://en.wikipedia.org/wiki/Forsyth-Edwards_Notation

		let [placement, active_color, castling, enpassant, halfmove, fullmove] = fenString.split(' ');

		this.board = this.boardArrayFromPlacementFEN(placement);

		if (active_color == 'w') {
			this.active_team = Piece.WHITE;
		} else if (active_color == 'b') {
			this.active_team = Piece.BLACK;
		} else {
			this.active_team = null;
			console.error("Invalid FEN active color");
		}

		if (castling != "-") {
			this.castling = castling;
		} else {
			this.castling = null;
		}

		if (enpassant != '-') {
			this.enpassant_col = this.algebraicNotationToCol(enpassant);
			this.enpassant_row = this.algebraicNotationToRow(enpassant);
		} else {
			this.enpassant_col = null;
			this.enpassant_row = null;
		}

		this.halfmove = window.parseInt(halfmove);
		this.fullmove = window.parseInt(fullmove);
	}

	algebraicNotationToRow(algNot) {
		return 8 - parseInt(algNot[1]);
	}

	algebraicNotationToCol(algNot) {
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
