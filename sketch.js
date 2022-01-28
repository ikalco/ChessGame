//let fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; // default board
let fen = "rnbqkbnr/pppppppp/8/8/8/2P5/PP1PPPPP/RNBQKBNR b KQkq - 1 1";

function setup() {
  const size = Math.min(windowWidth, windowHeight);
  createCanvas(size, size);

  Game.background = createGraphics(size, size);
  Game.resizeBackground(size);

  Game.instance = new Game(fen);

  // a2a3: 8457
  // b2b3: 9345
  // c2c3: 9272 #
  // d2d3: 11959 #
  // e2e3: 13134 #
  // f2f3: 8457 #
  // g2g3: 9345 
  // h2h3: 8457
  // a2a4: 9329
  // b2b4: 9332 #
  // c2c4: 9744 #
  // d2d4: 12435 #
  // e2e4: 13160 #
  // f2f4: 8929 #
  // g2g4: 9328 #
  // h2h4: 9329 
  // b1a3: 8885 #
  // b1c3: 9755 #
  // g1f3: 9748 #
  // g1h3: 8881 #

  // a7a6: 397
  // b7b6: 439
  // c7c6: 441 #
  // d7d6: 545 #
  // e7e6: 627 #
  // f7f6: 396 #
  // g7g6: 439
  // h7h6: 397
  // a7a5: 438
  // b7b5: 443
  // c7c5: 461
  // d7d5: 566
  // e7e5: 628
  // f7f5: 418
  // g7g5: 440
  // h7h5: 439
  // b8a6: 418
  // b8c6: 462
  // g8f6: 460
  // g8h6: 418

  console.log(Game.instance.perftDivide(3));

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