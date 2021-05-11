let [isMove, n] = [false, 0];
let whitePieces = [];
let blackPieces = [];
let blackKingSquare = 4;
let whiteKingSquare = 60;
let prevBoardSquares = [];
let turns = true;

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
    this.imgLookup = {
      0b00000: chessPiecesImg.get(-1000, 0.5, 333.33334, 333.5),
      0b01001: chessPiecesImg.get(0, 0.5, 333.33334, 333.5),
      0b01010: chessPiecesImg.get(1665, 0.5, 333.33334, 333.5),
      0b01011: chessPiecesImg.get(999, 0.5, 333.33334, 333.5),
      0b01100: chessPiecesImg.get(666, 0.5, 333.33334, 333.5),
      0b01101: chessPiecesImg.get(1332, 0.5, 333.33334, 333.5),
      0b01110: chessPiecesImg.get(333, 0.5, 333.33334, 333.5),
      0b10001: chessPiecesImg.get(0, 333.5, 333.33334, 333.5),
      0b10010: chessPiecesImg.get(1665, 333.5, 333.33334, 333.5),
      0b10011: chessPiecesImg.get(999, 333.5, 333.33334, 333.5),
      0b10100: chessPiecesImg.get(666, 333.5, 333.33334, 333.5),
      0b10101: chessPiecesImg.get(1332, 333.5, 333.33334, 333.5),
      0b10110: chessPiecesImg.get(333, 333.5, 333.33334, 333.5),
    };
  }

  makeMove(move) {
    if (move == undefined) return;
    if (Piece.IsColor(move.startPiece, this.ColorToMove)) {
      if (this.Squares[move.startSquare].type == move.startPiece.type && this.Squares[move.targetSquare].type == move.targetPiece.type) {
        playedMoves.push(move);
        this.Squares[move.startSquare].prevMoved = this.Squares[move.startSquare].moved;
        this.Squares[move.startSquare].moved = true;

        move.startPiece.col = move.targetCol;
        move.startPiece.row = move.targetRow;

        move.startPiece.x = move.targetCol * PiecePxSize;
        move.startPiece.y = move.targetRow * PiecePxSize;

        // Setting the square we let go on to the piece we clicked on | also does some handling for enpassant
        this.Squares[move.targetSquare] = this.Squares[move.startSquare];
        if (move.targetSquare != move.takeSquare) this.Squares[move.takeSquare] = new Piece(Piece.Empty, move.startSquare);
        this.Squares[move.startSquare] = new Piece(Piece.Empty, move.startSquare);

        // Keeping track of the kings
        if (move.startPiece.type == Piece.White + Piece.King) whiteKingSquare = move.targetSquare;
        if (move.startPiece.type == Piece.Black + Piece.King) blackKingSquare = move.targetSquare;

        // Castling
        if (move.extraMove != undefined) {
          //move.extraMove[1] = the square rook moves to when castling | targetSquare
          //move.extraMove[0] = the square rook is on before the castle | startSquare
          this.Squares[move.extraMove[1]] = this.Squares[move.extraMove[0]]; // setting targetSquare to startSquare Piece
          this.Squares[move.extraMove[1]].update(move.extraMove[1]); // updating col,row,x, and y of rook
          this.Squares[move.extraMove[0]] = new Piece(Piece.Empty, move.extraMove[0]); // setting startSquare to empty
        }

        if (Piece.getPiece(this.Squares[move.targetSquare]) == Piece.Pawn && (move.targetRow == 0 || move.targetRow == 7)) {
          this.Squares[move.targetSquare].type += 4; // promotes piece
          this.Squares[move.targetSquare].promoted = true;
        }

        moves = generateMoves();
        this.movePlayed();
        return true;
      } else {
        console.log("Couldn't make move because the board isn't the same");
        console.log(move);
        console.log(this.Squares);
        return false;
      }
    } else {
      console.log("Couldn't make move because its not its turn.");
      console.log(move);
      console.log(this.Squares);
      return false;
    }
  }

  unmakeMove(move) {
    if (move == undefined) return;
    if (Piece.IsPiece(this.Squares[move.startSquare], Piece.Empty) && this.Squares[move.targetSquare] == move.startPiece) {
      playedMoves.pop();
      move.startPiece.moved = move.startPiece.prevMoved;

      move.startPiece.col = move.startCol;
      move.startPiece.row = move.startRow;

      move.startPiece.x = move.startCol * PiecePxSize;
      move.startPiece.y = move.startRow * PiecePxSize;

      this.Squares[move.startSquare] = move.startPiece;
      if (move.targetSquare != move.takeSquare) this.Squares[move.takeSquare] = move.takePiece;
      this.Squares[move.targetSquare] = new Piece(Piece.Empty, move.targetSquare);

      if (move.startPiece.type == Piece.White + Piece.King) whiteKingSquare = move.startSquare;
      if (move.startPiece.type == Piece.Black + Piece.King) blackKingSquare = move.startSquare;

      if (move.extraMove != undefined) {
        this.Squares[move.extraMove[0]] = this.Squares[move.extraMove[1]];
        this.Squares[move.extraMove[0]].update(move.extraMove[0]);
        this.Squares[move.extraMove[1]] = new Piece(Piece.Empty, move.extraMove[1]);
      }

      if (this.Squares[move.startSquare].promoted) {
        this.Squares[move.startSquare].type -= 4;
        this.Squares[move.startSquare].promoted = false;
      }

      return true;
    }
  }

  checkForRules() {
    //Centering piece after releasing mouse
    let col = floor((this.Squares[n].x + PiecePxSize / 2) / PiecePxSize);
    let row = floor((this.Squares[n].y + PiecePxSize / 2) / PiecePxSize);
    // Center the piece
    this.Squares[n].x = col * PiecePxSize;
    this.Squares[n].y = row * PiecePxSize;

    // if the piece didnt move return
    if (this.Squares[n].col == col && this.Squares[n].row == row) {
      return;
    }

    let dropSquare = row * 8 + col;

    //[]Checking For Empty Square or if you can take the target piece
    if (this.Squares[dropSquare].type == 0 || Piece.getColor(this.Squares[n]) != Piece.getColor(this.Squares[dropSquare])) {
      if (this.checkForMovementRules(row, col)) {
        this.movePlayed();
        moves = generateMoves();
        return;
      }
    }

    // Sets piece back to beginning if cant do anything else
    this.Squares[n].x = this.Squares[n].col * PiecePxSize;
    this.Squares[n].y = this.Squares[n].row * PiecePxSize;
    return;
  }

  checkForMovementRules(row, col) {
    let clickPiece = this.Squares[n];
    let dropPiece = this.Squares[row * 8 + col];

    for (let i = 0; i < moves.length; i++) {
      let move = moves[i];
      if (move.startSquare == clickPiece.row * 8 + clickPiece.col && move.targetSquare == dropPiece.row * 8 + dropPiece.col) {
        playedMoves.push(moves[i]);
        this.Squares[move.startSquare].moved = true;
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
          this.Squares[move.extraMove[1]] = this.Squares[move.extraMove[0]];
          this.Squares[move.extraMove[1]].update(move.extraMove[1]);
          this.Squares[move.extraMove[0]] = new Piece(Piece.Empty, move.extraMove[0]);
        }

        //Promotion
        if (Piece.getPiece(this.Squares[move.targetSquare]) == Piece.Pawn && (move.targetRow == 0 || move.targetRow == 7)) {
          Promotion(move.targetSquare);
        }

        return true;
      }
    }
    return false;
  }

  dragDrop() {
    if (mouseIsPressed && mouseButton === LEFT) {
      for (let i = 0; i < this.Squares.length; i++) {
        if (this.Squares[i] == undefined) continue;
        if (Piece.IsColor(this.Squares[i], this.ColorToMove) && turns == true) {
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

    //This is where the moves are being drawn
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
      //Drawing Piece
      image(this.imgLookup[this.Squares[p].type], this.Squares[p].x, this.Squares[p].y, PiecePxSize, PiecePxSize);
    }
  }

  update() {
    if (moves.every((move) => Piece.getColor(move.startPiece) == 1)) {
      console.log('Black in Checkmate.');
    }
    if (moves.every((move) => Piece.getColor(move.startPiece) == 2)) {
      console.log('White in Checkmate.');
    }
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        backBoard[i][j].update();
      }
    }
    this.dragDrop();
    this.draw();
  }

  getPosFromFen() {
    let lookUp = {
      0b00001: k,
      0b00010: p,
      0b00011: n,
      0b00100: b,
      0b00101: r,
      0b00110: q,
    };
    for (let i = 0; i < this.Squares.length; i++) {
      let piece = this.Squares[i];
      let fenPiece = lookUp[Piece.getPiece(piece)];
      if (Piece.IsColor(piece, 1)) fenPiece.toUpperCase();
      if (Piece.IsColor(piece, 2)) fenPiece.toLowerCase();
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
    console.log(fen);

    for (let i = 0; i < this.Squares.length; i++) {
      if (Piece.IsPiece(this.Squares[i], Piece.King)) {
        if (Piece.IsColor(this.Squares[i], 1)) {
          whiteKingSquare = i;
        } else {
          blackKingSquare = i;
        }
      }
    }
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
