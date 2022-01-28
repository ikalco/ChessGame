//let fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; // default board

let fen = "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8";

function setup() {
  const size = Math.min(windowWidth, windowHeight);
  createCanvas(size, size);

  Game.debug = true;

  Game.background = createGraphics(size, size);
  Game.resizeBackground(size);

  Game.instance = new Game(fen);
  Game.instance.calculateMoves();

  console.log(Game.instance.perftDivide(4));
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

function testingthis(...parameters) {
  console.log(parameters);
}