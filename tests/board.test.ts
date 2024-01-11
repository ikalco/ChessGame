import { describe, expect, test } from '@jest/globals';

import { BoardFactory } from "../src/board_factory";
import { Move, MoveType } from '../src/move';
import { PieceColor, PieceType } from '../src/piece';

describe("Testing functions of Board class.", () => {
    const board = BoardFactory.createFEN("rnbqkbnr/1ppppppp/8/p7/8/8/PPPPPPPP/RNBQKBNR w KQkq a6 0 1");

    test("Keeping track of different piece types.", () => {
        expect(board.pieces).toHaveLength(32);
        expect(board.whites).toHaveLength(16);
        expect(board.blacks).toHaveLength(16);
        expect(board.pawns).toHaveLength(16);
        expect(board.rooks).toHaveLength(4);
        expect(board.knights).toHaveLength(4);
        expect(board.bishops).toHaveLength(4);
        expect(board.kings).toHaveLength(2);
        expect(board.queens).toHaveLength(2);

        expect(board.white_king).toStrictEqual(board.at(7, 4));
        expect(board.white_queen).toStrictEqual(board.at(7, 3));
        expect(board.black_king).toStrictEqual(board.at(0, 4));
        expect(board.black_queen).toStrictEqual(board.at(0, 3));
    });

    test("Last move.", () => {
        expect(board.last_move).not.toBeUndefined();
        expect(board.last_moved_piece).not.toBeUndefined();

        expect(board.num_moves).toBe(1);
        expect(board.last_moved_piece!.moved).toBe(true);

        expect(board.last_move).toStrictEqual({
            from_row: 1,
            from_col: 0,
            to_row: 3,
            to_col: 0,
            type: MoveType.PawnDouble,
            taking: false
        });
    });

    test("Getting what is at a certain position.", () => {
        expect(board.at(0, 0)).toStrictEqual({
            row: 0,
            col: 0,
            color: PieceColor.BLACK,
            type: PieceType.ROOK,
            moved: false
        });

        expect(() => board.at(-1, -1)).toThrowError("Tried to access undefined piece in board.");
    });

    test("Square exists in board.", () => {
        expect(board.exists(1, 0)).toBe(true);
        expect(board.exists(-2, -2)).toBe(false);
    });

    test("Square is empty.", () => {
        expect(board.isEmpty(2, 1)).toBe(true);
        expect(board.isEmpty(0, 1)).toBe(false);
    });

    test("Square is a piece.", () => {
        expect(board.isPiece(1, 1)).toBe(true);
        expect(board.isPiece(2, 2)).toBe(false);
    });

    test("Move is added correctly.", () => {
        const new_board = BoardFactory.createFEN("rnbqkbnr/1ppppppp/8/p7/8/8/PPPPPPPP/RNBQKBNR w KQkq a6 0 1");

        const move: Move = {
            from_row: 1,
            from_col: 1,
            to_row: 2,
            to_col: 1,
            type: MoveType.Normal,
            taking: false
        };

        new_board.add_move(move);

        expect(new_board.last_move).toStrictEqual(move);
        expect(new_board.last_moved_piece).toStrictEqual(new_board.at(2, 1));
    });

    test("Piece is deleted correctly.", () => {
        board.delete(7, 0);

        expect(board.isEmpty(7, 0)).toBe(true);
        expect(board.pieces).toHaveLength(31);
        expect(board.whites).toHaveLength(15);
        expect(board.rooks).toHaveLength(3);
    });

    test("Halfmove counter.", () => {
        const new_board = BoardFactory.createFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

        new_board.move({
            from_row: 0,
            from_col: 1,
            to_row: 2,
            to_col: 0,
            type: MoveType.Normal,
            taking: false
        });

        expect(new_board.halfmove_counter).toBe(1);

        new_board.move({
            from_row: 1,
            from_col: 1,
            to_row: 2,
            to_col: 1,
            type: MoveType.Normal,
            taking: false
        });

        expect(new_board.halfmove_counter).toBe(0);

        new_board.move({
            from_row: 2,
            from_col: 0,
            to_row: 4,
            to_col: 1,
            type: MoveType.Normal,
            taking: false
        });

        expect(new_board.halfmove_counter).toBe(1);

        new_board.move({
            from_row: 4,
            from_col: 1,
            to_row: 6,
            to_col: 0,
            type: MoveType.Normal,
            taking: true
        });

        expect(new_board.halfmove_counter).toBe(0);
    });

    test("Normal move is performed correctly.", () => {
        const new_board = BoardFactory.createFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

        const move: Move = {
            from_row: 1,
            from_col: 1,
            to_row: 2,
            to_col: 1,
            type: MoveType.Normal,
            taking: false
        };

        new_board.move(move);

        expect(new_board.isEmpty(1, 1)).toBe(true);
        expect(new_board.isPiece(2, 1)).toBe(true);

        expect(new_board.at(2, 1).row).toBe(2);
        expect(new_board.at(2, 1).col).toBe(1);
        expect(new_board.at(2, 1).moved).toBe(true);

        expect(new_board.last_move).toStrictEqual(move);

        expect(new_board.active_color).toBe(PieceColor.BLACK);
    });

    test("Castling move is performed correctly.", () => {
        const new_board = BoardFactory.createFEN("r3k3/8/8/8/8/8/8/4K2R w KQkq - 0 1");

        const move: Move = {
            from_row: 0,
            from_col: 4,
            to_row: 0,
            to_col: 2,
            type: MoveType.Castling,
            taking: false
        };

        new_board.move(move);

        expect(new_board.at(0, 2).type).toBe(PieceType.KING);
        expect(new_board.at(0, 3).type).toBe(PieceType.ROOK);
        expect(new_board.at(0, 0).type).toBe(PieceType.EMPTY);
    });

    test("Enpassant move is performed correctly.", () => {
        const new_board = BoardFactory.createFEN("8/8/8/pP6/8/8/8/8 w KQkq a6 0 1");

        const move: Move = {
            from_row: 3,
            from_col: 1,
            to_row: 2,
            to_col: 0,
            type: MoveType.EnPassant,
            taking: true
        };

        new_board.move(move);

        expect(new_board.at(2, 0).type).toBe(PieceType.PAWN);
        expect(new_board.at(2, 0).color).toBe(PieceColor.WHITE);
        expect(new_board.at(3, 0).type).toBe(PieceType.EMPTY);
    });

    test("Promotion move is performed correctly.", () => {
        const new_board = BoardFactory.createFEN("8/P7/8/8/8/8/8/8 w KQkq - 0 1");

        const move: Move = {
            from_row: 1,
            from_col: 0,
            to_row: 0,
            to_col: 0,
            type: MoveType.Promotion,
            taking: false,
            promotion_type: PieceType.QUEEN
        };

        new_board.move(move);

        expect(new_board.at(0, 0).type).toBe(PieceType.QUEEN);
    });

    test("Normal unmove is performed correctly.", () => {
        const new_board = BoardFactory.createFEN("rnbqkbnr/pppppppp/P7/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

        new_board.at(1, 1).moved = true;

        const move: Move = {
            from_row: 1,
            from_col: 1,
            to_row: 2,
            to_col: 0,
            type: MoveType.Normal,
            taking: true
        };

        new_board.move(move);
        new_board.unmove();

        expect(new_board.isPiece(1, 1)).toBe(true);
        expect(new_board.isPiece(2, 0)).toBe(true);

        expect(new_board.at(1, 1).row).toBe(1);
        expect(new_board.at(1, 1).col).toBe(1);
        expect(new_board.at(1, 1).type).toBe(PieceType.PAWN);
        expect(new_board.at(1, 1).color).toBe(PieceColor.BLACK);
        expect(new_board.at(1, 1).moved).toBe(true);

        expect(new_board.at(2, 0).row).toBe(2);
        expect(new_board.at(2, 0).col).toBe(0);
        expect(new_board.at(2, 0).type).toBe(PieceType.PAWN);
        expect(new_board.at(2, 0).color).toBe(PieceColor.WHITE);
        expect(new_board.at(2, 0).moved).toBe(false);

        expect(new_board.last_move).toBeUndefined();

        expect(new_board.active_color).toBe(PieceColor.WHITE);
    });

    test("Castling unmove is performed correctly.", () => {
        const new_board = BoardFactory.createFEN("r3k3/8/8/8/8/8/8/4K2R w KQkq - 0 1");

        const move: Move = {
            from_row: 0,
            from_col: 4,
            to_row: 0,
            to_col: 2,
            type: MoveType.Castling,
            taking: false,
            first_move: true
        };

        new_board.move(move);
        new_board.unmove();

        expect(new_board.isPiece(0, 4)).toBe(true);
        expect(new_board.isPiece(0, 0)).toBe(true);

        expect(new_board.isEmpty(0, 1)).toBe(true);
        expect(new_board.isEmpty(0, 2)).toBe(true);
        expect(new_board.isEmpty(0, 3)).toBe(true);

        expect(new_board.at(0, 4).row).toBe(0);
        expect(new_board.at(0, 4).col).toBe(4);
        expect(new_board.at(0, 4).type).toBe(PieceType.KING);
        expect(new_board.at(0, 4).color).toBe(PieceColor.BLACK);
        expect(new_board.at(0, 4).moved).toBe(false);

        expect(new_board.at(0, 0).row).toBe(0);
        expect(new_board.at(0, 0).col).toBe(0);
        expect(new_board.at(0, 0).type).toBe(PieceType.ROOK);
        expect(new_board.at(0, 0).color).toBe(PieceColor.BLACK);
        expect(new_board.at(0, 0).moved).toBe(false);
    });

    test("Enpassant unmove is performed correctly.", () => {
        const new_board = BoardFactory.createFEN("8/8/8/pP6/8/8/8/8 w KQkq a6 0 1");

        const move: Move = {
            from_row: 3,
            from_col: 1,
            to_row: 2,
            to_col: 0,
            type: MoveType.EnPassant,
            taking: true
        };

        new_board.move(move);
        new_board.unmove();

        expect(new_board.isPiece(3, 1)).toBe(true);
        expect(new_board.isPiece(3, 0)).toBe(true);

        expect(new_board.isEmpty(2, 0)).toBe(true);

        expect(new_board.at(3, 1).row).toBe(3);
        expect(new_board.at(3, 1).col).toBe(1);
        expect(new_board.at(3, 1).type).toBe(PieceType.PAWN);
        expect(new_board.at(3, 1).color).toBe(PieceColor.WHITE);
        expect(new_board.at(3, 1).moved).toBe(true);

        expect(new_board.at(3, 0).row).toBe(3);
        expect(new_board.at(3, 0).col).toBe(0);
        expect(new_board.at(3, 0).type).toBe(PieceType.PAWN);
        expect(new_board.at(3, 0).color).toBe(PieceColor.BLACK);
        expect(new_board.at(3, 0).moved).toBe(true);

        expect(new_board.last_move!.type).toBe(MoveType.PawnDouble);
    });

    test("Promotion unmove is performed correctly.", () => {
        const new_board = BoardFactory.createFEN("8/P7/8/8/8/8/8/8 w KQkq - 0 1");

        const move: Move = {
            from_row: 1,
            from_col: 0,
            to_row: 0,
            to_col: 0,
            type: MoveType.Promotion,
            promotion_type: PieceType.QUEEN,
            taking: false,
            first_move: true
        };

        new_board.move(move);
        new_board.unmove();

        expect(new_board.isPiece(1, 0)).toBe(true);

        expect(new_board.isEmpty(0, 0)).toBe(true);

        expect(new_board.at(1, 0).row).toBe(1);
        expect(new_board.at(1, 0).col).toBe(0);
        expect(new_board.at(1, 0).type).toBe(PieceType.PAWN);
        expect(new_board.at(1, 0).color).toBe(PieceColor.WHITE);
        expect(new_board.at(1, 0).moved).toBe(false);
    });
});