import { Board } from "./board";
import { PieceType } from "./piece";
import { FEN } from "./fen_notation";

export namespace BoardFactory {
    export function createFEN(raw_string: string): Board {
        const fen = new FEN(raw_string);
        const board = new Board(fen.board, [], fen.active_color, fen.halfmove);

        if (!fen.castling_options.black_king && board.at(0, 7).type == PieceType.ROOK) {
            board.at(0, 7).moved = true;
        }

        if (!fen.castling_options.black_queen && board.at(0, 0).type == PieceType.ROOK) {
            board.at(0, 0).moved = true;
        }

        if (!fen.castling_options.white_king && board.at(7, 7).type == PieceType.ROOK) {
            board.at(7, 7).moved = true;
        }

        if (!fen.castling_options.white_queen && board.at(7, 0).type == PieceType.ROOK) {
            board.at(7, 0).moved = true;
        }

        return board;
    }
}