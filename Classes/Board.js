let [isMove, n, clickSquareType, dropSquareType] = [false, 0, 0, 0];

class BoardC {
  constructor() {
    this.Squares = new Array(64);
  }

  draw() {
    //Drawing each piece

    for (let p in this.Squares) {
      const s = this.Squares[p];
      let img = this.decPieceBin(intTo5Bit(s.type));
      if (img == undefined) {
        continue;
      }

      //Drawing Piece
      image(img, s.x, s.y, PiecePxSize, PiecePxSize);
    }
  }

  checkForMovementRules() {
    let currentPiece = eval('0b' + clickSquareType[2] + clickSquareType[3] + clickSquareType[4]);
    //Pawn Rules
    if (currentPiece == 2) {
      //En Passant
    }
    //Rook Rules
    if (currentPiece == 5) {
    }
    //Knight Rules
    if (currentPiece == 3) {
    }
    //Bishop Rules
    if (currentPiece == 4) {
    }
    //Queen Rules
    if (currentPiece == 6) {
    }
    //King Rules
    if (currentPiece == 1) {
      //Castling
    }
  }

  checkForSimpleRules() {
    //Centering piece after releasing mouse
    let col = floor((Board.Squares[n].x + PiecePxSize / 2) / PiecePxSize);
    let row = floor((Board.Squares[n].y + PiecePxSize / 2) / PiecePxSize);

    Board.Squares[n].x = col * PiecePxSize;
    Board.Squares[n].y = row * PiecePxSize;

    let dropSquare = row * 8 + col;

    //[]Checking For Empty Square
    if (Board.Squares[dropSquare].type == 0) {
      //sets piece(n) col and row to dropSquare col and row
      Board.Squares[n].col = col;
      Board.Squares[n].row = row;

      Board.Squares[dropSquare] = Board.Squares[n]; // sets dropSquare to clickSquare
      Board.Squares[n] = new Piece(Piece.Empty, n); // sets click to empty
      return;
    }

    //[]Checking For different colored piece
    clickSquareType = intTo5Bit(this.Squares[n].type);
    dropSquareType = intTo5Bit(this.Squares[dropSquare].type);

    //Getting the colors
    let clickSquareColor = eval('0b' + clickSquareType[0] + clickSquareType[1]);
    let dropSquareColor = eval('0b' + dropSquareType[0] + dropSquareType[1]);
    // Checking if other peice is not the same color
    if (clickSquareColor != dropSquareColor) {
      //sets piece(n) col and row to dropSquare col and row
      this.Squares[n].col = col;
      this.Squares[n].row = row;

      this.Squares[dropSquare] = this.Squares[n]; // sets dropSquare to clickSquare
      this.Squares[n] = new Piece(Piece.Empty, n); // sets click to empty
    }

    //[]Checking for same colored piece
    if (clickSquareColor == dropSquareColor) {
      this.Squares[n].x = this.Squares[n].col * PiecePxSize;
      this.Squares[n].y = this.Squares[n].row * PiecePxSize;
    }
  }

  dragDrop() {
    if (mouseIsPressed && mouseButton === LEFT) {
      for (let i = 0; i < Board.Squares.length; i++) {
        if (mouseX >= Board.Squares[i].x && mouseX <= Board.Squares[i].x + PiecePxSize) {
          if (mouseY >= Board.Squares[i].y && mouseY <= Board.Squares[i].y + PiecePxSize) {
            if (isMove == false) {
              n = i;
            }
            isMove = true;
          }
        }
      }
    }

    window.onmouseup = function () {
      //Mouse Released
      if (mouseButton === LEFT) {
        isMove = false;
        Board.checkForSimpleRules();
        Board.checkForMovementRules();
      }
    };

    if (isMove == true) {
      this.Squares[n].x = mouseX - PiecePxSize / 2;
      this.Squares[n].y = mouseY - PiecePxSize / 2;
    }
  }

  update() {
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

  decPieceBin(tmp) {
    let p;
    if (tmp != 0) {
      p = eval('0b' + tmp[2] + tmp[3] + tmp[4]);
    }
    let img;
    if (eval('0b' + tmp[0] + tmp[1]) == 1) {
      switch (p) {
        //White
        case 0:
          //Empty
          break;
        case 1:
          //King
          img = chessPiecesImg.get(0, 0.5, 333.33334, 333.5);
          break;
        case 2:
          //Pawn
          img = chessPiecesImg.get(1665, 0.5, 333.33334, 333.5);
          break;
        case 3:
          //Knight
          img = chessPiecesImg.get(999, 0.5, 333.33334, 333.5);
          break;
        case 4:
          //Bishop
          img = chessPiecesImg.get(666, 0.5, 333.33334, 333.5);
          break;
        case 5:
          //Rook
          img = chessPiecesImg.get(1332, 0.5, 333.33334, 333.5);
          break;
        case 6:
          //Queen
          img = chessPiecesImg.get(333, 0.5, 333.33334, 333.5);
          break;
      }
    } else {
      //Black
      switch (p) {
        //White
        case 0:
          //Empty
          break;
        case 1:
          //King
          img = chessPiecesImg.get(0, 333.5, 333.33334, 333.5);
          break;
        case 2:
          //Pawn
          img = chessPiecesImg.get(1665, 333.5, 333.33334, 333.5);
          break;
        case 3:
          //Knight
          img = chessPiecesImg.get(999, 333.5, 333.33334, 333.5);
          break;
        case 4:
          //Bishop
          img = chessPiecesImg.get(666, 333.5, 333.33334, 333.5);
          break;
        case 5:
          //Rook
          img = chessPiecesImg.get(1332, 333.5, 333.33334, 333.5);
          break;
        case 6:
          //Queen
          img = chessPiecesImg.get(333, 333.5, 333.33334, 333.5);
          break;
      }
    }
    return img;
  }
}

function intTo5Bit(i) {
  let b = i.toString(2);
  while (b.length < 5) {
    b = '0' + b;
  }
  return b;
}
