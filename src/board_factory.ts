import { Board } from "./board";
import { PieceColor, PieceType } from "./piece";
import { FEN } from "./fen_notation";
import { MoveType } from "./move";

export namespace BoardFactory {
    export function createFEN(raw_string: string): Board {
        const fen = new FEN(raw_string);
        const board = new Board(fen.board, [], fen.active_color, fen.halfmove);

        const [enp_row, enp_col] = fen.enpassant_target_square;

        // black pawn just did double move
        if (enp_row == 2) {
            if (!board.exists(3, enp_col) ||
                board.at(3, enp_col).type != PieceType.PAWN ||
                board.at(3, enp_col).color != PieceColor.BLACK
            ) throw Error("En Passant target square given by FEN is invalid.");

            board.at(3, enp_col).moved = true;

            board.add_move({
                from_row: 1,
                from_col: enp_col,
                to_row: 3,
                to_col: enp_col,
                type: MoveType.PawnDouble
            });
        }

        // white pawn just did double move
        if (enp_row == 5) {
            if (!board.exists(4, enp_col) ||
                board.at(4, enp_col).type != PieceType.PAWN ||
                board.at(4, enp_col).color != PieceColor.WHITE
            ) throw Error("En Passant target square given by FEN is invalid.");

            board.at(4, enp_col).moved = true;

            board.add_move({
                from_row: 6,
                from_col: enp_col,
                to_row: 4,
                to_col: enp_col,
                type: MoveType.PawnDouble
            });
        }

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