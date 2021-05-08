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
let img;

let startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; // default starting board
//let startFen = 'rbq5/8/8/8/8/8/8/5QBR'; // Sliding Pieces test
//let startFen = '8/4K3/8/8/8/8/4k3/8'; // King Test
//let startFen = '8/8/8/2N2n2/8/8/8/8'; // Knight Test
//let startFen = 'rnb1kbkr/pppp1pppp/8/4p3/4P2q/PQ4PP/8/RNB1KBNR'; //Check test
//let startFen = '8/2p6/8/KP5r/8/8/8/8'; // Pinned pieces test (en passant)
//let startFen = 'rnbqkbnr/1ppp1ppp/8/p3p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR' //Check&Checkmate check

function preload() {
  chessPiecesImg = loadImage('./Sprites/pieces.png');
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  setupBackBoard();
  Board = new BoardC();
  Board.loadPosFromFen(startFen);
  preCalculateMoveData();
  generateMoves();
}

let fade = 0;
let fadeAmount = 5;

function draw() {
  if (!checkmate) {
    Board.update();
  } else if (gotBackground == false) {
    img = createImage(WIDTH, HEIGHT);
    filter(BLUR, 3);
    gotBackground = true;
  }
  drawCheckmate();
}

function drawCheckmate() {
  if (moves.every((move) => Piece.getColor(move.startPiece) == 1)) {
    checkmate = true;
    if (img != undefined) background(img);
    textSize(76);
    textAlign(CENTER);
    fill(0, 0, 0, fade);
    strokeWeight(2);
    stroke(255, fade);
    if (fade < 250) text('Black is in Checkmate.', WIDTH / 2, HEIGHT / 2);
    if (fade < 250) fade += fadeAmount;
  }
  if (moves.every((move) => Piece.getColor(move.startPiece) == 2)) {
    checkmate = true;
    if (img != undefined) background(img);
    textSize(76);
    textAlign(CENTER);
    fill(0, 0, 0, fade);
    strokeWeight(2);
    stroke(255, fade);
    if (fade < 250) text('White is in Checkmate.', WIDTH / 2, HEIGHT / 2);
    if (fade < 250) fade += fadeAmount;
  }
}

function setupBackBoard() {
  for (let file = 0; file < 8; file++) {
    backBoard.push([]);
    for (let rank = 0; rank < 8; rank++) {
      let isLightSquare = (file + rank) % 2 != 0;

      squareColor = isLightSquare ? color(169, 122, 101) : color(241, 217, 192);
      backBoard[file].push(new ChessSquare([file, rank], squareColor));
    }
  }
}
