import { EMPTY_PIECE, Piece, PieceColor, PieceType } from "./piece";
import { Move } from "./move";

export type board_2d = (Piece)[][];

export type castling_options = {
    black_queen: boolean;
    black_king: boolean;
    white_queen: boolean;
    white_king: boolean;
};

export class Board {
    // internal arrays to keep track of different piece types
    private _whites: Piece[];
    private _blacks: Piece[];
    private _pawns: Piece[];
    private _rooks: Piece[];
    private _knights: Piece[];
    private _bishops: Piece[];
    private _kings: Piece[];
    private _queens: Piece[];

    constructor(
        private _board: board_2d,
        private move_list: Move[],
        public active_color: PieceColor,
        public castling_options: castling_options,
        public halfmove_counter: number,
    ) {
        this._whites = [];
        this._blacks = [];
        this._pawns = [];
        this._rooks = [];
        this._knights = [];
        this._bishops = [];
        this._kings = [];
        this._queens = [];

        const pieces = this.pieces;

        for (let i = 0; i < pieces.length; i++) {
            switch (pieces[i].type) {
                case PieceType.PAWN: this._pawns.push(pieces[i]); break;
                case PieceType.ROOK: this._rooks.push(pieces[i]); break;
                case PieceType.KNIGHT: this._knights.push(pieces[i]); break;
                case PieceType.BISHOP: this._bishops.push(pieces[i]); break;
                case PieceType.KING: this._kings.push(pieces[i]); break;
                case PieceType.QUEEN: this._queens.push(pieces[i]); break;
            }

            if (pieces[i].color == PieceColor.WHITE) this._whites.push(pieces[i]);
            if (pieces[i].color == PieceColor.BLACK) this._blacks.push(pieces[i]);
        }
    }

    // returns a flat array of all the pieces in the board
    get pieces(): Piece[] {
        const pieces: Piece[] = [];

        for (let i = 0; i < this._board.length; i++) {
            for (let j = 0; j < this._board[i].length; j++) {
                if (this._board[i][j] != EMPTY_PIECE) pieces.push(this._board[i][j]!);
            }
        }

        return pieces;
    }

    get whites(): Piece[] { return this._whites; }
    get blacks(): Piece[] { return this._blacks; }
    get pawns(): Piece[] { return this._pawns; }
    get rooks(): Piece[] { return this._rooks; }
    get knights(): Piece[] { return this._knights; }
    get bishops(): Piece[] { return this._bishops; }
    get kings(): Piece[] { return this._kings; }
    get queens(): Piece[] { return this._queens; }
    get white_king(): Piece { return this._kings.filter((piece) => piece.color == PieceColor.WHITE)[0]; }
    get white_queen(): Piece { return this._queens.filter((piece) => piece.color == PieceColor.WHITE)[0]; }
    get black_king(): Piece { return this._kings.filter((piece) => piece.color == PieceColor.BLACK)[0]; }
    get black_queen(): Piece { return this._queens.filter((piece) => piece.color == PieceColor.BLACK)[0]; }

    // returns last move in move list
    get last_move(): (Move | undefined) {
        return this.move_list.at(this.move_list.length - 1);
    }

    // returns last moved piece based on last_move
    get last_moved_piece(): (Piece | undefined) {
        if (this.last_move == undefined) return undefined;
        return this.at(this.last_move.to_row, this.last_move.to_col);
    }

    // returns what is at the row and column
    at(row: number, col: number): (Piece) {
        if (this.exists(row, col))
            return this._board[row][col];
        else
            throw Error("Tried to access undefined piece in board.");
    }

    exists(row: number, col: number) {
        return this._board[row] != undefined && this._board[row][col] != undefined;
    }

    // checks if square is empty
    isEmpty(row: number, col: number) {
        return this.at(row, col) == EMPTY_PIECE;
    }

    // checks if square is an actual piece
    isPiece(row: number, col: number) {
        return this.at(row, col) != EMPTY_PIECE;
    }

    // deletes a piece at a given square position
    delete(row: number, col: number) {
        const piece = this._board[row][col]!;

        // update internal arrays
        switch (piece.type) {
            case PieceType.EMPTY: return;
            case PieceType.PAWN: this._pawns = this._pawns.filter(pawn => pawn != piece); break;
            case PieceType.ROOK: this._rooks = this._rooks.filter(rook => rook != piece); break;
            case PieceType.KNIGHT: this._knights = this._knights.filter(knight => knight != piece); break;
            case PieceType.BISHOP: this._bishops = this._bishops.filter(bishop => bishop != piece); break;
            case PieceType.KING: this._kings = this._kings.filter(king => king != piece); break;
            case PieceType.QUEEN: this._queens = this._queens.filter(queen => queen != piece); break;
        }

        if (piece.color == PieceColor.WHITE) this._whites.filter(white => white != piece);
        if (piece.color == PieceColor.BLACK) this._blacks.filter(black => black != piece);

        // make square empty
        this._board[row][col] = EMPTY_PIECE;
    }

    // moves a piece from one square to another
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
        if (this._board[from_row][from_col] == EMPTY_PIECE) return false;

        // delete piece in square being moved to
        this.delete(to_row, to_col);

        // move original piece to new square
        this._board[to_row][to_col] = this._board[from_row][from_col];

        // update original piece's col, row, and moved
        this._board[to_row][to_col]!.col = to_col;
        this._board[to_row][to_col]!.row = to_row;
        this._board[to_row][to_col]!.moved = true;

        // make original square empty
        this._board[from_row][from_col] = EMPTY_PIECE;

        return true;
    }

    // add move to top of move_list
    add_move(move: Move) {
        this.move_list.push(move);
    }
}
