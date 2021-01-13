let chessBoardPieces = [];
let WIDTH = 800;
let HEIGHT = 800;
let PiecePxSize = WIDTH / 8;
let chessPiecesImg;

function preload() {
  chessPiecesImg = loadImage("./Images/ChessPiecesImages.webp");
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  setupBoardPieces();
}

function draw() {
  background(220);
  for (let i = 0; i < chessBoardPieces.length; i++) {
    for (let j = 0; j < chessBoardPieces[i].length; j++) {
      let a = chessBoardPieces[i][j];
      a.show();
    }
  }
}

function setupBoardPieces() {
  chessBoardPieces = [
    [
      new Rook(0, [0, 0]),
      new Knight(0, [0, 1]),
      new Bishop(0, [0, 2]),
      new Queen(0, [0, 3]),
      new King(0, [0, 4]),
      new Bishop(0, [0, 5]),
      new Knight(0, [0, 6]),
      new Rook(0, [0, 7]),
    ],
  ];

  //Adding Pons
  let temp = [];
  for (let i = 0; i < 8; i++) {
    temp.push(new Pon(0, [1, i]));
  }
  chessBoardPieces.push(temp);

  //Adding empty spaces
  for (let i = chessBoardPieces.length; i < 6; i++) {
    temp = [];
    for (let j = 0; j < 8; j++) {
      temp.push(new Piece("", [i, j]));
    }
    chessBoardPieces.push(temp);
  }

  temp = [];
  for (let i = 0; i < 8; i++) {
    temp.push(new Pon(1, [chessBoardPieces.length, i]));
  }
  chessBoardPieces.push(temp);

  chessBoardPieces.push([
    new Rook(1, [chessBoardPieces.length, 0]),
    new Knight(1, [chessBoardPieces.length, 1]),
    new Bishop(1, [chessBoardPieces.length, 2]),
    new Queen(1, [chessBoardPieces.length, 3]),
    new King(1, [chessBoardPieces.length, 4]),
    new Bishop(1, [chessBoardPieces.length, 5]),
    new Knight(1, [chessBoardPieces.length, 6]),
    new Rook(1, [chessBoardPieces.length, 7]),
  ]);

  console.table(chessBoardPieces);
}
