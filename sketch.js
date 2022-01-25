//let fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; // default
//let fen = '8/8/8/8/8/8/8/R3K3 w KQkq - 0 1'; // castling test
//let fen = 'rnbqkbnr/8/8/8/8/8/8/RNBQKBNR w KQkq - 0 1'; // no pawns board
//let fen = 'rbqk4/8/8/8/8/8/8/4QBRK w KQkq - 0 1'; // Sliding Pieces test
//let fen = '8/4K3/8/8/8/8/4k3/8 w KQkq - 0 1'; // King Test
//let fen = '8/8/8/2N2n2/8/8/8/k2K4 w KQkq - 0 1'; // Knight Test
//let fen = 'rnb1kbkr/pppp1pppp/8/4p3/4P2q/PQ4PP/8/RNB1KBNR w KQkq - 0 1'; //Check test
//let fen = 'rnbqkbnr/1ppp1ppp/8/p3p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1'; //Check&Checkmate check
//let fen = '8/8/8/KQ5r/8/8/8/7k w KQkq - 0 1'; //pinned pieces horiztonal | 7k/8/8/r5QK/8/8/8/8 | 8/8/8/KQ5r/8/8/8/7k
//let fen = '8/2P6/8/kp5R/8/8/8/7K w KQkq - 0 1'; // Pinned pieces test (en passant)
//let fen = 'K7/8/8/P7/8/8/8/r6k w KQkq - 0 1'; // pinned vertical test
//let fen = 'q7/1K6/8/8/8/8/8/7k w KQkq - 0 1';
//let fen = '7K/6Q1/8/8/8/8/8/q6k w KQkq - 0 1';
//let fen = '8/K7/8/8/8/4q3/8/7k w KQkq - 0 1';
//let fen = 'r3k3/1p3p2/p2q2p1/bn3P2/1N2PQP1/PB6/3K1R1r/3R4 w KQkq - 0 1'; //test board
//let fen = 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQkq - 0 1';
let fen = "rnbqkbnr/pppp1ppp/8/4pP2/8/8/PPPPP1PP/RNBQKBNR b KQkq - 0 1" // en passant test


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