// default starting board
// let defaultFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

let defaultFen = '8/8/8/8/8/8/8/R3K3 w KQkq - 0 1';

function setup() {
  const size = Math.min(windowWidth, windowHeight);
  createCanvas(size, size);

  Game.background = createGraphics(size, size);
  Game.resizeBackground(size);

  Game.instance = new Game(defaultFen);
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