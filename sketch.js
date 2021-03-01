let backBoard = [];
let Board;
let WIDTH = 800;
let HEIGHT = 800;
let PiecePxSize = WIDTH / 8;
let chessPiecesImg;
let backColor;
let moves = [];
let playedMoves = [];

let startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; // default starting board
//let startFen = 'rbq5/8/8/8/8/8/8/5QBR'; // Sliding Pieces test
//let startFen = '8/4K3/8/8/8/8/4k3/8'; // King Test
//let startFen = '8/8/8/2N2n2/8/8/8/8'; // Knight Test
//let startFen = 'rnb1kbkr/pppp1pppp/8/4p3/4P2q/PQ4PP/8/RNB1KBNR'; //Check test

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

function draw() {
  Board.update();
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
