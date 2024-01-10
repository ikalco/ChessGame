import { describe, expect, test } from '@jest/globals';

import { PseduoLegalMoveGenerator } from '../src/pseudo_move_generator';
import { BoardFactory } from '../src/board_factory';
import { Move, MoveType } from '../src/move';
import { PieceColor } from '../src/piece';

describe("Testing pseudo legal move generation for piece groups.", () => {
    const board = BoardFactory.createFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const generator: PseduoLegalMoveGenerator = new PseduoLegalMoveGenerator(board);

    test("All pieces.", () => {
        const moves: Move[] = generator.gen_all_moves(board.pieces);

        expect(moves.length).toBe(40);
    });

    test("White pieces.", () => {
        const moves: Move[] = generator.gen_all_moves(board.whites);

        expect(moves.length).toBe(20);

        for (let i = 0; i < 20; i++) {
            expect(board.at(moves[i].from_row, moves[i].from_col).color).toBe(PieceColor.WHITE);
        }
    });

    test("Black pieces.", () => {
        const moves: Move[] = generator.gen_all_moves(board.blacks);

        expect(moves.length).toBe(20);

        for (let i = 0; i < 20; i++) {
            expect(board.at(moves[i].from_row, moves[i].from_col).color).toBe(PieceColor.BLACK);
        }
    });
});

describe("Testing pseudo legal move generation for pawns", () => {
    const board = BoardFactory.createFEN("7P/p2p4/1P6/2P5/8/1P6/P6p/8 w KQkq - 0 1");
    const generator: PseduoLegalMoveGenerator = new PseduoLegalMoveGenerator(board);

    test("Normal (Black Pawn).", () => {
        const moves: Move[] = generator.gen_pawn_moves(board.at(1, 0));

        expect(moves.length).toBe(3);

        expect(moves).toContainEqual({
            from_row: 1,
            from_col: 0,
            to_row: 2,
            to_col: 0,
            type: MoveType.Normal,
            taking: false
        });
    });

    test("Normal (White Pawn).", () => {
        const moves: Move[] = generator.gen_pawn_moves(board.at(6, 0));

        expect(moves.length).toBe(2);

        expect(moves).toContainEqual({
            from_row: 6,
            from_col: 0,
            to_row: 5,
            to_col: 0,
            type: MoveType.Normal,
            taking: false
        });
    });

    test("Friendly Piece.", () => {
        const moves: Move[] = generator.gen_pawn_moves(board.at(6, 0));

        expect(moves.length).toBe(2);

        expect(moves).not.toContain({
            from_row: 6,
            from_col: 0,
            to_row: 5,
            to_col: 1,
        });
    });

    test("Enemy Piece.", () => {
        const moves: Move[] = generator.gen_pawn_moves(board.at(1, 0));

        expect(moves.length).toBe(3);

        expect(moves).toContainEqual({
            from_row: 1,
            from_col: 0,
            to_row: 2,
            to_col: 1,
            type: MoveType.Normal,
            taking: true
        });
    });

    test("Out of bounds.", () => {
        const moves: Move[] = generator.gen_pawn_moves(board.at(0, 7));

        expect(moves.length).toBe(0);

        expect(moves).not.toContain({
            from_row: 1,
            from_col: 0,
            to_row: 2,
            to_col: 1,
            type: MoveType.Normal
        });
    });

    test("Pawn Double.", () => {
        const moves: Move[] = generator.gen_pawn_moves(board.at(6, 0));

        expect(moves.length).toBe(2);

        expect(moves).toContainEqual({
            from_row: 6,
            from_col: 0,
            to_row: 4,
            to_col: 0,
            type: MoveType.PawnDouble,
            taking: false
        });
    });

    test("Promotion.", () => {
        const moves: Move[] = generator.gen_pawn_moves(board.at(6, 7));

        expect(moves.length).toBe(1);

        expect(moves).toContainEqual({
            from_row: 6,
            from_col: 7,
            to_row: 7,
            to_col: 7,
            type: MoveType.Promotion,
            taking: false
        });
    });

    test("En Passant.", () => {
        // fake a double move, yes its wonky rn, oh well
        board.move({
            from_row: 1,
            from_col: 3,
            to_row: 3,
            to_col: 3,
            type: MoveType.PawnDouble,
            taking: false
        });

        // make sure other pawn has "already moved"
        board.at(3, 2).moved = true;

        const moves: Move[] = generator.gen_pawn_moves(board.at(3, 2));

        expect(moves.length).toBe(2);

        // en passant move on pawn we faked double move on eariler
        expect(moves).toContainEqual({
            from_row: 3,
            from_col: 2,
            to_row: 2,
            to_col: 3,
            type: MoveType.EnPassant,
            taking: true
        });

        // other normal move
        expect(moves).toContainEqual({
            from_row: 3,
            from_col: 2,
            to_row: 2,
            to_col: 2,
            type: MoveType.Normal,
            taking: false
        });
    });
});

