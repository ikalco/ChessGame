class Game {
  static SquareSize = Math.min(window.innerWidth, window.innerHeight) / 8;
  static debug = false;
  static #background;
  static instance;

  constructor(fenString) {
    if (Game.instance) throw Error("You can only have one game!");

    this.loadPosFromFen(fenString);

    this.selected = null;
    this.running = true;
    this.history = [];

    this.captures = 0;
    this.checks = 0;
    this.lastDoubleMove = '-';

    this.expectedResults = {
      a2a3: 46833,
      b2b3: 46497,
      c2c3: 49406,
      g2g3: 44509,
      h2h3: 46762,
      a2a4: 48882,
      b2b4: 46696,
      g2g4: 45506,
      h2h4: 47811,
      d7c8q: 44226,
      d7c8r: 38077,
      d7c8b: 65053,
      d7c8n: 62009,
      b1d2: 40560,
      b1a3: 44378,
      b1c3: 50303,
      e2g1: 48844,
      e2c3: 54792,
      e2g3: 51892,
      e2d4: 52109,
      e2f4: 51127,
      c1d2: 46881,
      c1e3: 53637,
      c1f4: 52350,
      c1g5: 45601,
      c1h6: 40913,
      c4b3: 43453,
      c4d3: 43565,
      c4b5: 45559,
      c4d5: 48002,
      c4a6: 41884,
      c4e6: 49872,
      c4f7: 43289,
      h1f1: 46101,
      h1g1: 44668,
      d1d2: 48843,
      d1d3: 57153,
      d1d4: 57744,
      d1d5: 56899,
      d1d6: 43766,
      e1f1: 49775,
      e1d2: 33423,
      e1f2: 36783,
      e1g1: 47054,
    };

    this.timesToCalculateMoves = [[], [], [], [], [], []];
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

    this.halfmoveCount = parseInt(fields.shift());
    this.fullmoveCount = parseInt(fields.shift());

    if (enPassantPiece != '-') {
      if (enPassantPiece[1] == '3') {
        // add this position to list of white pawn attack moves
        let [row, col] = Game.fromAlgNot(enPassantPiece);
        row -= 1;
        console.log(this.halfmoveCount, this.board[row][col]);
        this.board[row][col].canEnpassant = this.halfmoveCount;
      } else if (enPassantPiece[1] == '6') {
        // add this position to list of black pawn attack moves
        let [row, col] = Game.fromAlgNot(enPassantPiece);
        row += 1;
        this.board[row][col].canEnpassant = this.halfmoveCount;
      }
    }
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

    fen = `${fen.slice(0, fen.length - 1)} ${this.playerToMove ? 'b' : 'w'} KQkq ${this.lastDoubleMove} ${this.halfmoveCount} ${this.fullmoveCount}`;
    console.log(fen);
  }

  update() {
    if (!this.running) return;
    if (mouseIsPressed && mouseButton === LEFT) {
      if (this.selected === null) {
        this.selected = this.board[Math.floor(mouseY / Game.SquareSize)][Math.floor(mouseX / Game.SquareSize)];
        if (this.selected === undefined || this.selected instanceof Array) this.selected = null;
        if (this.selected instanceof Piece && this.selected.color != this.playerToMove) this.selected = null;
      } else {
        // piece is selected
        this.selected.drawX = mouseX - Game.SquareSize / 2;
        this.selected.drawY = mouseY - Game.SquareSize / 2;
        this.selected.highlightMoves();
      }
    } else if (this.selected) {
      if (this.selected instanceof Piece) {
        const move = this.selected.canMove(Math.floor(mouseY / Game.SquareSize), Math.floor(mouseX / Game.SquareSize));
        if (move !== null) {
          this.move(move);
          this.calculateMoves();
        }
      }

      this.selected.update();
      this.selected = null;
    }
  }

  drawPieces() {
    if (!this.running) return;
    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board[0].length; j++) {
        const piece = this.board[i][j];
        if (piece instanceof Piece) piece.draw();
      }
    }
  }

  calculateMoves() {
    let startTimeOverall = millis();

    // reset board attacks and moves
    this.moves = [];
    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board[0].length; j++) {
        let piece = this.board[i][j];
        if (piece instanceof Piece) {
          piece.moves = [];
          piece.attacks = [];
          piece.enpassant = null;
          piece.generatedMoves = [];
        } else {
          this.board[i][j] = [];
        }
      }
    }

    let startTime = millis();
    for (let i = 0; i < this.enemyPieces.length; i++) {
      this.enemyPieces[i].generateAttacks();
    }
    this.timesToCalculateMoves[0].push(millis() - startTime);

    // returns pinned pieces and their moves are already generated
    startTime = millis();
    this.currentKing.getPinnedPieces();
    this.timesToCalculateMoves[1].push(millis() - startTime);

    if (this.currentKing.inCheck()) {
      this.checks++;

      // add moves that MOVE king out of check
      this.currentKing.generateMoves();

      startTime = millis();
      // add moves that BLOCK the check (if checking piece is rook, bishop, or queen)
      // add moves that CAPTURE the piece that is delivering check
      const allowedMoves = this.currentKing.getAllowedMovesCheck();

      this.timesToCalculateMoves[2].push(millis() - startTime);

      // Was for cross check but wasnt legal
      /*
      let pawnMoves = JSON.parse(JSON.stringify(allowedMoves));
      const dir = this.color ? -1 : 1
      let positions = [[dir, 1], [dir, -1]];
      for (let i = 0; i < positions.length; i++) {
        const row = this.enemyKing.row + positions[i][0];
        const col = this.enemyKing.col + positions[i][1];

        if (pawnMoves[row] === undefined) continue;
        if (pawnMoves[row][col] === undefined) continue;

        pawnMoves[row][col] = true;
      }

      let rookMoves = JSON.parse(JSON.stringify(allowedMoves));
      let dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (let dir = 0; dir < dirs.length; dir++) {
        for (let i = 1; i < 8; i++) {
          const row = this.enemyKing.row + dirs[dir][0] * i;
          const col = this.enemyKing.col + dirs[dir][1] * i;

          if (this.board[row] === undefined) continue;

          const piece = this.board[row][col];
          if (piece === undefined) continue;

          const isPiece = piece instanceof Piece;

          if (isPiece && piece.color == this.currentKing.color) break;

          rookMoves[row][col] = true;

          if (isPiece && piece.color != this.currentKing.color) break;
        }
      }
      console.log(rookMoves);

      let knightMoves = JSON.parse(JSON.stringify(allowedMoves));
      positions = [[-1, 2], [-1, -2], [-2, 1], [-2, -1], [1, 2], [1, -2], [2, 1], [2, -1]];
      for (let i = 0; i < positions.length; i++) {
        const row = this.enemyKing.row + positions[i][0];
        const col = this.enemyKing.col + positions[i][1];

        if (knightMoves[row] === undefined) continue;
        if (knightMoves[row][col] === undefined) continue;

        knightMoves[row][col] = true;
      }

      let bishopMoves = JSON.parse(JSON.stringify(allowedMoves));
      dirs = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
      for (let dir = 0; dir < dirs.length; dir++) {
        for (let i = 1; i < 8; i++) {
          const row = this.enemyKing.row + dirs[dir][0] * i;
          const col = this.enemyKing.col + dirs[dir][1] * i;

          if (this.board[row] === undefined) continue;

          const piece = this.board[row][col];
          if (piece === undefined) continue;

          const isPiece = piece instanceof Piece;

          if (isPiece && piece.color == this.currentKing.color) break;

          bishopMoves[row][col] = true;

          if (isPiece && piece.color != this.currentKing.color) break;
        }
      }

      let queenMoves = JSON.parse(JSON.stringify(allowedMoves));
      dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];
      for (let dir = 0; dir < dirs.length; dir++) {
        for (let i = 1; i < 8; i++) {
          const row = this.enemyKing.row + dirs[dir][0] * i;
          const col = this.enemyKing.col + dirs[dir][1] * i;

          if (this.board[row] === undefined) continue;

          const piece = this.board[row][col];
          if (piece === undefined) continue;

          const isPiece = piece instanceof Piece;

          if (isPiece && piece.color == this.currentKing.color) break;

          queenMoves[row][col] = true;

          if (isPiece && piece.color != this.currentKing.color) break;
        }
      }
      */

      let possibleMoves = [];

      startTime = millis();
      for (let i = 0; i < this.currentPieces.length; i++) {
        const piece = this.currentPieces[i];

        // Was for cross check but wasnt legal
        /*
        if (piece instanceof Pawn) piece.generateMoves(pawnMoves);
        else if (piece instanceof Rook) piece.generateMoves(rookMoves);
        else if (piece instanceof Knight) piece.generateMoves(knightMoves);
        else if (piece instanceof Bishop) piece.generateMoves(bishopMoves);
        else if (piece instanceof Queen) piece.generateMoves(queenMoves);
        */

        piece.generateMoves(allowedMoves);

        possibleMoves = possibleMoves.concat(piece.moves);
        if (piece instanceof Pawn && piece.enpassant != null) possibleMoves.push(piece.enpassant);
      }

      this.moves = possibleMoves;
      this.timesToCalculateMoves[3].push(millis() - startTime);

      //if (possibleMoves.length == 0) this.stop("Checkmate, " + (this.enemyKing.color ? "black" : "white") + " is victorious!")
    } else {
      startTime = millis();
      let possibleMoves = [];

      for (let i = 0; i < this.currentPieces.length; i++) {
        const piece = this.currentPieces[i];
        piece.generateMoves();
        possibleMoves = possibleMoves.concat(piece.moves);
        if (piece instanceof Pawn && piece.enpassant != null) possibleMoves.push(piece.enpassant);
      }

      this.moves = possibleMoves;

      this.timesToCalculateMoves[4].push((millis() - startTime));
      //if (possibleMoves.length == 0) this.stop("Draw!");
    }

    this.timesToCalculateMoves[5].push((millis() - startTimeOverall));
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
  }

  move(move) {
    if (move instanceof Move) {
      move.move();
      this.switchPlayer();

      this.halfmoveCount++;
      if (this.playerToMove == 0) this.fullmoveCount++;
      if (move.targetPiece instanceof Piece && move.startPiece.color != move.targetPiece.color) this.captures++;

      move.startPiece.update();

      this.history.push(move);
    } else if (typeof move == "string") {
      const typelookup = {
        'q': 'Queen',
        'b': 'Bishop',
        'r': 'Rook',
        'n': 'Knight'
      }

      const [startRow, startCol] = Game.fromAlgNot(move[0] + move[1]);
      const [targetRow, targetCol] = Game.fromAlgNot(move[2] + move[3]);
      let type = null;
      if (move.length == 5) type = typelookup[move[4]];

      const translatedMove = this.board[startRow][startCol].canMove(targetRow, targetCol, type);
      if (move !== null) {
        this.move(translatedMove);
      }
    }
  }

  unmove() {
    if (this.history.length == 0) return;
    const move = this.history.pop();

    this.halfmoveCount--;
    if (this.playerToMove == 0) this.fullmoveCount--;

    move.unmove();
    this.switchPlayer();
  }

  switchPlayer() {
    this.playerToMove = !this.playerToMove;
    this.currentPieces = this.playerToMove ? this.blackPieces : this.whitePieces;
    this.enemyPieces = !this.playerToMove ? this.blackPieces : this.whitePieces;
    this.currentKing = this.playerToMove ? this.blackKing : this.whiteKing;
    this.enemyKing = !this.playerToMove ? this.blackKing : this.whiteKing;
  }

  remove(piece) {
    if (piece instanceof Array) return;
    if (piece.color == 0) {
      this.whitePieces.splice(this.whitePieces.indexOf(piece), 1);
    } else {
      this.blackPieces.splice(this.blackPieces.indexOf(piece), 1);
    }
  }

  add(piece) {
    if (piece instanceof Piece) {
      if (piece.color == 0) {
        Game.instance.whitePieces.push(piece);
      } else {
        Game.instance.blackPieces.push(piece);
      }
    }
  }

  stop(endScreenString) {
    this.update();
    this.drawPieces();
    this.running = false;

    tint(100, 100, 100);
    image(get(), 0, 0);

    noTint();
    textSize(width / endScreenString.length * 2);
    textAlign(CENTER);
    strokeWeight(2);
    fill(255);
    text(endScreenString, width / 2, (height / 2) + (textAscent() / 6));
  }

  perft(depth) {
    if (depth == 0) {
      return 1;
    }

    this.calculateMoves();
    const moves = [...this.moves];

    let numOfPositions = 0;

    for (let i = 0; i < moves.length; i++) {
      this.move(moves[i]);
      numOfPositions += this.perft(depth - 1);
      this.unmove();
    }

    return numOfPositions;
  }

  perftBulk(depth) {
    if (depth == 0) return 1;

    this.calculateMoves();
    const moves = [...this.moves];

    if (depth == 1) return moves.length;

    let numOfPositions = 0;

    for (let i = 0; i < moves.length; i++) {
      this.move(moves[i]);
      numOfPositions += this.perftBulk(depth - 1);
      this.unmove();
    }

    return numOfPositions;
  }

  perftDivide(depth) {
    console.time("Amount of time to preform Preft Divide");

    let numOfPositions = 0;

    this.calculateMoves();

    const moves = [...this.moves];

    const results = {};

    for (let i = 0; i < moves.length; i++) {
      this.move(moves[i]);
      const algNot = Game.toAlgNot(moves[i]);
      const perftResult = this.perftBulk(depth - 1);
      console.log(algNot, perftResult);
      results[algNot] = perftResult;
      if (Game.debug) {
        if (this.expectedResults[algNot] != perftResult) {
          console.log(moves[i]);
          break;
        }
      }
      numOfPositions += perftResult;
      this.unmove();
    }

    // En passant isn't being removed after first move after

    console.log(results);

    console.log("=================================");
    console.log("Total amount of moves: ", numOfPositions);
    console.timeEnd("Amount of time to preform Preft Divide");

    if (Game.debug) {
      console.log("======== Fails ========");

      console.log("Move  Got    | Expected");
      for (let [algnot, result] of Object.entries(this.expectedResults)) {
        if (results[algnot] != result) console.log(`${algnot}  ${results[algnot]} | ${result}`);
      }
    }
  }

  static toAlgNot(...parameters) {
    const lookup = {
      1: 'a',
      2: 'b',
      3: 'c',
      4: 'd',
      5: 'e',
      6: 'f',
      7: 'g',
      8: 'h',
    };

    if (parameters.length == 2) {
      const row = parameters[0];
      const col = parameters[1];
      return `${lookup[(col + 1)]}${(8 - row)}`;
    } else if (parameters.length == 1) {
      const typelookup = {
        'Queen': 'q',
        'Bishop': 'b',
        'Rook': 'r',
        'Knight': 'n'
      }
      const move = parameters[0];
      if (move instanceof PromotionMove) {
        return this.toAlgNot(move.startRow, move.startCol) + this.toAlgNot(move.targetRow, move.targetCol) + typelookup[move.type.name];
      } else if (move instanceof Move) {
        return this.toAlgNot(move.startRow, move.startCol) + this.toAlgNot(move.targetRow, move.targetCol);
      }
    }
  }

  static fromAlgNot(str) {
    const lookup = {
      'a': 1,
      'b': 2,
      'c': 3,
      'd': 4,
      'e': 5,
      'f': 6,
      'g': 7,
      'h': 8,
    }

    return [8 - str[1], lookup[str[0]] - 1];
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
    if (this.instance.running) image(this.#background, 0, 0);
  }

  static set background(bg) {
    if (!this.#background) this.#background = bg;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}