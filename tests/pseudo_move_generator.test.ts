import { describe, expect, test } from '@jest/globals';

import { PseduoLegalMoveGenerator } from '../src/pseudo_move_generator';
import { Piece, PieceColor, PieceType } from '../src/piece';
import { FEN } from '../src/fen_notation';
import { Move, MoveType } from '../src/move';
import { Board } from '../src/board';

describe("Testing pseudo legal move generation for pawns", () => {
    const fen = new FEN("8/pP1p4/8/2P5/8/8/Pp6/8 w KQkq - 0 1");
    const board = new Board(fen.board, [], fen.active_color, fen.castling_options, fen.halfmove);
    const generator: PseduoLegalMoveGenerator = new PseduoLegalMoveGenerator(board);

    test("Black Pawn ♙.", () => {
        const moves: Move[] = generator.gen_pawn_moves(board.at(1, 0)!);

        expect(moves.length).toBe(2);

        // move one square down
        expect(moves).toContain({
            from_row: 1,
            from_col: 0,
            to_row: 2,
            to_col: 0,
            type: MoveType.Normal
        });

        // move two square down, pawn double move
        expect(moves).toContain({
            from_row: 1,
            from_col: 0,
            to_row: 3,
            to_col: 0,
            type: MoveType.PawnDouble
        });
    });

    test("White Pawn ♟.", () => {
        const moves: Move[] = generator.gen_pawn_moves(board.at(6, 0)!);

        expect(moves.length).toBe(2);

        // move one square up
        expect(moves).toContain({
            from_row: 6,
            from_col: 0,
            to_row: 5,
            to_col: 0,
            type: MoveType.Normal
        });

        // move two squares up, pawn double move
        expect(moves).toContain({
            from_row: 6,
            from_col: 0,
            to_row: 4,
            to_col: 0,
            type: MoveType.PawnDouble
        });
    });

    test("Promotion.", () => {
        const moves: Move[] = generator.gen_pawn_moves(board.at(1, 1)!);

        expect(moves.length).toBe(1);

        // promotion of white pawns
        expect(moves).toContain({
            from_row: 1,
            from_col: 1,
            to_row: 0,
            to_col: 1,
            type: MoveType.Promotion
        });
    });

    test("En Passant.", () => {
        // fake a double move, yes its wonky rn, oh well
        board.move(1, 3, 3, 3);
        board.add_move({
            from_row: 1,
            from_col: 3,
            to_row: 3,
            to_col: 3,
            type: MoveType.PawnDouble
        });

        // make sure other pawn has "already moved"
        board.at(3, 2)!.moved = true;

        const moves: Move[] = generator.gen_pawn_moves(board.at(3, 2)!);

        expect(moves.length).toBe(2);

        // en passant move on pawn we faked double move on eariler
        expect(moves).toContain({
            from_row: 3,
            from_col: 2,
            to_row: 2,
            to_col: 3,
            type: MoveType.EnPassant
        });

        // other normal move
        expect(moves).toContain({
            from_row: 3,
            from_col: 2,
            to_row: 2,
            to_col: 2,
            type: MoveType.Normal
        });
    });
});

describe("Testing pseduo legal move generation for rooks", () => {
    const fen = new FEN("8/3P4/8/8/3r2p1/8/8/8 w KQkq - 0 1");
    const board = new Board(fen.board, [], fen.active_color, fen.castling_options, fen.halfmove);
    const generator: PseduoLegalMoveGenerator = new PseduoLegalMoveGenerator(board);

    const moves: Move[] = generator.gen_rook_moves(board.at(4, 3)!);

    expect(moves.length).toBe(11);

    test("Vertical.", () => {
        expect(moves).toContain({
            from_row: 4,
            from_col: 3,
            to_row: 5,
            to_col: 3,
            type: MoveType.Normal
        });

        expect(moves).toContain({
            from_row: 4,
            from_col: 3,
            to_row: 6,
            to_col: 3,
            type: MoveType.Normal
        });

        expect(moves).toContain({
            from_row: 4,
            from_col: 3,
            to_row: 7,
            to_col: 3,
            type: MoveType.Normal
        });
    });

    test("Horizontal.", () => {
        expect(moves).toContain({
            from_row: 4,
            from_col: 3,
            to_row: 4,
            to_col: 2,
            type: MoveType.Normal
        });

        expect(moves).toContain({
            from_row: 4,
            from_col: 3,
            to_row: 4,
            to_col: 1,
            type: MoveType.Normal
        });

        expect(moves).toContain({
            from_row: 4,
            from_col: 3,
            to_row: 4,
            to_col: 0,
            type: MoveType.Normal
        });
    });

    test("Friendly Piece.", () => {
        expect(moves).toContain({
            from_row: 4,
            from_col: 3,
            to_row: 4,
            to_col: 4,
            type: MoveType.Normal
        });

        expect(moves).toContain({
            from_row: 4,
            from_col: 3,
            to_row: 4,
            to_col: 5,
            type: MoveType.Normal
        });

        expect(moves).not.toContain({
            from_row: 4,
            from_col: 3,
            to_row: 4,
            to_col: 6,
        });
    });

    test("Enemy Piece.", () => {
        expect(moves).toContain({
            from_row: 4,
            from_col: 3,
            to_row: 3,
            to_col: 3,
            type: MoveType.Normal
        });

        expect(moves).toContain({
            from_row: 4,
            from_col: 3,
            to_row: 2,
            to_col: 3,
            type: MoveType.Normal
        });

        expect(moves).toContain({
            from_row: 4,
            from_col: 3,
            to_row: 1,
            to_col: 3,
            type: MoveType.Normal
        });
    });
});