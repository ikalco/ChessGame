import { describe, expect, test } from '@jest/globals';
import { existsSync } from "node:fs";
import * as cp from "node:child_process";

import { BoardFactory } from '../src/board_factory';
import { LegalMoveGenerator } from '../src/legal_move_generator';
import { Perft } from '../src/perft';
import { Board } from '../src/board';
import { FEN } from '../src/fen_notation';
import { AlgebraNotation } from '../src/algebra_notation';
import { Move } from '../src/move';

function divideStockfish(board: Board, depth: number): Perft.perft_divide {
    const fen_string = FEN.from(board).raw_string;

    // these set the given fen position in stockfish,
    // get the perft divie results for the given depth,
    // then quit stockfish in order to finish function
    const commands = `position fen ${fen_string}\r\ngo perft ${depth}\r\nquit`;

    // use node:child_process to spawn stockfish process and pass commands above
    const stockfish = cp.spawnSync("./Stockfish/src/stockfish", {
        encoding: 'utf-8',
        input: commands
    });

    // first line and last two is always junk so we discard it
    const lines = stockfish.stdout.split("\n").slice(1, -2);
    const last_line = lines.pop() as string;

    // remove new line before the last line so that next step doesn't break
    lines.pop();

    let result: Perft.perft_divide = {
        // get number after semicolon, also trim extra space in front of semicolon
        num_positions: Number(last_line.split(":")[1].trimStart())
    };

    // get perft divide results and save them in result
    for (const line of lines) {
        const [move, positions] = line.split(":");

        // the positions string contains the space after the semicolon, so trim it
        result[move] = Number(positions.trimStart());
    }

    return result;
}

function print_moves(board: Board) {
    const num_moves = board.num_moves;
    const moves: string[] = [];

    while (board.last_move != undefined) {
        moves.push(AlgebraNotation.fromMoveSimple(board.last_move));
        board.unmove();
    }

    console.log(`depth: ${num_moves}\nmoves: ${moves.reverse().join(", ")}`);
}

function max_diff_move_divide(local: Perft.perft_divide, stockfish: Perft.perft_divide): (string | undefined) {
    let max_diff_move;

    for (const [move, num_positions] of Object.entries(stockfish)) {
        if (move == 'num_positions') continue;
        if (local[move] != undefined && local[move] == num_positions) continue;

        const diff = Math.abs(local[move] - stockfish[move]);
        if (max_diff_move == undefined) max_diff_move = move;

        const max_diff = Math.abs(local[max_diff_move] - stockfish[max_diff_move]);
        if (diff > max_diff) max_diff_move = move;
    }

    return max_diff_move;
}

function find_move(board: Board, move: string): (Move | undefined) {
    const from_col = AlgebraNotation.toCol(move[0]);
    const from_row = AlgebraNotation.toRow(move[1]);
    const to_col = AlgebraNotation.toCol(move[2]);
    const to_row = AlgebraNotation.toRow(move[3]);

    let offending_move;
    const moves = new LegalMoveGenerator(board).gen_legal_moves();

    for (const move of moves) {
        if (move.from_col == from_col &&
            move.from_row == from_row &&
            move.to_row == to_row &&
            move.to_col == to_col
        ) {
            offending_move = move;
            break;
        }
    }

    return offending_move;
}

function find_offender_divide(board: Board, depth: number, local: Perft.perft_divide, stockfish: Perft.perft_divide) {
    if (depth == 1) {
        print_moves(board);
        expect(local).toStrictEqual(stockfish);
    }

    let max_diff_move = max_diff_move_divide(local, stockfish);

    if (max_diff_move == undefined) throw Error("Local and Stockfish perft divides are the same!");

    const offending_move = find_move(board, max_diff_move);

    if (offending_move == undefined) throw Error(`Offending move isn't generated locally!\nmove: ${max_diff_move}`);

    board.move(offending_move);

    const new_local = Perft.divide(board, depth - 1);
    const new_stockfish = divideStockfish(board, depth - 1);

    find_offender_divide(board, depth - 1, new_local, new_stockfish);
}

