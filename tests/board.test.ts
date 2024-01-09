import { describe, expect, test } from '@jest/globals';

import { BoardFactory } from "../src/board_factory";
import { Move, MoveType } from '../src/move';
import { PieceColor, PieceType } from '../src/piece';

describe("Testing functions of Board class.", () => {
    const board = BoardFactory.createFEN("rnbqkbnr/1ppppppp/8/p7/P7/8/1PPPPPPP/RNBQKBNR w KQkq a6 0 1");

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

        expect(board.last_moved_piece!.moved).toBe(true);

        expect(board.last_move).toStrictEqual({
            from_row: 1,
            from_col: 0,
            to_row: 3,
            to_col: 0,
            type: MoveType.PawnDouble
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

    // is it bad to mutate an object outside an individual test case??? idk ¯\_(ツ)_/¯
    test("Piece is deleted correctly.", () => {
        board.delete(7, 0);

        expect(board.isEmpty(7, 0)).toBe(true);
        expect(board.pieces).toHaveLength(31);
        expect(board.whites).toHaveLength(15);
        expect(board.rooks).toHaveLength(3);
    });

    test("Piece is moved correctly.", () => {
        board.move(1, 1, 2, 1);

        expect(board.isEmpty(1, 1)).toBe(true);
        expect(board.isPiece(2, 1)).toBe(true);

        expect(board.at(2, 1).row).toBe(2);
        expect(board.at(2, 1).col).toBe(1);
        expect(board.at(2, 1).moved).toBe(true);
    });

    test("Move is added correctly.", () => {
        const move: Move = {
            from_row: 1,
            from_col: 1,
            to_row: 2,
            to_col: 1,
            type: MoveType.Normal
        };

        board.add_move(move);

        expect(board.last_move).toStrictEqual(move);
        expect(board.last_moved_piece).toStrictEqual(board.at(2, 1));
    });
});