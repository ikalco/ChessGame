let [isMove, n] = [false, 0];
let whitePieces = [];
let blackPieces = [];
let blackKingSquare = 4;
let whiteKingSquare = 60;
let prevBoardSquares = [];

function mouseReleased() {
  //Mouse Released
  if (mouseButton === LEFT) {
    isMove = false;
    Board.checkForRules();
  }
}

class BoardC {
  constructor() {
    this.Squares = new Array(64);
    this.ColorToMove = 1;
  }

  checkForMovementRules(row, col) {
    let clickPiece = this.Squares[n];
    let dropPiece = this.Squares[row * 8 + col];

    for (let i = 0; i < moves.length; i++) {
      let move = moves[i];
      if (move.startSquare == clickPiece.row * 8 + clickPiece.col && move.targetSquare == dropPiece.row * 8 + dropPiece.col) {
        playedMoves.push(moves[i]);
        Board.Squares[move.startSquare].moved = true;
        this.Squares[n].col = col;
        this.Squares[n].row = row;

        //Runs everytime a move is played
        this.Squares[move.targetSquare] = this.Squares[move.startSquare];
        if (move.targetSquare != move.takeSquare) this.Squares[move.takeSquare] = new Piece(Piece.Empty, n);
        this.Squares[move.startSquare] = new Piece(Piece.Empty, n);

        //Keeping Track of the kings
        if (move.startPiece.type == Piece.White + Piece.King) whiteKingSquare = move.targetSquare;
        if (move.startPiece.type == Piece.Black + Piece.King) blackKingSquare = move.targetSquare;

        // Castling
        if (move.extraMove != undefined) {
          Board.Squares[move.extraMove[1]] = Board.Squares[move.extraMove[0]];
          Board.Squares[move.extraMove[1]].update(move.extraMove[1]);
          Board.Squares[move.extraMove[0]] = new Piece(Piece.Empty, move.extraMove[0]);
        }

        //Promotion
        if (Piece.getPiece(Board.Squares[move.targetSquare]) == Piece.Pawn && (move.targetRow == 0 || move.targetRow == 7)) {
          Promotion(move.targetSquare);
        }

        return true;
      }
    }
    return false;
  }

  checkForRules() {
    //Centering piece after releasing mouse
    let col = floor((this.Squares[n].x + PiecePxSize / 2) / PiecePxSize);
    let row = floor((this.Squares[n].y + PiecePxSize / 2) / PiecePxSize);
    this.Squares[n].x = col * PiecePxSize;
    this.Squares[n].y = row * PiecePxSize;

    if (this.Squares[n].col == col && this.Squares[n].row == row) {
      return;
    }

    let dropSquare = row * 8 + col;

    //[]Checking For Empty Square and if you can take a piece
    if (this.Squares[dropSquare].type == 0 || Piece.getColor(this.Squares[n]) != Piece.getColor(this.Squares[dropSquare])) {
      if (this.checkForMovementRules(row, col)) {
        this.movePlayed();
        generateMoves();
        return;
      }
    }

    // Sets piece back to beginning if cant do anything else
    this.Squares[n].x = this.Squares[n].col * PiecePxSize;
    this.Squares[n].y = this.Squares[n].row * PiecePxSize;
    return;
  }

  dragDrop() {
    if (mouseIsPressed && mouseButton === LEFT) {
      for (let i = 0; i < this.Squares.length; i++) {
        if (this.Squares[i] == undefined) continue;
        if (Piece.IsColor(this.Squares[i], Board.ColorToMove)) {
          if (mouseX >= this.Squares[i].x && mouseX <= this.Squares[i].x + PiecePxSize) {
            if (mouseY >= this.Squares[i].y && mouseY <= this.Squares[i].y + PiecePxSize) {
              if (isMove == false) {
                n = i;
              }
              isMove = true;
            }
          }
        }
      }
    }

    if (isMove == true) {
      this.Squares[n].x = mouseX - PiecePxSize / 2;
      this.Squares[n].y = mouseY - PiecePxSize / 2;
      for (let i = 0; i < moves.length; i++) {
        //moves[i].draw();
        if (moves[i].startSquare == this.Squares[n].row * 8 + this.Squares[n].col) moves[i].draw();
      }
      push();
      fill(255, 191, 0, 10);
      rect(this.Squares[n].col * PiecePxSize, this.Squares[n].row * PiecePxSize, PiecePxSize);
      pop();
    }
  }

