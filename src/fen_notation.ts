import { AlgebraNotation } from "./algebra_notation.js";
import { Board, board_2d } from "./board.js";
import { MoveType } from "./move.js";
import { EMPTY_PIECE, Piece, PieceColor, PieceType } from "./piece.js";

export type fen_castling_options = {
    black_queen: boolean;
    black_king: boolean;
    white_queen: boolean;
    white_king: boolean;
};

// https://en.wikipedia.org/wiki/Forsyth-Edwards_Notation
export class FEN {
    private placement_str: string;
    private active_color_str: string;
    private castling_str: string;
    private enpassant_str: string;
    private halfmove_str: string;
    private fullmove_str: string;

    constructor(public raw_string: string) {
        let [placement_str, active_color_str, castling_str, enpassant_str, halfmove_str, fullmove_str] = this.raw_string.split(' ');

        this.placement_str = placement_str;
        this.active_color_str = active_color_str;
        this.castling_str = castling_str;
        this.enpassant_str = enpassant_str;
        this.halfmove_str = halfmove_str;
        this.fullmove_str = fullmove_str;
    }

    static from(board: Board): FEN {
        const placement_str = FEN.placement(board);
        const castling_str = FEN.castling(board);
        const enpassant_str = FEN.enpassant(board);

        const active_color_str = board.active_color == PieceColor.WHITE ? 'w' : 'b';
        const halfmove_str = board.halfmove_counter;
        const fullmove_str = board.fullmove_counter;

        const raw_string = `${placement_str} ${active_color_str} ${castling_str} ${enpassant_str} ${halfmove_str} ${fullmove_str}`;

        return new FEN(raw_string);
    }

    // no idea why I did it this way... but I already did it and it works
    private static placement(board: Board): string {
        const pieces = board.pieces;

        // convert string to editable array
        let placement: string[] = [..."________/________/________/________/________/________/________/________"];

        for (const piece of pieces) {
            let letter_type = "";

            switch (piece.type) {
                case PieceType.PAWN: letter_type = 'p'; break;
                case PieceType.ROOK: letter_type = 'r'; break;
                case PieceType.KNIGHT: letter_type = 'n'; break;
                case PieceType.BISHOP: letter_type = 'b'; break;
                case PieceType.KING: letter_type = 'k'; break;
                case PieceType.QUEEN: letter_type = 'q'; break;
            }

            if (piece.color == PieceColor.WHITE) letter_type = letter_type.toUpperCase();

            // calculate index at which to write character, it's by 9 because of the '/'
            placement[piece.col + (piece.row) * 9] = letter_type;
        }

        // convert from editable array to string
        let placement_str = placement.join('');

        // change underscores to actual numbers
        let count = 0;
        let start = -1;
        for (let i = 0; i < placement_str.length; i++) {
            const char = placement_str[i];

            // increment counter for '_' when we see one
            if (char == '_') count++;

            // set start of underscores if it's not set
            if (start == -1) start = i;

            // replace '_' with correct number when encountering non '_' and at the end of string
            if (char != '_' || i == placement_str.length - 1) {
                // if we haven't seen any '_' then just reset and continue at next character
                if (count == 0) {
                    start = -1;
                    continue;
                };

                // reform placement_str to remove counted '_' and replace with the actual number
                placement_str = placement_str.substring(0, start) + count + placement_str.substring(start + count);

                // adjust index counter for removing characters from string
                i -= count;

                // reset counting variables
                count = 0;
                start = -1;
            }
        }

        return placement_str;
    }

    private static castling(board: Board): string {
        let castling_str: string = "";

        if (board.at(7, 7).type == PieceType.ROOK && board.at(7, 7).moved == false) castling_str += "K";
        if (board.at(7, 0).type == PieceType.ROOK && board.at(7, 0).moved == false) castling_str += "Q";
        if (board.at(0, 7).type == PieceType.ROOK && board.at(0, 7).moved == false) castling_str += "k";
        if (board.at(0, 0).type == PieceType.ROOK && board.at(0, 0).moved == false) castling_str += "q";

        return castling_str;
    }

