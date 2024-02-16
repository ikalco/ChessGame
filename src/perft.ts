import { Board } from "./board.js";
import { LegalMoveGenerator } from "./legal_move_generator.js";
import { Move, MoveType } from "./move.js";
import { AlgebraNotation } from "./algebra_notation.js";
import { PieceColor } from "./piece.js";

export namespace Perft {
    export type perft_divide = {
        [key: string]: number,
        num_positions: number;
    };

    export function bulk(board: Board, depth: number): number {
        if (depth == 0) return 1;

        const generator = new LegalMoveGenerator(board);

        const moves: Move[] = generator.gen_legal_moves();

        if (depth == 1) return moves.length;

        let num_positions = 0;

        for (const move of moves) {
            board.move(move);
            num_positions += bulk(board, depth - 1);
            board.unmove();
        }

        return num_positions;
    }

    export function divide(board: Board, depth: number): perft_divide {
        let result: perft_divide = {
            num_positions: 0
        };

        const generator = new LegalMoveGenerator(board);

        const moves: Move[] = generator.gen_legal_moves();

        for (const move of moves) {
            board.move(move);
            const positions = bulk(board, depth - 1);
            board.unmove();

            result.num_positions += positions;

            if (move.type == MoveType.EnPassant)
                move.to_row += board.at(move.from_row, move.from_col).color == PieceColor.WHITE ? -1 : 1;

            result[AlgebraNotation.fromMoveSimple(move)] = positions;
        }

        return result;
    }
}