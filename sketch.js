//let fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; // default board
let fen = "rnbqkbnr/1ppp1ppp/8/p3p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 6 4";

function setup() {
  const size = Math.min(windowWidth, windowHeight);
  createCanvas(size, size);

  Game.background = createGraphics(size, size);
  Game.resizeBackground(size);

  Game.instance = new Game(fen);
  Game.instance.calculateMoves();
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