    // Not using "updated version of the spec" (from wiki) for compatibilty
    private static enpassant(board: Board): string {
        const last_move = board.last_move;

        if (last_move === undefined) return "-";

        if (last_move.type != MoveType.PawnDouble) return "-";

        const dir = board.last_moved_piece!.color == PieceColor.WHITE ? -1 : 1;

        return `${AlgebraNotation.fromCol(last_move.from_col)}${AlgebraNotation.fromRow(last_move.from_row + dir)}`;
    }

    get board(): board_2d {
        const board: board_2d = new Array(8).fill(0).map((_) => new Array(8));

        const rows: string[] = this.placement_str.split("/");

        if (rows.length != 8)
            throw Error("Wrong number of rows in piece placement data when parsing FEN string.");

        for (let row_index = 0; row_index < 8; row_index++) {
            const row: string = rows[row_index];

            let col_index = 0;
            for (let str_index = 0; str_index < row.length; str_index++) {
                if (col_index > 7)
                    throw Error(`Too many pieces at row ${row_index + 1} of piece placement data when parsing FEN string.`);

                const piece_letter: string = row[str_index];
                const color: PieceColor = this.colorFromLetterFEN(piece_letter);
                const type: (PieceType | undefined) = this.typeFromLetterFEN(piece_letter);

                if (type === undefined) {
                    // if it's not a piece and it's a number and we set N cells to empty
                    if (isNaN(Number(piece_letter)))
                        throw Error("Invalid piece letter in piece placement data when parsing FEN string.");

                    const num_empty = Number(piece_letter);
                    for (let i = 0; i < num_empty; i++) {
                        board[row_index][col_index + i] = EMPTY_PIECE;
                    }

                    col_index += Number(piece_letter);
                    continue;
                }

                board[row_index][col_index] = {
                    row: row_index,
                    col: col_index,
                    color: color,
                    type: type,
                    moved: false
                };

                col_index++;
            }
        }

        return board;
    }

    get active_color(): PieceColor {
        if (this.active_color_str == 'w') {
            return PieceColor.WHITE;
        } else if (this.active_color_str == 'b') {
            return PieceColor.BLACK;
        } else {
            throw Error("Invalid active color when parsing FEN string.");
        }
    }

    get castling_options(): fen_castling_options {
        let options: fen_castling_options = {
            black_king: false,
            black_queen: false,
            white_king: false,
            white_queen: false,
        };

        if (this.castling_str == '-') return options;

        if (this.castling_str.length > 4) throw Error("Invalid length for castling options string when parsing FEN string.");
        if (this.castling_str.match(/[^KQkq]/) != undefined) throw Error("Invalid character in castling options string when parsing FEN string.");
        if (/(.).*\1/.test(this.castling_str)) throw Error("Repeated character in castling options string when parsing FEN string.");

        if (this.castling_str.includes("K")) options.white_king = true;
        if (this.castling_str.includes("Q")) options.white_queen = true;
        if (this.castling_str.includes("k")) options.black_king = true;
        if (this.castling_str.includes("q")) options.black_queen = true;

        return options;
    }

    get enpassant_target_square(): (number[]) {
        if (this.enpassant_str == '-') return [];

        const row: number = AlgebraNotation.toRow(this.enpassant_str[1]);
        const col: number = AlgebraNotation.toCol(this.enpassant_str[0]);

        if (row == -1 || (row != 2 && row != 5))
            throw Error("Invalid rank number when parsing FEN string.");

        if (col == -1)
            throw Error("Invalid file letter when parsing FEN string.");

        return [row, col];
    }

    get halfmove(): number {
        if (isNaN(Number(this.halfmove_str)))
            throw Error("Invalid number for halfmoves when parsing FEN string.");
        else
            return Number(this.halfmove_str);
    }

    get fullmove(): number {
        if (isNaN(Number(this.fullmove_str)))
            throw Error("Invalid number for fullmoves when parsing FEN string.");
        else
            return Number(this.fullmove_str);
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
