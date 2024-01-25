import { describe, expect, test } from '@jest/globals';
import * as cp from "node:child_process";
import { existsSync } from "node:fs";

import { Board } from '../src/board';
import { BoardFactory } from '../src/board_factory';
import { LegalMoveGenerator } from '../src/legal_move_generator';
import { Move } from '../src/move';
import { AlgebraNotation } from '../src/algebra_notation';
import { FEN } from '../src/fen_notation';

describe("Tests for move generation using perft.", () => {
    const tests = [
        // depth, expected result, fen_string
        [1, 20, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
        [2, 400, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
        [3, 8902, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
        [4, 197281, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
        // [5, 4865609, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
        // [6, 119060324, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
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

    type perft_divide = {
        [key: string]: number,
        num_positions: number;
    };

    function perftBulk(board: Board, generator: LegalMoveGenerator, depth: number) {
        if (depth == 0) return 1;

        const moves: Move[] = generator.gen_legal_moves();

        if (depth == 1) return moves.length;

        let num_positions = 0;

        for (const move of moves) {
            board.move(move);
            num_positions += perftBulk(board, generator, depth - 1);
            board.unmove();
        }

        return num_positions;
    }

    function perftDivide(board: Board, generator: LegalMoveGenerator, depth: number) {
        let result: perft_divide = {
            num_positions: 0
        };

        const moves: Move[] = generator.gen_legal_moves();

        for (const move of moves) {
            board.move(move);
            const positions = perftBulk(board, generator, depth - 1);
            board.unmove();

            result.num_positions += positions;
            result[AlgebraNotation.fromMoveSimple(move)] = positions;
        }

        return result;
    }

    function stockfishPerftDivide(board: Board, depth: number) {
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

        let result: perft_divide = {
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

        expect(stockfishPerftDivide(board, (<number>depth))).toMatchInlineSnapshot(`
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
        const generator = new LegalMoveGenerator(board);

        expect(perftBulk(board, generator, <number>depth)).toBe(<number>expected_result);
    });
});
