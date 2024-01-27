import { Board, board_2d } from "./board";
import { Move, MoveType } from "./move";
import { EMPTY_PIECE, Piece, PieceColor, PieceType } from "./piece";

export type attack_2d = boolean[][];

export class PseduoLegalMoveGenerator {
    constructor(private board: Board) { }

    gen_moves(pieces: Piece[]): Move[] {
        let moves: Move[] = [];

        for (const piece of pieces) {
            switch (piece.type) {
                case PieceType.EMPTY: continue;
                case PieceType.PAWN: moves = moves.concat(this.gen_pawn_moves(piece, false)); break;
                case PieceType.ROOK: moves = moves.concat(this.gen_rook_moves(piece, false)); break;
                case PieceType.KNIGHT: moves = moves.concat(this.gen_knight_moves(piece, false)); break;
                case PieceType.BISHOP: moves = moves.concat(this.gen_bishop_moves(piece, false)); break;
                case PieceType.KING: moves = moves.concat(this.gen_king_moves(piece, false)); break;
                case PieceType.QUEEN: moves = moves.concat(this.gen_queen_moves(piece, false)); break;
            }
        }

        return moves;
    }

    gen_attacked(pieces: Piece[]): Move[] {
        let moves: Move[] = [];

        for (const piece of pieces) {
            switch (piece.type) {
                case PieceType.EMPTY: continue;
                case PieceType.PAWN: moves = moves.concat(this.gen_pawn_moves(piece, true)); break;
                case PieceType.ROOK: moves = moves.concat(this.gen_rook_moves(piece, true)); break;
                case PieceType.KNIGHT: moves = moves.concat(this.gen_knight_moves(piece, true)); break;
                case PieceType.BISHOP: moves = moves.concat(this.gen_bishop_moves(piece, true)); break;
                case PieceType.KING: moves = moves.concat(this.gen_king_moves(piece, true)); break;
                case PieceType.QUEEN: moves = moves.concat(this.gen_queen_moves(piece, true)); break;
            }
        }

        return moves;
    }

    private check_first_move(move: Move): Move {
        if (this.board.at(move.from_row, move.from_col).moved == false) move.first_move = true;
        return move;
    }

    private gen_pawn_moves(pawn: Piece, attacking: boolean): Move[] {
        let moves: Move[] = [];

        // if white then up, if black then down
        const dir = pawn.color == PieceColor.WHITE ? -1 : 1;
        const promotion_rank = pawn.color == PieceColor.WHITE ? 1 : 6;

        if (this.board.exists(pawn.row + dir, pawn.col) &&
            this.board.isEmpty(pawn.row + dir, pawn.col) &&
            !attacking
        ) {
            // move 1 square
            moves.push(this.check_first_move({
                from_row: pawn.row,
                from_col: pawn.col,
                to_row: pawn.row + dir,
                to_col: pawn.col,
                type: pawn.row == promotion_rank ? MoveType.Promotion : MoveType.Normal,
                taking: false
            }));

            if (this.board.exists(pawn.row + dir * 2, pawn.col) &&
                this.board.isEmpty(pawn.row + dir * 2, pawn.col) &&
                pawn.moved == false
            ) {
                // move 2 squares, pawn double move
                moves.push(this.check_first_move({
                    from_row: pawn.row,
                    from_col: pawn.col,
                    to_row: pawn.row + dir * 2,
                    to_col: pawn.col,
                    type: MoveType.PawnDouble,
                    taking: false
                }));
            }
        }

        // diagonal to the right
        if (this.board.exists(pawn.row + dir, pawn.col + 1) &&
            this.board.isPiece(pawn.row + dir, pawn.col + 1) &&
            (this.board.at(pawn.row + dir, pawn.col + 1)!.color != pawn.color ||
                attacking)
        ) {
            moves.push(this.check_first_move({
                from_row: pawn.row,
                from_col: pawn.col,
                to_row: pawn.row + dir,
                to_col: pawn.col + 1,
                type: pawn.row == promotion_rank ? MoveType.Promotion : MoveType.Normal,
                taking: true
            }));
        }

        // diagonal to the left
        if (this.board.exists(pawn.row + dir, pawn.col - 1) &&
            this.board.isPiece(pawn.row + dir, pawn.col - 1) &&
            (this.board.at(pawn.row + dir, pawn.col - 1)!.color != pawn.color ||
                attacking)
        ) {
            moves.push(this.check_first_move({
                from_row: pawn.row,
                from_col: pawn.col,
                to_row: pawn.row + dir,
                to_col: pawn.col - 1,
                type: pawn.row == promotion_rank ? MoveType.Promotion : MoveType.Normal,
                taking: true
            }));
        }

        // TODO: will probably need to add en passant somehow to work with attacking
        // 		 variable, will worry about it later tho

        // en passant,
        // btw won't if square to move to exists because last move supposedly went through it
        if (this.board.last_move != undefined &&
            this.board.last_moved_piece != undefined &&
            this.board.last_move.type == MoveType.PawnDouble &&
            this.board.last_moved_piece.color != pawn.color &&
            this.board.last_move.to_row == pawn.row
        ) {
            if (this.board.last_move.from_col == pawn.col + 1) {
                moves.push(this.check_first_move({
                    from_row: pawn.row,
                    from_col: pawn.col,
                    to_row: pawn.row + dir,
                    to_col: pawn.col + 1,
                    type: MoveType.EnPassant,
                    taking: true
                }));
            }

            if (this.board.last_move.from_col == pawn.col - 1) {
                moves.push(this.check_first_move({
                    from_row: pawn.row,
                    from_col: pawn.col,
                    to_row: pawn.row + dir,
                    to_col: pawn.col - 1,
                    type: MoveType.EnPassant,
                    taking: true
                }));
            }
        }

        return moves;
    }

