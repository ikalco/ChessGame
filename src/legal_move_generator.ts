import { Board } from "./board";
import { Move } from "./move";
import { EMPTY_PIECE, Piece, PieceColor, PieceType } from "./piece";
import { PseduoLegalMoveGenerator, attack_2d } from "./pseudo_move_generator";

export class LegalMoveGenerator {
    private pseudo_gen: PseduoLegalMoveGenerator;

    constructor(private board: Board) {
        this.pseudo_gen = new PseduoLegalMoveGenerator(board);
    }

    private gen_moves_active(): Move[] {
        return this.pseudo_gen.gen_moves(
            this.board.active_color == PieceColor.WHITE ?
                this.board.whites :
                this.board.blacks
        );
    }

    private gen_moves_inactive(): Move[] {
        return this.pseudo_gen.gen_moves(
            this.board.active_color == PieceColor.WHITE ?
                this.board.blacks :
                this.board.whites
        );
    }

    private gen_attacking(): attack_2d {
        const moves = this.pseudo_gen.gen_attacked(
            this.board.active_color == PieceColor.WHITE ?
                this.board.blacks :
                this.board.whites
        );

        const attacks: attack_2d = new Array(8).fill(0).map((_) => new Array(8).fill(false));

        // then we transform move list to attack_2d
        for (const move of moves) {
            attacks[move.to_row][move.to_col] = true;
        }

        return attacks;
    }

    // TODO: redo this since it's copied from old BAD code
    private direction_to_piece(from: Piece, to: Piece) {
        let rowOff = to.row - from.row;
        rowOff /= Math.abs(rowOff) == 0 ? 1 : Math.abs(rowOff);
        let colOff = to.col - from.col;
        colOff /= Math.abs(colOff) == 0 ? 1 : Math.abs(colOff);

        return [rowOff, colOff];
    }

    private get_checking_piece(king: Piece, inactive: Move[]): Piece {
        let checking_piece: Piece = EMPTY_PIECE;

        for (const move of inactive) {
            if (move.to_row == king.row && move.to_col == king.col) {
                checking_piece = this.board.at(move.from_row, move.from_col);
                break;
            }
        }

        if (checking_piece == EMPTY_PIECE) throw Error("Checking piece doesn't exist even though we're in check.");

        return checking_piece;
    }

    // ensure king isn't left or placed in check
    private filter_moves_check(active: Move[], inactive: Move[], attacked: attack_2d): Move[] {
        const king = this.board.active_color == PieceColor.WHITE ? this.board.white_king : this.board.black_king;

        // if the king is not attacked (ie. in check), then return all moves
        if (!attacked[king.row][king.col]) return active;

        const checking_piece: Piece = this.get_checking_piece(king, inactive);

        // so that we don't add the same move in twice
        const allowed_moves: Set<Move> = new Set<Move>();

        // allow moves that MOVE king out of check
        const king_moves = active.filter(move => this.board.at(move.from_row, move.from_col).type == PieceType.KING);
        for (const move of king_moves) {
            if (!attacked[move.to_row][move.to_col]) allowed_moves.add(move);
        }

        const [row_change, col_change] = this.direction_to_piece(king, checking_piece);

        for (const move of active) {
            // allow moves that CAPTURE the piece that's delivering check
            if (move.taking &&
                move.to_row == checking_piece.row &&
                move.to_col == checking_piece.col
            ) allowed_moves.add(move);

            // allow moves that BLOCK the check (ie. checking piece is rook, bishop, or queen)
            if (checking_piece.type != PieceType.ROOK &&
                checking_piece.type != PieceType.BISHOP &&
                checking_piece.type != PieceType.QUEEN
            ) continue;

            for (let dist = 1; dist < 8; dist++) {
                const to_row = king.row + row_change * dist;
                const to_col = king.col + col_change * dist;

                // if reached checking piece or edge then stop
                // because you can't block it anymore
                if (to_row == checking_piece.row && to_col == checking_piece.col) break;
                if (!this.board.exists(to_row, to_col)) break;

                if (move.from_row == king.row && move.from_col == king.col) break;

                if (move.to_row == to_row && move.to_col == to_col)
                    allowed_moves.add(move);
            }
        }

        return Array.from(allowed_moves);
    }

    private moves_pinning(active: Move[], inactive: Move[], attacked: attack_2d): Move[] {
        return active;
    }

    gen_legal_moves(): Move[] {
        const active: Move[] = this.gen_moves_active();
        const inactive: Move[] = this.gen_moves_inactive();
        const attacked: attack_2d = this.gen_attacking();

        const moves_check = this.filter_moves_check(active, inactive, attacked);
        const moves_pinning = this.moves_pinning(moves_check, inactive, attacked);

        return moves_pinning;
    }
}