class BoardC {
  constructor() {
    this.Squares = new Array(64);
  }

  draw() {
    for (let p in this.Squares) {
      let tmp =
        this.Squares[p].toString(2).length < 5
          ? "0" + this.Squares[p].toString(2)
          : this.Squares[p].toString(2);
      let img = this.decPieceBin(tmp);
      if (img == undefined) {
        continue;
      }
      let row = p % 8 > 0 ? (p - (p % 8)) / 8 : p / 8;
      let x = row * PiecePxSize; //Row
      let y = (p - row * 8) * PiecePxSize; //Col
      image(img, y, x, PiecePxSize, PiecePxSize);
    }
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
    let fenBoard = fen.split(" ")[0];
    let file = 0;
    let rank = 0;

    for (let i = 0; i < fenBoard.length; i++) {
      const symbol = fenBoard[i];
      if (symbol == "/") {
        file = 0;
        rank++;
      } else {
        if (/^-?\d+$/.test(symbol)) {
          file += parseInt(symbol);
        } else {
          let pieceColor =
            symbol == symbol.toUpperCase() ? Piece.White : Piece.Black;
          let pieceType = lookUp[symbol.toLowerCase()];
          this.Squares[rank * 8 + file] = pieceColor | pieceType;
          file++;
        }
      }
    }
    print(fen);
  }

  decPieceBin(tmp) {
    let p = eval("0b" + tmp[2] + tmp[3] + tmp[4]);
    let img;
    if (eval("0b" + tmp[0] + tmp[1]) == 1) {
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