    private gen_rook_moves(rook: Piece, attacking: boolean): Move[] {
        let moves: Move[] = [];

        // format of directions is, change in ___ -> [row, col]
        //             left,   right,    up,     down
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

        for (const [row_change, col_change] of dirs) {
            for (let dist = 1; dist < 8; dist++) {
                const to_row = rook.row + row_change * dist;
                const to_col = rook.col + col_change * dist;

                // if it doesn't exist, it's the edge so go to other direction
                if (!this.board.exists(to_row, to_col)) break;

                let taking = false;

                // if it's a piece with the same color (friendly) then go to other direction
                if (this.board.isPiece(to_row, to_col)) {
                    if (this.board.at(to_row, to_col).color == rook.color && !attacking) break;
                    else taking = true;
                }

                moves.push(this.check_first_move({
                    from_row: rook.row,
                    from_col: rook.col,
                    to_row: rook.row + row_change * dist,
                    to_col: rook.col + col_change * dist,
                    type: MoveType.Normal,
                    taking: taking
                }));

                // if it's an enemy piece (checked earlier) then add the move to take it then go to other direction
                if (this.board.isPiece(to_row, to_col)) {
                    // if we are generating attacks, then a sliding piece can attack through an enemy king
                    if (this.board.at(to_row, to_col).color != rook.color &&
                        this.board.at(to_row, to_col).type == PieceType.KING &&
                        attacking) continue;
                    else break;
                }
            }
        }

        return moves;
    }

    private gen_knight_moves(knight: Piece, attacking: boolean): Move[] {
        let moves: Move[] = [];

        const dirs = [[-1, 2], [-1, -2], [-2, 1], [-2, -1], [1, 2], [1, -2], [2, 1], [2, -1]];

        for (const [row_change, col_change] of dirs) {
            const to_row = knight.row + row_change;
            const to_col = knight.col + col_change;

            // if it doesn't exist, it's the edge so go to other direction
            if (!this.board.exists(to_row, to_col)) continue;

            let taking = false;

            // if it's a piece with the same color (friendly) then go to other direction
            if (this.board.isPiece(to_row, to_col)) {
                if (this.board.at(to_row, to_col).color == knight.color && !attacking) continue;
                else taking = true;
            }

            moves.push(this.check_first_move({
                from_row: knight.row,
                from_col: knight.col,
                to_row: knight.row + row_change,
                to_col: knight.col + col_change,
                type: MoveType.Normal,
                taking: taking
            }));
        }

        return moves;
    }

