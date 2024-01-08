import { board_2d, castling_options } from "./board";
import { EMPTY_PIECE, Piece, PieceColor, PieceType } from "./piece";

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

    get castling_options(): castling_options {
        let options: castling_options = {
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

    get enpassant_piece(): (Piece | undefined) {
        const board = this.board;

        if (this.enpassant_str == '-') return undefined;

        const col: number = this.algToCol(this.enpassant_str);
        const row: number = this.algToRow(this.enpassant_str);

        if (row == -1)
            throw Error("Invalid rank number when parsing FEN string.");

        if (col == -1)
            throw Error("Invalid file letter when parsing FEN string.");

        return board[row][col];
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

    // takes in a position algebraic notation and returns it's rank as a number
    private algToRow(algNot: string): number {
        switch (algNot[0]) {
            case '8': return 0;
            case '7': return 1;
            case '6': return 2;
            case '5': return 3;
            case '4': return 4;
            case '3': return 5;
            case '2': return 6;
            case '1': return 7;
            default: return -1;
        }
    }

    // takes in a position algebraic notation and returns it's file as a number
    private algToCol(algNot: string): number {
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