describe("Testing pseduo legal move generation for rooks", () => {
    const board = BoardFactory.createFEN("8/3P4/8/8/3r2p1/8/8/8 w KQkq - 0 1");
    const generator: PseduoLegalMoveGenerator = new PseduoLegalMoveGenerator(board);

    const moves: Move[] = generator.gen_rook_moves(board.at(4, 3));

    expect(moves.length).toBe(11);

    test("Normal.", () => {
        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 5,
            to_col: 3,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 6,
            to_col: 3,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 7,
            to_col: 3,
            type: MoveType.Normal,
            taking: false
        });
    });

    test("Out of bounds.", () => {
        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 4,
            to_col: 2,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 4,
            to_col: 1,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 4,
            to_col: 0,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).not.toContain({
            from_row: 4,
            from_col: 3,
            to_row: 4,
            to_col: -1,
        });
    });

    test("Friendly Piece.", () => {
        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 4,
            to_col: 4,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 4,
            to_col: 5,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).not.toContain({
            from_row: 4,
            from_col: 3,
            to_row: 4,
            to_col: 6,
        });
    });

    test("Enemy Piece.", () => {
        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 3,
            to_col: 3,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 2,
            to_col: 3,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 1,
            to_col: 3,
            type: MoveType.Normal,
            taking: true
        });

        expect(moves).not.toContain({
            from_row: 4,
            from_col: 3,
            to_row: 0,
            to_col: 3,
        });
    });
});

describe("Testing pseudo legal move generation for knights", () => {
    const board = BoardFactory.createFEN("8/8/8/2p5/8/1N6/3P4/8 w KQkq - 0 1");
    const generator: PseduoLegalMoveGenerator = new PseduoLegalMoveGenerator(board);

    const moves: Move[] = generator.gen_knight_moves(board.at(5, 1));

    expect(moves.length).toBe(5);

    test("Normal.", () => {
        expect(moves).toContainEqual({
            from_row: 5,
            from_col: 1,
            to_row: 7,
            to_col: 0,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 5,
            from_col: 1,
            to_row: 7,
            to_col: 2,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 5,
            from_col: 1,
            to_row: 4,
            to_col: 3,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 5,
            from_col: 1,
            to_row: 3,
            to_col: 0,
            type: MoveType.Normal,
            taking: false
        });
    });

    test("Out of bounds.", () => {
        expect(moves).not.toContain({
            from_row: 5,
            from_col: 1,
            to_row: 4,
            to_col: -1,
        });

        expect(moves).not.toContain({
            from_row: 5,
            from_col: 1,
            to_row: 6,
            to_col: -1,
        });
    });

    test("Friendly Piece.", () => {
        expect(moves).not.toContain({
            from_row: 5,
            from_col: 1,
            to_row: 6,
            to_col: 3,
        });
    });

    test("Enemy Piece.", () => {
        expect(moves).toContainEqual({
            from_row: 5,
            from_col: 1,
            to_row: 3,
            to_col: 2,
            type: MoveType.Normal,
            taking: true
        });
    });
});