    private gen_bishop_moves(bishop: Piece, attacking: boolean): Move[] {
        let moves: Move[] = [];

        const dirs = [[-1, -1], [1, -1], [-1, 1], [1, 1]];

        for (const [row_change, col_change] of dirs) {
            for (let dist = 1; dist < 8; dist++) {
                const to_row = bishop.row + row_change * dist;
                const to_col = bishop.col + col_change * dist;

                // if it doesn't exist, it's the edge so go to other direction
                if (!this.board.exists(to_row, to_col)) break;

                let taking = false;

                // if it's a piece with the same color (friendly) then go to other direction
                if (this.board.isPiece(to_row, to_col)) {
                    if (this.board.at(to_row, to_col).color == bishop.color && !attacking) break;
                    else taking = true;
                }

                moves.push(this.check_first_move({
                    from_row: bishop.row,
                    from_col: bishop.col,
                    to_row: bishop.row + row_change * dist,
                    to_col: bishop.col + col_change * dist,
                    type: MoveType.Normal,
                    taking: taking
                }));

                // if it's an enemy piece (checked earlier) then add the move to take it then go to other direction
                if (this.board.isPiece(to_row, to_col)) {
                    // if we are generating attacks, then a sliding piece can attack through an enemy king
                    if (this.board.at(to_row, to_col).color != bishop.color &&
                        this.board.at(to_row, to_col).type == PieceType.KING &&
                        attacking) continue;
                    else break;
                }
            }
        }

        return moves;
    }

    private gen_king_moves(king: Piece, attacking: boolean): Move[] {
        let moves: Move[] = [];

        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];

        for (const [row_change, col_change] of dirs) {
            const to_row = king.row + row_change;
            const to_col = king.col + col_change;

            // if it doesn't exist, it's the edge so go to other direction
            if (!this.board.exists(to_row, to_col)) continue;

            let taking = false;

            // if it's a piece with the same color (friendly) then go to other direction
            if (this.board.isPiece(to_row, to_col)) {
                if (this.board.at(to_row, to_col).color == king.color && !attacking) continue;
                else taking = true;
            }

            moves.push(this.check_first_move({
                from_row: king.row,
                from_col: king.col,
                to_row: king.row + row_change,
                to_col: king.col + col_change,
                type: MoveType.Normal,
                taking: taking
            }));
        }

        // castling rules
        // king & rook haven't moved
        // no pieces between them
        // third rule will be handled by LEGAL move generator

        // queen side castle
        if (!attacking &&
            this.board.at(king.row, 0).type == PieceType.ROOK &&
            this.board.at(king.row, 0).moved == false &&
            king.moved == false &&
            this.board.at(king.row, 1) == EMPTY_PIECE &&
            this.board.at(king.row, 2) == EMPTY_PIECE &&
            this.board.at(king.row, 3) == EMPTY_PIECE
        ) {
            moves.push(this.check_first_move({
                from_row: king.row,
                from_col: king.col,
                to_row: king.row,
                to_col: king.col - 2,
                type: MoveType.Castling,
                taking: false
            }));
        }

        // king side castle
        if (!attacking &&
            this.board.at(king.row, 7).type == PieceType.ROOK &&
            this.board.at(king.row, 7).moved == false &&
            king.moved == false &&
            this.board.at(king.row, 5) == EMPTY_PIECE &&
            this.board.at(king.row, 6) == EMPTY_PIECE
        ) {
            moves.push(this.check_first_move({
                from_row: king.row,
                from_col: king.col,
                to_row: king.row,
                to_col: king.col + 2,
                type: MoveType.Castling,
                taking: false
            }));
        }

        return moves;
    }

    private gen_queen_moves(queen: Piece, attacking: boolean): Move[] {
        let moves: Move[] = [];

        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];

        for (const [row_change, col_change] of dirs) {
            for (let dist = 1; dist < 8; dist++) {
                const to_row = queen.row + row_change * dist;
                const to_col = queen.col + col_change * dist;

                // if it doesn't exist, it's the edge so go to other direction
                if (!this.board.exists(to_row, to_col)) break;

                let taking = false;

                // if it's a piece with the same color (friendly) then go to other direction
                if (this.board.isPiece(to_row, to_col)) {
                    if (this.board.at(to_row, to_col).color == queen.color && !attacking) break;
                    else taking = true;
                }

                moves.push(this.check_first_move({
                    from_row: queen.row,
                    from_col: queen.col,
                    to_row: queen.row + row_change * dist,
                    to_col: queen.col + col_change * dist,
                    type: MoveType.Normal,
                    taking: taking,
                }));

                // if it's an enemy piece (checked earlier) then add the move to take it then go to other direction
                if (this.board.isPiece(to_row, to_col)) {
                    // if we are generating attacks, then a sliding piece can attack through an enemy king
                    if (this.board.at(to_row, to_col).color != queen.color &&
                        this.board.at(to_row, to_col).type == PieceType.KING &&
                        attacking) continue;
                    else break;
                }
            }
        }

        return moves;
    }
}