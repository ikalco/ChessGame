import { ChessNotation } from "./chess_notation.js";
import { GUI } from "./gui.js";

window.onload = function () {
	const board = ChessNotation.boardFromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

	const gui = new GUI(board);
	console.log(gui);
}
