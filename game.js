class Game {
  static instance;
  static SquareSize = Math.min(window.innerWidth, window.innerHeight) / 8;
  static #background;

  constructor(fenString) {
    if (Game.instance) throw Error("You can only have one game!");

    this.loadPosFromFen(fenString);

    this.selected = null;
  }

  loadPosFromFen(fen) {
    const lookup = {
      k: King,
      p: Pawn,
      n: Knight,
      b: Bishop,
      r: Rook,
      q: Queen,
    };
    const fields = fen.split(' ');

    // reading in pieces
    this.board = new Array(8).fill(0).map((_) => new Array(8));
    this.blackPieces = [];
    this.whitePieces = [];
    const fenBoard = fields.shift().split('/');

    for (let i = 0; i < fenBoard.length; i++) {
      let row = fenBoard[i].split('');
      let off = 0;
      for (let j = 0; j < row.length; j++) {
        if (/^\d$/g.test(row[j])) { // is a number
          const numOfSkips = parseInt(row[j]);
          for (let k = 0; k < numOfSkips; k++) {
            this.board[i][off + k] = [];
          }
          off += numOfSkips;
        } else {
          const color = row[j].toLocaleLowerCase() == row[j] ? 1 : 0;
          this.board[i][off] = (new (lookup[row[j].toLocaleLowerCase()])(i, off, color));
          if (this.board[i][off] instanceof Pawn) {
            if (color == 0 && i != 6) this.board[i][off].moveCount++;
            if (color == 1 && i != 1) this.board[i][off].moveCount++;
          } else if (this.board[i][off] instanceof King) {
            if (color == 0) this.whiteKing = this.board[i][off];
            else this.blackKing = this.board[i][off];
          }
          (color ? this.blackPieces : this.whitePieces).push(this.board[i][off]);
          off++;
        }
      }
    }

    // setting up game
    this.playerToMove = fields.shift() == 'w' ? 0 : 1;
    this.currentPieces = this.playerToMove ? this.blackPieces : this.whitePieces;
    this.enemyPieces = !this.playerToMove ? this.blackPieces : this.whitePieces;
    this.currentKing = this.playerToMove ? this.blackKing : this.whiteKing;
    this.enemyKing = !this.playerToMove ? this.blackKing : this.whiteKing;

    // which sides the kings can castle
    // doesnt really matter in this implementation
    fields.shift();

    const enPassantPiece = fields.shift();
    if (enPassantPiece != '-') {
      if (enPassantPiece[1] == '3') {
        // add this position to list of black pawn attack moves
      } else if (enPassantPiece[1] == '6') {
        // add this position to list of white pawn attack moves
      }
    }

    this.halfmoveCount = parseInt(fields.shift());
    this.fullmoveCount = parseInt(fields.shift());
  }

  getPosFromFen() {
    let fen = "";
    let count = 0;
    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board[0].length; j++) {
        const piece = this.board[i][j];
        if (piece instanceof Array) {
          count++;
        } else {
          if (count != 0) fen += count.toString();
          count = 0;
        }

        if (piece instanceof King) {
          fen += piece.color ? 'k' : 'K';
        } else if (piece instanceof Pawn) {
          fen += piece.color ? 'p' : 'P';
        } else if (piece instanceof Knight) {
          fen += piece.color ? 'n' : 'N';
        } else if (piece instanceof Bishop) {
          fen += piece.color ? 'b' : 'B';
        } else if (piece instanceof Rook) {
          fen += piece.color ? 'r' : 'R';
        } else if (piece instanceof Queen) {
          fen += piece.color ? 'q' : 'Q';
        }
      }
      if (count != 0) fen += count.toString();
      count = 0;
      fen += '/'
    }

    fen = `${fen.slice(0, fen.length - 1)} ${this.playerToMove ? 'b' : 'w'} KQkq - ${this.halfmoveCount} ${this.fullmoveCount}`;
    console.log(fen);
  }

  update() {
    if (mouseIsPressed && mouseButton === LEFT) {
      if (this.selected === null) {
        this.selected = this.board[Math.floor(mouseY / Game.SquareSize)][Math.floor(mouseX / Game.SquareSize)];
        if (this.selected === undefined || this.selected instanceof Array) this.selected = null;
        if (this.selected && this.selected.color != this.playerToMove) this.selected = null;
      } else {
        // piece is selected
        this.selected.drawX = mouseX - Game.SquareSize / 2;
        this.selected.drawY = mouseY - Game.SquareSize / 2;
        this.selected.highlightMoves();
      }
    } else if (this.selected) {
      this.move(this.selected, Math.floor(mouseY / Game.SquareSize), Math.floor(mouseX / Game.SquareSize));
      this.selected = null;
    }
  }

  drawPieces() {
    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board[0].length; j++) {
        const piece = this.board[i][j];
        if (piece instanceof Piece) piece.draw();
      }
    }
  }

  calculateMoves() {
    console.time("Calculate Moves");

    // reset board attacks and moves
    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board[0].length; j++) {
        let piece = this.board[i][j];
        if (piece instanceof Piece) {
          piece.moves = [];
          piece.attacks = [];
        } else {
          piece = [];
        }
      }
    }

    /*
    for (let i = 0; i < this.enemyPieces.length; i++) {
      this.enemyPieces[i].generateAttacks();
    }
    */

    // returns pinned pieces and their moves are already generated
    const pinnedPieces = this.currentKing.getPinnedPieces();

    if (this.currentKing.inCheck()) {
      // add moves that MOVE king to a square that isn't being attacked (move king out of check)
      // add moves that CAPTURE the piece that is delivering check (not pinned pieces unless they deliver check)
      // add moves that BLOCK the check 
      // add moves for pinned pieces that deliver a check (not necessarily by pinned piece; can be revealed)
    } else {
      for (let i = 0; i < this.board.length; i++) {
        for (let j = 0; j < this.board[0].length; j++) {
          if (this.board[i][j] instanceof Piece) this.board[i][j].generateMoves();
        }
      }
    }

    // HOW

    // get current attacks of enemy player
    // at the same time get all possible attacks of player for king move generation (sliding pieces arent blocked)

    // get pinned pieces (scan like moves of a queen for pieces that have corresponding piece after them)

    // if king is being attacked (check)
    //    add moves that MOVE king to a square that isn't being attacked (move king out of check)
    //    add moves that CAPTURE the piece that is delivering check (not pinned pieces unless they deliver check)
    //    add moves that BLOCK the check 
    //    add moves for pinned pieces that deliver a check (not necessarily by pinned piece; can be revealed)
    // otherwise
    //    generate normal moves except for pinned pieces
    //    add moves for pinned pieces that deliver a check (not necessarily by pinned piece; can be revealed)



    // RULES
    // no pieces can jump other pieces (except knight and [CASTLING])

    // CHECK: king is in check when it is attacked by at least one enemy piece
    //      no moves can put or leave king in check
    //      a piece that is pinned MAY still check opponent
    //      MOVE king to a square that isn't being attacked (move king out of check)
    //      CAPTURE the piece that is delivering check (not pinned pieces unless they put opponenet in check)
    //      BLOCK the check by placing a piece in the way of the piece delivering check to where there is no check

    // KING: can move to any square around it that isnt being attacked
    //       [CASTLING]

    // ROOK: can move to any amount of squares vertically or horizontally

    // BISHOP: can move to any amount of squares diagonally

    // QUEEN: can move to any amount vertically, horizontally, or diagonally

    // KNIGHT: can move to any square not on the same row, col, or diagonal (basically in L shape ; also can jump pieces)

    // PAWNS: can move forward one or two squares if they are vacant along with en passant and promotions
    //      moves forward one square if it is vacant
    //      moves forward two squares if they are both vacant AND itself hasn't moved yet
    //      captures diagonally in front of itself if they are NOT vacant
    //      capture [EN PASSANT]
    //      [PROMOTION]

    // [CASTLING]: a king moves two squares towards a rook that goes on the other side of king
    //           king and rook must NOT have moved
    //           no pieces between king and rook
    //           king can NOT be in check
    //           king can NOT pass through a square under attack
    //           king can NOT end up in a square under attack

    // [EN PASSANT]: an enemy pawn can capture a pawn that just moved up two spaces if it is adjacent to it after the move because it is a lost capture???
    //    enemy pawn must have just moved 2 squares forward (first move of enemy)
    //    only allowed on first move after enemy pawn has moved forward two squares
    //    pawns are adjacent on same row
    //    pawn takes enemy pawn and moves to one square behind enemy pawn

    // [PROMOTION]: a pawn can become any piece except a king when getting to the other side of the board
    //            pawn advances to opposite side of the board (last row)
    //            player can choose to turn pawn into a queen, rook, bishop, or knight of the same color

    console.timeEnd("Calculate Moves");
  }

  move(startPiece, targetRow, targetCol) {
    if (startPiece instanceof Array) return;

    const move = startPiece.canMove(targetRow, targetCol);

    if (move !== null) {
      move.move(startPiece, targetRow, targetCol);
      this.playerToMove = !this.playerToMove;
      this.currentPieces = this.playerToMove ? this.blackPieces : this.whitePieces;
      this.enemyPieces = !this.playerToMove ? this.blackPieces : this.whitePieces;
      this.currentKing = this.playerToMove ? this.blackKing : this.whiteKing;
      this.enemyKing = !this.playerToMove ? this.blackKing : this.whiteKing;
      this.calculateMoves();

      this.halfmoveCount++;
      if (this.playerToMove == 0) this.fullmoveCount++;
    }

    startPiece.drawX = startPiece.col * Game.SquareSize;
    startPiece.drawY = startPiece.row * Game.SquareSize;
  }

  static resizeBackground(size) {
    const SquareColorEven = "#f1d9c0";
    const SquareColorOdd = "#a97b65";

    this.#background.resizeCanvas(size, size);
    this.#background.background(color(SquareColorEven));
    this.#background.fill(color(SquareColorOdd));
    this.#background.noStroke();
    Game.SquareSize = width / 8;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if ((i + j) & 1 != 0) this.#background.rect(i * Game.SquareSize, j * Game.SquareSize, Game.SquareSize, Game.SquareSize);
      }
    }
  }

  static drawBackground() {
    image(this.#background, 0, 0);
  }

  static set background(bg) {
    if (!this.#background) this.#background = bg;
  }
}