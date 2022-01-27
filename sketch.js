let fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; // default board
//let fen = "rnbqkbnr/pppppp1p/8/8/6p1/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" // en passant test
//let fen = '7k/8/8/8/8/8/8/R3K3 w KQkq - 0 1'; // castling test
//let fen = "rnbqkbnr/1ppp1ppp/8/p3p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 6 4";

//let fen = "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PP1NnPP/RNBQK2R w KQ - 1 8";

//let fen = "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1"; // no pawns

function setup() {
  const size = Math.min(windowWidth, windowHeight);
  createCanvas(size, size);

  Game.background = createGraphics(size, size);
  Game.resizeBackground(size);

  Game.instance = new Game(fen);
  Game.instance.calculateMoves();

  console.log(Game.instance.perft(4));
  console.log(Game.instance.captures, Game.instance.checks);
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