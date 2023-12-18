window.onload = function () {
	const board = new Board();
	board.loadFromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

	const gui = new GUI(board);
}
