let backBoard = [];
let Board;
let WIDTH = 800;
let HEIGHT = 800;
let PiecePxSize = WIDTH / 8;
let chessPiecesImg;
let backColor;
let moves = [];
let playedMoves = [];
let gotBackground = false;
let checkmate = false;
let fade = 0;
let fadeAmount = 5;
let chessEngine;

let startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; // default starting board
//let startFen = 'rbq5/8/8/8/8/8/8/5QBR'; // Sliding Pieces test
//let startFen = '8/4K3/8/8/8/8/4k3/8'; // King Test
//let startFen = '8/8/8/2N2n2/8/8/8/8'; // Knight Test
//let startFen = 'rnb1kbkr/pppp1pppp/8/4p3/4P2q/PQ4PP/8/RNB1KBNR'; //Check test
//let startFen = 'rnbqkbnr/1ppp1ppp/8/p3p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR'; //Check&Checkmate check
//let startFen = '8/8/8/KQ5r/8/8/8/7k'; //pinned pieces horiztonal | 7k/8/8/r5QK/8/8/8/8 | 8/8/8/KQ5r/8/8/8/7k
//let startFen = '8/2P6/8/kp5R/8/8/8/7K'; // Pinned pieces test (en passant)
//let startFen = 'K7/8/8/P7/8/8/8/r6k'; // pinned vertical test
//let startFen = 'q7/1K6/8/8/8/8/8/7k';
//let startFen = '7K/6Q1/8/8/8/8/8/q6k';
//let startFen = '8/K7/8/8/8/4q3/8/7k';
//let startFen = 'r3k3/1p3p2/p2q2p1/bn3P2/1N2PQP1/PB6/3K1R1r/3R4'; //test board
//let startFen = 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R';

function preload() {
  chessPiecesImg = loadImage('./Sprites/pieces.png');
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  strokeWeight(0);
  setupBackBoard();
  Board = new BoardC();
  Board.loadPosFromFen(startFen);
  preCalculateMoveData();
  moves = generateMoves();
  chessEngine = new ChessEngine();
  //Board.update();
  for (let i = 0; i < Board.Squares.length; i++) {
    let p = Board.Squares[i];
    if (Piece.IsPiece(p, Piece.Pawn) && ((p.row != 1 && Piece.IsColor(p, 2)) || (p.row != 6 && Piece.IsColor(p, 1)))) {
      p.moved = true;
    }
  }
}

function draw() {
  let img;
  if (!checkmate) {
    Board.update();
    chessEngine.update();
  } else if (gotBackground == false) {
    img = createImage(WIDTH, HEIGHT);
    filter(BLUR, 3);
    gotBackground = true;
  }
  drawCheckmate(img);
}

function drawCheckmate(img) {
  if (blackMoves.length == 0) {
    checkmate = true;
    if (img != undefined) background(img);
    textSize(76);
    textAlign(CENTER);
    fill(255, 255, 255, fade);
    strokeWeight(2);
    stroke(0, fade);
    if (fade < 250) text('Black is in Checkmate.', WIDTH / 2, HEIGHT / 2);
    if (fade < 250) fade += fadeAmount;
  }
  if (whiteMoves.length == 0) {
    checkmate = true;
    if (img != undefined) background(img);
    textSize(76);
    textAlign(CENTER);
    fill(255, 255, 255, fade);
    strokeWeight(2);
    stroke(0, fade);
    if (fade < 250) text('White is in Checkmate.', WIDTH / 2, HEIGHT / 2);
    if (fade < 250) fade += fadeAmount;
  }
}

function setupBackBoard() {
  for (let file = 0; file < 8; file++) {
    backBoard.push([]);
    for (let rank = 0; rank < 8; rank++) {
      backBoard[file].push(new ChessSquare([file, rank], ((file + rank) & 1) != 0 ? color(169, 122, 101) : color(241, 217, 192)));
    }
  }
}
