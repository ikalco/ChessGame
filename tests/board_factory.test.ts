import { describe, expect, test } from '@jest/globals';

import { BoardFactory } from "../src/board_factory";
import { MoveType } from '../src/move';

// not testing the easy parts... probably a bad idea but I don't think they will ever break
describe("Testing board factory for FEN", () => {
    test("Castling.", () => {
        const board = BoardFactory.createFEN("r3k2r/1ppppppp/8/p7/P7/8/1PPPPPPP/R3K2R w - - 0 1");
        expect(board.at(0, 0).moved).toBe(true);
        expect(board.at(0, 7).moved).toBe(true);
        expect(board.at(7, 0).moved).toBe(true);
        expect(board.at(7, 7).moved).toBe(true);
    });

    test("En passant target square. (Black)", () => {
        const board = BoardFactory.createFEN("rnbqkbnr/1ppppppp/8/p7/P7/8/1PPPPPPP/RNBQKBNR w - a6 0 1");

        expect(board.last_move).not.toBeUndefined();
        expect(board.last_moved_piece).not.toBeUndefined();

        expect(board.last_moved_piece!.moved).toStrictEqual(true);

        expect(board.last_move).toStrictEqual({
            from_row: 1,
            from_col: 0,
            to_row: 3,
            to_col: 0,
            type: MoveType.PawnDouble
        });
    });

    test("En passant target square. (White)", () => {
        const board = BoardFactory.createFEN("rnbqkbnr/1ppppppp/8/p7/P7/8/1PPPPPPP/RNBQKBNR w - a3 0 1");

        expect(board.last_move).not.toBeUndefined();
        expect(board.last_moved_piece).not.toBeUndefined();

        expect(board.last_moved_piece!.moved).toStrictEqual(true);

        expect(board.last_move).toStrictEqual({
            from_row: 6,
            from_col: 0,
            to_row: 4,
            to_col: 0,
            type: MoveType.PawnDouble
        });
    });
});