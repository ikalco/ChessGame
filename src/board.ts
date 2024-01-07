import { Piece, PieceColor } from "./piece"

export type board_2d = (Piece | undefined)[][]

export type castling_options = {
    black_queen: boolean;
    black_king: boolean;
    white_queen: boolean;
    white_king: boolean;
}

export class Board {
    // defines and initializes class properties in constructor
    constructor(
        private _board: board_2d,
        public active_color: PieceColor,
        public castling: string,
        public enpassant_piece: (Piece | undefined),
        public halfmove: number,
        public fullmove: number,
    ) { }

    // returns a flat list of all the pieces
    get pieces(): Piece[] {
        // turns 2d array into 1d array and also removes empty elements
        const pieces: Piece[] = [];

        for (let i = 0; i < this._board.length; i++) {
            for (let j = 0; j < this._board[i].length; j++) {
                if (this._board[i][j] !== undefined) pieces.push(this._board[i][j]!);
            }
        }

        return pieces;
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
        if (this._board[from_row][from_col] === undefined) return false;

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