describe("Testing pseudo legal move generation for bishops", () => {
    const board = BoardFactory.createFEN("8/8/8/8/3b4/8/1p3P2/8 w KQkq - 0 1");
    const generator: PseduoLegalMoveGenerator = new PseduoLegalMoveGenerator(board);

    const moves: Move[] = generator.gen_bishop_moves(board.at(4, 3));

    expect(moves.length).toBe(10);

    test("Normal.", () => {
        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 3,
            to_col: 4,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 2,
            to_col: 5,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 1,
            to_col: 6,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 0,
            to_col: 7,
            type: MoveType.Normal,
            taking: false
        });
    });

    test("Out of bounds.", () => {
        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 3,
            to_col: 2,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 2,
            to_col: 1,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 1,
            to_col: 0,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).not.toContain({
            from_row: 4,
            from_col: 3,
            to_row: 0,
            to_col: -1,
        });
    });

    test("Friendly Piece", () => {
        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 5,
            to_col: 2,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).not.toContain({
            from_row: 4,
            from_col: 3,
            to_row: 6,
            to_col: 1,
        });
    });

    test("Enemy Piece", () => {
        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 5,
            to_col: 4,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 6,
            to_col: 5,
            type: MoveType.Normal,
            taking: true
        });

        expect(moves).not.toContain({
            from_row: 4,
            from_col: 3,
            to_row: 7,
            to_col: 6,
        });
    });
});

describe("Testing pseudo legal move generation for kings", () => {
    const board = BoardFactory.createFEN("8/8/8/8/8/8/3P1p2/R1k1K2R w KQ - 0 1");
    const generator: PseduoLegalMoveGenerator = new PseduoLegalMoveGenerator(board);

    const moves: Move[] = generator.gen_king_moves(board.at(7, 4));

    expect(moves.length).toBe(5);

    test("Normal.", () => {
        expect(moves).toContainEqual({
            from_row: 7,
            from_col: 4,
            to_row: 7,
            to_col: 3,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 7,
            from_col: 4,
            to_row: 7,
            to_col: 5,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 7,
            from_col: 4,
            to_row: 6,
            to_col: 4,
            type: MoveType.Normal,
            taking: false
        });
    });

    test("Out of bounds.", () => {
        expect(moves).not.toContain({
            from_row: 7,
            from_col: 4,
            to_row: 8,
            to_col: 3,
        });

        expect(moves).not.toContain({
            from_row: 7,
            from_col: 4,
            to_row: 8,
            to_col: 4,
        });

        expect(moves).not.toContain({
            from_row: 7,
            from_col: 4,
            to_row: 8,
            to_col: 5,
        });
    });

    test("Friendly Piece.", () => {
        expect(moves).not.toContain({
            from_row: 7,
            from_col: 4,
            to_row: 6,
            to_col: 3,
        });
    });

    test("Enemy Piece.", () => {
        expect(moves).toContainEqual({
            from_row: 7,
            from_col: 4,
            to_row: 6,
            to_col: 5,
            type: MoveType.Normal,
            taking: true
        });
    });

    test("Castling.", () => {
        expect(moves).toContainEqual({
            from_row: 7,
            from_col: 4,
            to_row: 7,
            to_col: 6,
            type: MoveType.Castling,
            taking: false
        });

        expect(moves).not.toContainEqual({
            from_row: 7,
            from_col: 4,
            to_row: 7,
            to_col: 2,
            type: MoveType.Castling,
            taking: false
        });
    });
});

describe("Testing pseudo legal move generation for queens", () => {
    const board = BoardFactory.createFEN("8/8/8/8/3q4/8/1P6/3p4 w KQkq - 0 1");
    const generator: PseduoLegalMoveGenerator = new PseduoLegalMoveGenerator(board);

    const moves: Move[] = generator.gen_queen_moves(board.at(4, 3));

    expect(moves.length).toBe(25);

    test("Normal.", () => {
        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 4,
            to_col: 2,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 4,
            to_col: 1,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 4,
            to_col: 0,
            type: MoveType.Normal,
            taking: false
        });
    });

    test("Out of bounds.", () => {
        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 3,
            to_col: 2,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 2,
            to_col: 1,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 1,
            to_col: 0,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).not.toContain({
            from_row: 4,
            from_col: 3,
            to_row: 0,
            to_col: -1,
        });
    });

    test("Friendly Piece", () => {
        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 5,
            to_col: 3,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 6,
            to_col: 3,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).not.toContain({
            from_row: 4,
            from_col: 3,
            to_row: 7,
            to_col: 3
        });
    });

    test("Enemy Piece", () => {
        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 5,
            to_col: 2,
            type: MoveType.Normal,
            taking: false
        });

        expect(moves).toContainEqual({
            from_row: 4,
            from_col: 3,
            to_row: 6,
            to_col: 1,
            type: MoveType.Normal,
            taking: true
        });
    });
});