describe("Tests for move generation using perft.", () => {
    const tests = [
        // depth, expected result, fen_string
        [1, 20, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
        // [2, 400, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
        // [3, 8902, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
        // [4, 197281, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
        // [5, 4865609, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
        // [6, 119060324, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
        [1, 24, "n1n5/PPPk4/8/8/8/8/4Kppp/5N1N b - - 0 1"],
        // [5, 193690690, "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"],
        // [7, 178633661, "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1"],
        // [6, 706045033, "r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1"],
        // [5, 1063513, "1k6/1b6/8/8/7R/8/8/4K2R b K - 0 1"],
        // [6, 1134888, "3k4/3p4/8/K1P4r/8/8/8/8 b - - 0 1"],
        // [6, 1015133, "8/8/4k3/8/2p5/8/B2P2K1/8 w - - 0 1"],
        // [6, 1440467, "8/8/1k6/2b5/2pP4/8/5K2/8 b - d3 0 1"],
        // [6, 661072, "5k2/8/8/8/8/8/8/4K2R w K - 0 1"],
        // [6, 803711, "3k4/8/8/8/8/8/8/R3K3 w Q - 0 1"],
        // [4, 1274206, "r3k2r/1b4bq/8/8/8/8/7B/R3K2R w KQkq - 0 1"],
        // [4, 1720476, "r3k2r/8/3Q4/8/8/5q2/8/R3K2R b KQkq - 0 1"],
        // [6, 3821001, "2K2r2/4P3/8/8/8/8/8/3k4 w - - 0 1"],
        // [5, 1004658, "8/8/1P2K3/8/2n5/1q6/8/5k2 b - - 0 1"],
        // [6, 217342, "4k3/1P6/8/8/8/8/K7/8 w - - 0 1"],
        // [6, 92683, "8/P1k5/K7/8/8/8/8/8 w - - 0 1"],
        // [6, 2217, "K1k5/8/P7/8/8/8/8/8 w - - 0 1"],
        // [7, 567584, "8/k1P5/8/1K6/8/8/8/8 w - - 0 1"],
        // [4, 23527, "8/8/2k5/5q2/5n2/8/5K2/8 b - - 0 1"]
    ];

    test("Stockfish binary exists.", () => {
        try {
            expect(existsSync("./Stockfish/src/stockfish")).toBe(true);
        } catch {
            throw Error("You need to compile Stockfish locally. (https://github.com/official-stockfish/Stockfish/wiki/Compiling-from-source)");
        }
    });

    test("Stockfish interoperation is functioning correctly.", () => {
        const [depth, expected_result, fen_string] = tests[0];
        const board = BoardFactory.createFEN(<string>fen_string);

        expect(divideStockfish(board, (<number>depth))).toMatchInlineSnapshot(`
{
  "a2a3": 1,
  "a2a4": 1,
  "b1a3": 1,
  "b1c3": 1,
  "b2b3": 1,
  "b2b4": 1,
  "c2c3": 1,
  "c2c4": 1,
  "d2d3": 1,
  "d2d4": 1,
  "e2e3": 1,
  "e2e4": 1,
  "f2f3": 1,
  "f2f4": 1,
  "g1f3": 1,
  "g1h3": 1,
  "g2g3": 1,
  "g2g4": 1,
  "h2h3": 1,
  "h2h4": 1,
  "num_positions": 20,
}
`);
    });

    test.each(tests)("Depth: %i | Expected Result: %s", (depth, expected_result, fen_string) => {
        const board = BoardFactory.createFEN(<string>fen_string);

        const local = Perft.divide(board, <number>depth);
        const stockfish = divideStockfish(board, <number>depth);

        expect(FEN.from(board).raw_string).toBe(<string>fen_string);

        try {
            expect(local).toStrictEqual(stockfish);
            expect(local.num_positions).toBe(expected_result);
        } catch (error) {
            find_offender_divide(board, <number>depth, local, stockfish);
            throw error;
        }
    });
});
