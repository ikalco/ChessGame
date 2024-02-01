import { Board } from "./board.js";
import { Move, MoveType } from "./move.js";
import { EMPTY_PIECE, Piece, PieceColor, PieceType } from "./piece.js";
import { PseduoLegalMoveGenerator, attack_2d } from "./pseudo_move_generator.js";

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

    private in_check(attacked: attack_2d): boolean {
        // if the king is actively attacked then it's in check
        const king = this.board.active_color == PieceColor.WHITE ? this.board.white_king : this.board.black_king;

        return attacked[king.row][king.col];
    }

    // TODO: redo this since it's copied from old BAD code
    private direction_to_piece(from_row: number, from_col: number, to_row: number, to_col: number) {
        let rowOff = to_row - from_row;
        rowOff /= Math.abs(rowOff) == 0 ? 1 : Math.abs(rowOff);
        let colOff = to_col - from_col;
        colOff /= Math.abs(colOff) == 0 ? 1 : Math.abs(colOff);

        return [rowOff, colOff];
    }

    private get_checking_pieces(king: Piece, inactive: Move[]): Piece[] {
        let checking_pieces: Piece[] = [];

        for (const move of inactive) {
            if (move.to_row == king.row && move.to_col == king.col) {
                checking_pieces.push(this.board.at(move.from_row, move.from_col));
            }
        }

        if (checking_pieces.length == 0) throw Error("Checking piece doesn't exist even though we're in check.");

        return checking_pieces;
    }

    // ensure king isn't left or placed in check, after being check
    private moves_during_check(active: Move[], attacked: attack_2d): Move[] {
        const king = this.board.active_color == PieceColor.WHITE ? this.board.white_king : this.board.black_king;

        const inactive: Move[] = this.gen_moves_inactive();
        const checking_pieces: Piece[] = this.get_checking_pieces(king, inactive);

        // so that we don't add the same move in twice
        const allowed_moves: Set<Move> = new Set<Move>();

        for (const checking_piece of checking_pieces) {
            const [row_change, col_change] = this.direction_to_piece(king.row, king.col, checking_piece.row, checking_piece.col);

            for (const move of active) {
                // allow moves that MOVE king out of check
                if (this.board.at(move.from_row, move.from_col).type == PieceType.KING) {
                    if (!attacked[move.to_row][move.to_col]) allowed_moves.add(move);
                    else continue;
                }

                // allow moves that CAPTURE the piece that's delivering check, but only if there's only one checking piece
                if (move.taking &&
                    move.to_row == checking_piece.row &&
                    move.to_col == checking_piece.col &&
                    checking_pieces.length == 1
                ) {
                    allowed_moves.add(move);
                }

                // allow moves that BLOCK the check (only if checking piece is rook, bishop, or queen)
                if (checking_piece.type != PieceType.ROOK &&
                    checking_piece.type != PieceType.BISHOP &&
                    checking_piece.type != PieceType.QUEEN ||
                    checking_pieces.length != 1
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
        }

        return Array.from(allowed_moves);
    }

    // remove moves that will put king in check
    private remove_checked_moves(active: Move[], attacked: attack_2d): Move[] {
        const king = this.board.active_color == PieceColor.WHITE ? this.board.white_king : this.board.black_king;

        return active.filter((move) => {
            if (this.board.at(move.from_row, move.from_col) != king) return true;

            // if it's the king, and the move goes to or through an actively attacked space, 
            // then filter it out, otherwise it's allowed it

            if (move.type == MoveType.Castling &&
                attacked[king.row][king.col + (king.col + 2 == move.to_col ? 1 : -1)]
            ) return false;

            return !attacked[move.to_row][move.to_col];
        });
    }

    // only allow moves of pinned pieces that keep king safe
    private remove_pinned_moves(active: Move[], attacked: attack_2d): Move[] {
        const king = this.board.active_color == PieceColor.WHITE ? this.board.white_king : this.board.black_king;

        let moves = active;

        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];

        for (const [row_change, col_change] of dirs) {
            let friendly: (undefined | Piece) = undefined;

            for (let dist = 1; dist < 8; dist++) {
                const to_row = king.row + row_change * dist;
                const to_col = king.col + col_change * dist;

                // if it doesn't exist, it's the edge so go to other direction
                if (!this.board.exists(to_row, to_col)) break;

                // if empty then continue in direction
                if (this.board.isEmpty(to_row, to_col)) continue;

                const piece = this.board.at(to_row, to_col);

                // if encountered friendly piece, then set it and continue to look for pinning piece
                if (piece.color == king.color) {
                    // if there's two friendly pieces in the way, then pin isn't possible 
                    if (friendly != undefined) break;
                    friendly = piece;
                    continue;
                }

                // if encountered enemy piece before friendly, then no pins can happen in this direction
                if (friendly == undefined) break;

                // if enemy rook, and in same direction, then piece is pinned, so remove it's moves
                if (piece.type == PieceType.ROOK &&
                    (
                        (row_change == 1 && col_change == 0) ||
                        (row_change == -1 && col_change == 0) ||
                        (row_change == 0 && col_change == 1) ||
                        (row_change == 0 && col_change == -1)
                    )
                ) {
                    moves = moves.filter((move: Move) => {
                        if (this.board.at(move.from_row, move.from_col) != friendly) return true;

                        // if in same direction as pinning piece, then it's allowed as it maintains pin (and therefore king safety)
                        const [row_dir, col_dir] = this.direction_to_piece(move.from_row, move.from_col, move.to_row, move.to_col);
                        if (friendly.type != PieceType.KNIGHT &&
                            (
                                row_change == row_dir && col_change == col_dir ||
                                row_change == row_dir * -1 && col_change == col_dir * -1
                            )
                        ) return true;

                        return false;
                    });
                    break;
                }

                // same for bishop
                if (piece.type == PieceType.BISHOP &&
                    (
                        (row_change == 1 && col_change == 1) ||
                        (row_change == 1 && col_change == -1) ||
                        (row_change == -1 && col_change == 1) ||
                        (row_change == -1 && col_change == -1)
                    )
                ) {
                    moves = moves.filter((move: Move) => {
                        if (this.board.at(move.from_row, move.from_col) != friendly) return true;

                        // if in same direction as pinning piece, then it's allowed as it maintains pin (and therefore king safety)
                        const [row_dir, col_dir] = this.direction_to_piece(move.from_row, move.from_col, move.to_row, move.to_col);
                        if (friendly.type != PieceType.KNIGHT &&
                            (
                                row_change == row_dir && col_change == col_dir ||
                                row_change == row_dir * -1 && col_change == col_dir * -1
                            )
                        ) return true;

                        return false;
                    });
                    break;
                }

                // same for queen, except it can be all dirs so no need to check
                if (piece.type == PieceType.QUEEN) {
                    moves = moves.filter((move: Move) => {
                        if (this.board.at(move.from_row, move.from_col) != friendly) return true;

                        // if in same path as pinning piece, then it's allowed as it maintains pin (and therefore king safety)
                        const [row_dir, col_dir] = this.direction_to_piece(move.from_row, move.from_col, move.to_row, move.to_col);
                        if (friendly.type != PieceType.KNIGHT &&
                            (
                                row_change == row_dir && col_change == col_dir ||
                                row_change == row_dir * -1 && col_change == col_dir * -1
                            )
                        ) return true;

                        return false;
                    });
                    break;
                }

                // if it's not one of those pieces then pin isn't possible since there's now two pieces in the way
                break;
            }
        }

        // TODO, check if piece that is causing pin can actually pin... (it isn't pinned itself)

        return moves;
    }

    gen_legal_moves(): Move[] {
        const active: Move[] = this.gen_moves_active();
        const attacked: attack_2d = this.gen_attacking();

        const moves_1 = this.remove_checked_moves(active, attacked);
        const moves_2 = this.remove_pinned_moves(moves_1, attacked);

        if (this.in_check(attacked)) return this.moves_during_check(moves_2, attacked);

        return moves_2;
    }
}