import { ChessNotation } from "./chess_notation.js";
import { Board, board_2d } from "./board.js";
import { Piece, PieceColor, PieceType } from "./piece.js";

export class FEN implements ChessNotation.BoardNotation {
	constructor(public raw_string: string) { }

	load(): Board {
		let [placement_str, active_color_str, castling_str, enpassant_str, halfmove_str, fullmove_str] = this.raw_string.split(' ');

		const board: board_2d = this.boardArrayFromPlacementFEN(placement_str);

		let active_color: PieceColor;
		if (active_color_str == 'w') {
			active_color = PieceColor.WHITE;
		} else if (active_color_str == 'b') {
			active_color = PieceColor.BLACK;
		} else {
			throw new Error("Invalid active color in FEN string");
		}

		let enpassant_piece: (Piece | undefined) = undefined;
		if (enpassant_str != '-') {
			const col: number = ChessNotation.algToCol(enpassant_str);
			const row: number = ChessNotation.algToRow(enpassant_str);

			if (board[row] != undefined)
				enpassant_piece = board[row][col];
		}

		const halfmove: number = Number(halfmove_str);
		const fullmove: number = Number(fullmove_str);

		return new Board(board, active_color, castling_str, enpassant_piece, halfmove, fullmove);
	}

	print(): void {
		console.log(this.raw_string);
	}

	private boardArrayFromPlacementFEN(placement: string): board_2d {
		const board: board_2d = new Array(8).fill(0).map((_) => new Array(8));

		const rows: string[] = placement.split("/");

		for (let row_index = 0; row_index < 8; row_index++) {
			const row: string = rows[row_index];

			for (let col_index = 0; col_index < 8; col_index++) {
				const piece_letter: string = row[col_index];
				const color: PieceColor = this.colorFromLetterFEN(piece_letter);
				const type: (PieceType | undefined) = this.typeFromLetterFEN(piece_letter);

				if (type === undefined) {
					// if it's not a piece, it's a number and we skip N cells since they're empty
					col_index += Number(piece_letter);
					continue;
				}

				board[row_index][col_index] = {
					row: row_index,
					col: col_index,
					color: color,
					type: type
				};
			}
		}

		return board;
	}

	private colorFromLetterFEN(letter: string): PieceColor {
		if (letter.toLowerCase() == letter) {
			// black pieces are lowercase
			return PieceColor.BLACK;
		} else {
			// white pieces are uppercase
			return PieceColor.WHITE;
		}
	}

	private typeFromLetterFEN(letter: string): (PieceType | undefined) {
		switch (letter.toLowerCase()) {
			case 'p':
				return PieceType.PAWN;
			case 'n':
				return PieceType.KNIGHT;
			case 'b':
				return PieceType.BISHOP;
			case 'r':
				return PieceType.ROOK;
			case 'q':
				return PieceType.QUEEN;
			case 'k':
				return PieceType.KING;
			default:
				return undefined;
		}
	}
}
