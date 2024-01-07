import { Board } from "./board";
import { FEN } from "./fen_notation";
import { GUI } from "./gui";

window.onload = function () {
    const fen = new FEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const board = new Board(fen.board, [], fen.active_color, fen.castling_options, fen.halfmove);

    const gui = new GUI(board);
    console.log(gui);
}
