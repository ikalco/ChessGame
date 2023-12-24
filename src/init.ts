import { FEN } from "./fen_notation.js";
import { GUI } from "./gui.js";

window.onload = function () {
	const fen = new FEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
	const board = fen.load();

	const gui = new GUI(board);
	console.log(gui);
}
