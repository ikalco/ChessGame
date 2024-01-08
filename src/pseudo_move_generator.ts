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

    gen_pawn_moves(pawn: Piece): Move[] {
        let moves: Move[] = [];

        // if white then up, if black then down
        const dir = pawn.color == PieceColor.WHITE ? -1 : 1;
        const promotion_rank = pawn.color == PieceColor.WHITE ? 1 : 6;

        if (this.board.exists(pawn.row + dir, pawn.col) &&
            this.board.isEmpty(pawn.row + dir, pawn.col)
        ) {
            // move 1 square
            moves.push({
                from_row: pawn.row,
                from_col: pawn.col,
                to_row: pawn.row + dir,
                to_col: pawn.col,
                type: pawn.col == promotion_rank ? MoveType.Promotion : MoveType.Normal
            });

            if (this.board.exists(pawn.row + dir * 2, pawn.col) &&
                this.board.isEmpty(pawn.row + dir * 2, pawn.col) &&
                pawn.moved == false
            ) {
                // move 2 squares, pawn double move
                moves.push({
                    from_row: pawn.row,
                    from_col: pawn.col,
                    to_row: pawn.row + dir * 2,
                    to_col: pawn.col,
                    type: MoveType.PawnDouble
                });
            }
        }

        // diagonal to the right
        if (this.board.exists(pawn.row + dir, pawn.col + 1) &&
            this.board.isPiece(pawn.row + dir, pawn.col + 1) &&
            this.board.at(pawn.row + dir, pawn.col + 1)!.color != pawn.color
        ) {
            moves.push({
                from_row: pawn.row,
                from_col: pawn.col,
                to_row: pawn.row + dir,
                to_col: pawn.col + 1,
                type: pawn.col == promotion_rank ? MoveType.Promotion : MoveType.Normal
            });
        }

        // diagonal to the left
        if (this.board.exists(pawn.row + dir, pawn.col - 1) &&
            this.board.isPiece(pawn.row + dir, pawn.col - 1) &&
            this.board.at(pawn.row + dir, pawn.col - 1)!.color != pawn.color
        ) {
            moves.push({
                from_row: pawn.row,
                from_col: pawn.col,
                to_row: pawn.row + dir,
                to_col: pawn.col - 1,
                type: pawn.col == promotion_rank ? MoveType.Promotion : MoveType.Normal
            });
        }

        // en passant, 
        // btw won't if square to move to exists because last move supposedly went through it
        if (this.board.last_move != undefined &&
            this.board.last_moved_piece != undefined &&
            this.board.last_move.type == MoveType.PawnDouble &&
            this.board.last_moved_piece.color != pawn.color &&
            this.board.last_move.to_row == pawn.row
        ) {
            if (this.board.last_move.from_col == pawn.col + 1) {
                moves.push({
                    from_row: pawn.row,
                    from_col: pawn.col,
                    to_row: pawn.row + dir,
                    to_col: pawn.col + 1,
                    type: MoveType.EnPassant
                });
            }

            if (this.board.last_move.from_col == pawn.col - 1) {
                moves.push({
                    from_row: pawn.row,
                    from_col: pawn.col,
                    to_row: pawn.row + dir,
                    to_col: pawn.col - 1,
                    type: MoveType.EnPassant
                });
            }
        }

        return moves;
    }

    gen_rook_moves(rook: Piece): Move[] {
        let moves: Move[] = [];

        // format of directions is, change in ___ -> [row, col]
        //             left,   right,    up,     down
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

        for (const dir of dirs) {
            for (let dist = 1; dist < 8; dist++) {
                const to_row = rook.row + dir[0] * dist;
                const to_col = rook.col + dir[1] * dist;

                // if it doesn't exist, it's the edge so go to other direction
                if (!this.board.exists(to_row, to_col)) break;

                // if it's a piece with the same color (friendly) then go to other direction
                if (this.board.at(to_row, to_col).color == rook.color) break;

                moves.push({
                    from_row: rook.row,
                    from_col: rook.col,
                    to_row: rook.row + dir[0] * dist,
                    to_col: rook.col + dir[1] * dist,
                    type: MoveType.Normal
                });

                // if it's an enemy piece then add the move to take it then go to other direction
                if (this.board.isPiece(to_row, to_col) &&
                    this.board.at(to_row, to_col).color != rook.color
                ) break;
            }
        }

        return moves;
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