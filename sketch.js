let backBoard = [];
let Board;
let WIDTH = 800;
let HEIGHT = 800;
let PiecePxSize = WIDTH / 8;
let chessPiecesImg;
let backColor;

let startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function preload() {
  chessPiecesImg = loadImage('./Sprites/pieces.png');
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  setupBackBoard();
  Board = new BoardC();
  Board.loadPosFromFen(startFen);
}

function draw() {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      backBoard[i][j].update();
    }
  }
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
