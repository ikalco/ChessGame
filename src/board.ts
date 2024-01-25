import { EMPTY_PIECE, Piece, PieceColor, PieceType } from "./piece";
import { Move, MoveType } from "./move";

export type board_2d = (Piece)[][];

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

    private deleted: Piece[];

    private prev_halfmove_counter: number;

    constructor(
        private _board: board_2d,
        private move_list: Move[],
        public active_color: PieceColor,
        public halfmove_counter: number,
        public fullmove_counter: number
    ) {
        this.deleted = [];

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

        this.prev_halfmove_counter = this.halfmove_counter;
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

    // get number of moves
    get num_moves(): number {
        return this.move_list.length;
    }

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

    // add move to top of move_list
    add_move(move: Move) {
        this.move_list.push(move);
    }

    move(move: Move) {
        if (this.at(move.from_row, move.from_col).type == PieceType.PAWN || move.taking == true) {
            this.prev_halfmove_counter = this.halfmove_counter;
            this.halfmove_counter = 0;
        }
        else this.halfmove_counter++;

        if (this.active_color == PieceColor.BLACK) this.fullmove_counter++;

        switch (move.type) {
            case MoveType.Normal: this._move_normal(move); break;
            case MoveType.Castling: this._move_castling(move); break;
            case MoveType.EnPassant: this._move_enpassant(move); break;
            case MoveType.PawnDouble: this._move_pawndouble(move); break;
            case MoveType.Promotion: this._move_promotion(move); break;
            default: throw Error("Invalid move type.");
        }

        this.move_list.push(move);
        this.active_color = this.active_color == PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    }

    unmove() {
        if (this.move_list.length == 0) throw Error("Unable to undo last move as it doesn't exist.");

        const prev_move: Move = <Move>this.last_move;

        switch (prev_move.type) {
            case MoveType.Normal: this._unmove_normal(prev_move); break;
            case MoveType.Castling: this._unmove_castling(prev_move); break;
            case MoveType.EnPassant: this._unmove_enpassant(prev_move); break;
            case MoveType.PawnDouble: this._unmove_pawndouble(prev_move); break;
            case MoveType.Promotion: this._unmove_promotion(prev_move); break;
            default: throw Error("Invalid move type.");
        }

        this.move_list.pop();
        this.active_color = this.active_color == PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;

        if (this.active_color == PieceColor.BLACK) this.fullmove_counter--;

        if (this.at(prev_move.from_row, prev_move.from_col).type == PieceType.PAWN || prev_move.taking == true) this.halfmove_counter = this.prev_halfmove_counter;
        else this.halfmove_counter--;

        if (prev_move.first_move == true) this.at(prev_move.from_row, prev_move.from_col).moved = false;
        else this.at(prev_move.from_row, prev_move.from_col).moved = true;
    }

    // deletes a piece at a given square position
    delete(row: number, col: number) {
        const piece = this.at(row, col);

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

        if (piece.color == PieceColor.WHITE) this._whites = this._whites.filter(white => white != piece);
        if (piece.color == PieceColor.BLACK) this._blacks = this._blacks.filter(black => black != piece);

        this.deleted.push(piece);

        // make square empty
        this._board[row][col] = EMPTY_PIECE;
    }

    // moves a piece from one square to another
    private _move(from_row: number, from_col: number, to_row: number, to_col: number) {
        // skip if out of bounds
        if (from_col < 0 || from_col > 7 ||
            from_row < 0 || from_row > 7 ||
            to_col < 0 || to_col > 7 ||
            to_row < 0 || to_row > 7
        ) return;

        // skip if moving to same position
        if (from_col == to_col && from_row == to_row) return;

        // skip if not moving an actual piece
        if (this.isEmpty(from_row, from_col)) return;

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
    }

    private _move_normal(move: Move) {
        this._move(move.from_row, move.from_col, move.to_row, move.to_col);
    }

    private _move_castling(move: Move) {
        this._move(move.from_row, move.from_col, move.to_row, move.to_col);

        if (move.to_col == 2) this._move(move.from_row, 0, move.to_row, 3); // queen side
        if (move.to_col == 6) this._move(move.from_row, 7, move.to_row, 5); // king side
    }

    private _move_enpassant(move: Move) {
        this._move(move.from_row, move.from_col, move.to_row, move.to_col);
        this.delete(move.from_row, move.to_col);
    }

    private _move_pawndouble(move: Move) {
        this._move(move.from_row, move.from_col, move.to_row, move.to_col);
    }

    private _move_promotion(move: Move) {
        if (move.promotion_type != PieceType.QUEEN &&
            move.promotion_type != PieceType.ROOK &&
            move.promotion_type != PieceType.BISHOP &&
            move.promotion_type != PieceType.KNIGHT
        ) throw Error("Invalid piece type for promotion move.");

        this._move(move.from_row, move.from_col, move.to_row, move.to_col);
        this.at(move.to_row, move.to_col).type = move.promotion_type;
    }

    private _unmove_normal(move: Move) {
        this._move(move.to_row, move.to_col, move.from_row, move.from_col);

        if (move.taking) this._board[move.to_row][move.to_col] = <Piece>this.deleted.pop();
    }

    private _unmove_castling(move: Move) {
        this._move(move.to_row, move.to_col, move.from_row, move.from_col);

        if (move.to_col == 2) {
            this._move(move.from_row, 3, move.to_row, 0); // queen side
            this.at(move.to_row, 0).moved = false;
        }
        if (move.to_col == 6) {
            this._move(move.from_row, 5, move.to_row, 7); // king side
            this.at(move.to_row, 7).moved = false;
        }
    }

    private _unmove_enpassant(move: Move) {
        this._move(move.to_row, move.to_col, move.from_row, move.from_col);

        // don't have to check for taking because it's en passant
        this._board[move.from_row][move.to_col] = <Piece>this.deleted.pop();
    }

    private _unmove_pawndouble(move: Move) {
        this._move(move.to_row, move.to_col, move.from_row, move.from_col);
    }

    private _unmove_promotion(move: Move) {
        this._move(move.to_row, move.to_col, move.from_row, move.from_col);
        this.at(move.from_row, move.from_col).type = PieceType.PAWN;
    }
}
