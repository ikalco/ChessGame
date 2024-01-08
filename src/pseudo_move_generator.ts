import { Board } from "./board";
import { Move, MoveType } from "./move";
import { Piece, PieceColor, PieceType } from "./piece";

export class PseduoLegalMoveGenerator {
    constructor(private board: Board) { }

    gen_all_moves(): Move[] {
        let moves: Move[] = [];
        let pieces: Piece[] = this.board.pieces;

        for (const piece of pieces) {
            switch (piece.type) {
                case PieceType.PAWN: moves.concat(this.gen_pawn_moves(piece)); break;
                case PieceType.ROOK: moves.concat(this.gen_rook_moves(piece)); break;
                case PieceType.KNIGHT: moves.concat(this.gen_knight_moves(piece)); break;
                case PieceType.BISHOP: moves.concat(this.gen_bishop_moves(piece)); break;
                case PieceType.KING: moves.concat(this.gen_king_moves(piece)); break;
                case PieceType.QUEEN: moves.concat(this.gen_queen_moves(piece)); break;
            }
        }

        return moves;
    }

    gen_pawn_moves(piece: Piece): Move[] {
        let moves: Move[] = [];

        // if white then up, if black then down
        const dir = piece.color == PieceColor.WHITE ? -1 : 1;
        const promotion_rank = piece.color == PieceColor.WHITE ? 1 : 6;

        if (this.board.isEmpty(piece.row + dir, piece.col)) {
            // move 1 square
            moves.push({
                from_row: piece.row,
                from_col: piece.col,
                to_row: piece.row + dir,
                to_col: piece.col,
                type: piece.col == promotion_rank ? MoveType.Promotion : MoveType.Normal
            });

            if (piece.moved == false && this.board.isEmpty(piece.row + dir * 2, piece.col)) {
                // move 2 squares, pawn double move
                moves.push({
                    from_row: piece.row,
                    from_col: piece.col,
                    to_row: piece.row + dir * 2,
                    to_col: piece.col,
                    type: MoveType.PawnDouble
                });
            }
        }

        // diagonal to the right
        if (!this.board.isEmpty(piece.row + dir, piece.col + 1) &&
            this.board.at(piece.row + dir, piece.col + 1)!.color != piece.color
        ) {
            moves.push({
                from_row: piece.row,
                from_col: piece.col,
                to_row: piece.row + dir,
                to_col: piece.col + 1,
                type: piece.col == promotion_rank ? MoveType.Promotion : MoveType.Normal
            })
        }

        // diagonal to the left
        if (!this.board.isEmpty(piece.row + dir, piece.col - 1) &&
            this.board.at(piece.row + dir, piece.col - 1)!.color != piece.color
        ) {
            moves.push({
                from_row: piece.row,
                from_col: piece.col,
                to_row: piece.row + dir,
                to_col: piece.col - 1,
                type: piece.col == promotion_rank ? MoveType.Promotion : MoveType.Normal
            })
        }

        // en passant
        if (this.board.last_move != undefined &&
            this.board.last_moved_piece != undefined &&
            this.board.last_move.type == MoveType.PawnDouble &&
            this.board.last_moved_piece.color != piece.color &&
            this.board.last_move.to_row == piece.row
        ) {
            if (this.board.last_move.from_col == piece.col + 1) {
                moves.push({
                    from_row: piece.row,
                    from_col: piece.col,
                    to_row: piece.row + dir,
                    to_col: piece.col + 1,
                    type: MoveType.EnPassant
                })
            }

            if (this.board.last_move.from_col == piece.col - 1) {
                moves.push({
                    from_row: piece.row,
                    from_col: piece.col,
                    to_row: piece.row + dir,
                    to_col: piece.col - 1,
                    type: MoveType.EnPassant
                })
            }
        }

        return moves;
    }

    gen_rook_moves(piece: Piece): Move[] {
        return [];
    }

    gen_knight_moves(piece: Piece): Move[] {
        return [];
    }

    gen_bishop_moves(piece: Piece): Move[] {
        return [];
    }

    gen_king_moves(piece: Piece): Move[] {
        return [];
    }

    gen_queen_moves(piece: Piece): Move[] {
        return [];
    }
}