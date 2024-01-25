import { BoardFactory } from "./board_factory";
import { GUI } from "./gui";

export const board = BoardFactory.createFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

window.onload = function () {
    const gui = new GUI(board);
};