  draw() {
    //Drawing each piece

    for (let p in this.Squares) {
      let img = this.decPieceBin(this.Squares[p]);
      if (img == undefined) {
        continue;
      }

      //Drawing Piece
      image(img, this.Squares[p].x, this.Squares[p].y, PiecePxSize, PiecePxSize);
    }
  }

  update() {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        backBoard[i][j].update();
      }
    }
    this.dragDrop();
    this.draw();
  }

  loadPosFromFen(fen) {
    let lookUp = {
      k: Piece.King,
      p: Piece.Pawn,
      n: Piece.Knight,
      b: Piece.Bishop,
      r: Piece.Rook,
      q: Piece.Queen,
    };
    let fenBoard = fen.split(' ')[0];
    let file = 0;
    let rank = 0;

    for (let i = 0; i < fenBoard.length; i++) {
      const symbol = fenBoard[i];
      if (symbol == '/') {
        file = 0;
        rank++;
      } else {
        if (/^-?\d+$/.test(symbol)) {
          for (let i = 0; i < parseInt(symbol); i++) {
            this.Squares[rank * 8 + (file + i)] = new Piece(Piece.Empty, rank * 8 + (file + i));
          }
          file += parseInt(symbol);
        } else {
          let pieceColor = symbol == symbol.toUpperCase() ? Piece.White : Piece.Black;
          let pieceType = lookUp[symbol.toLowerCase()];
          let piece = pieceColor | pieceType;
          this.Squares[rank * 8 + file] = new Piece(piece, rank * 8 + file);
          file++;
        }
      }
    }
    print(fen);
  }

  decPieceBin(piece) {
    let p = Piece.getPiece(piece);
    let img;
    if (Piece.getColor(piece) == 1) {
      switch (p) {
        //White
        case Piece.Empty:
          //Empty
          break;
        case Piece.King:
          //King
          img = chessPiecesImg.get(0, 0.5, 333.33334, 333.5);
          break;
        case Piece.Pawn:
          //Pawn
          img = chessPiecesImg.get(1665, 0.5, 333.33334, 333.5);
          break;
        case Piece.Knight:
          //Knight
          img = chessPiecesImg.get(999, 0.5, 333.33334, 333.5);
          break;
        case Piece.Bishop:
          //Bishop
          img = chessPiecesImg.get(666, 0.5, 333.33334, 333.5);
          break;
        case Piece.Rook:
          //Rook
          img = chessPiecesImg.get(1332, 0.5, 333.33334, 333.5);
          break;
        case Piece.Queen:
          //Queen
          img = chessPiecesImg.get(333, 0.5, 333.33334, 333.5);
          break;
      }
    } else {
      //Black
      switch (p) {
        //White
        case Piece.Empty:
          //Empty
          break;
        case Piece.King:
          //King
          img = chessPiecesImg.get(0, 333.5, 333.33334, 333.5);
          break;
        case Piece.Pawn:
          //Pawn
          img = chessPiecesImg.get(1665, 333.5, 333.33334, 333.5);
          break;
        case Piece.Knight:
          //Knight
          img = chessPiecesImg.get(999, 333.5, 333.33334, 333.5);
          break;
        case Piece.Bishop:
          //Bishop
          img = chessPiecesImg.get(666, 333.5, 333.33334, 333.5);
          break;
        case Piece.Rook:
          //Rook
          img = chessPiecesImg.get(1332, 333.5, 333.33334, 333.5);
          break;
        case Piece.Queen:
          //Queen
          img = chessPiecesImg.get(333, 333.5, 333.33334, 333.5);
          break;
      }
    }
    return img;
  }

  movePlayed() {
    this.ColorToMove = this.ColorToMove == 1 ? (this.ColorToMove = 2) : (this.ColorToMove = 1);
  }
}

function intTo5Bit(i) {
  let b = i.toString(2);
  while (b.length < 5) {
    b = '0' + b;
  }
  return b;
}
