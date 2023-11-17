window.onload = function () {
	gui = new GUI();
	board = new Board();
	board.loadFromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
}
