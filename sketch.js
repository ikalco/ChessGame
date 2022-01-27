//let fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; // default board
//let fen = "rnbqkbnr/pppppp1p/8/8/6p1/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" // en passant test
//let fen = '7k/8/8/8/8/8/8/R3K3 w KQkq - 0 1'; // castling test
//let fen = "rnbqkbnr/1ppp1ppp/8/p3p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 6 4";

let fen = "8/8/8/3k4/3R4/3K4/8/8 b KQkq - 9 5";

function setup() {
  const size = Math.min(windowWidth, windowHeight);
  createCanvas(size, size);

  Game.background = createGraphics(size, size);
  Game.resizeBackground(size);

  Game.instance = new Game(fen);
  Game.instance.calculateMoves();

  moveGenerationTest();
}

function draw() {
  Game.drawBackground();

  Game.instance.update();
  Game.instance.drawPieces();
}

function windowResized() {
  const size = Math.min(windowWidth, windowHeight);
  resizeCanvas(size, size);

  Game.resizeBackground(size);
}