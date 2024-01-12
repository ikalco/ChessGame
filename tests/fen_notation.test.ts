import { describe, expect, test } from '@jest/globals';

import { FEN } from "../src/fen_notation";
import { BoardFactory } from "../src/board_factory";
import { EMPTY_PIECE, PieceColor, PieceType } from "../src/piece";
import { MoveType } from '../src/move';

describe("Testing FEN parsing: \"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1\"", () => {
    const fen = new FEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

    test("Correctly loaded board.", () => {
        const board = fen.board;

        // check properties of board
        expect(board.length).toBe(8);
        expect(board[0].length).toBe(8);
        expect(board[7].length).toBe(8);

        // check if pieces were made correctly, 1
        expect(board[0][0]!.row).toBe(0);
        expect(board[0][0]!.col).toBe(0);
        expect(board[0][0]!.color).toBe(PieceColor.BLACK);
        expect(board[0][0]!.type).toBe(PieceType.ROOK);

        // check if pieces were made correctly, 2
        expect(board[7][7]!.row).toBe(7);
        expect(board[7][7]!.col).toBe(7);
        expect(board[7][7]!.color).toBe(PieceColor.WHITE);
        expect(board[7][7]!.type).toBe(PieceType.ROOK);

        // check if empty spaces were made correctly
        expect(board[3][5]).toBe(EMPTY_PIECE);
    });

    test("Correctly loaded active color.", () => {
        expect(fen.active_color).toBe(PieceColor.WHITE);
    });

    test("Correctly loaded castling options.", () => {
        const castling_options = fen.castling_options;

        expect(castling_options.black_king).toBe(true);
        expect(castling_options.black_queen).toBe(true);
        expect(castling_options.white_king).toBe(true);
        expect(castling_options.white_queen).toBe(true);
    });

    test("Correctly loaded enpassant piece.", () => {
        expect(fen.enpassant_target_square).toHaveLength(0);
    });

    test("Correctly loaded halfmove counter.", () => {
        expect(fen.halfmove).toBe(0);
    });

    test("Correctly loaded fullmove counter.", () => {
        expect(fen.fullmove).toBe(1);
    });
});

describe("Testing conversion from Board to FEN", () => {
    test("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", () => {
        const board = BoardFactory.createFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

        const fen = FEN.from(board);
        expect(fen.raw_string).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    });

    test("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 | With a move between creation and conversion.", () => {
        const board = BoardFactory.createFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

        board.move({
            from_row: 1,
            from_col: 0,
            to_row: 3,
            to_col: 0,
            type: MoveType.PawnDouble,
            taking: false,
            first_move: true
        });

        const fen = FEN.from(board);
        expect(fen.raw_string).toBe("rnbqkbnr/1ppppppp/8/p7/8/8/PPPPPPPP/RNBQKBNR b KQkq a6 0 1");
    });

    test("r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1", () => {
        const board = BoardFactory.createFEN("r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1");

        const fen = FEN.from(board);
        expect(fen.raw_string).toBe("r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1");
    });
});