import { BoardFactory } from "./board_factory";
import { GUI } from "./gui";

window.onload = function () {
    const board = BoardFactory.createFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

    const gui = new GUI(board);
    console.log(gui);
};
