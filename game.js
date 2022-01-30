class Game {
  static SquareSize = Math.min(window.innerWidth, window.innerHeight) / 8;
  static debug = false;
  static #background;
  static instance;

  constructor(fenString) {
    if (Game.instance) throw Error("You can only have one game!");

    this.selected = null;
    this.running = true;
    this.history = [];

    this.captures = 0;
    this.checks = 0;
    this.lastDoubleMove = null;

    this.loadPosFromFen(fenString);
  }

  loadPosFromFen(fen) {
    console.log(`FEN = ${fen}`);

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

    this.lastDoubleMove = fields.shift();
    this.lastDoubleMove = this.lastDoubleMove == '-' ? null : Game.fromAlgNot(this.lastDoubleMove);

    this.halfmoveCount = parseInt(fields.shift());
    this.fullmoveCount = parseInt(fields.shift());

    if (isNaN(this.halfmoveCount)) this.halfmoveCount = 0;
    if (isNaN(this.fullmoveCount)) this.fullmoveCount = 1;
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

    fen = `${fen.slice(0, fen.length - 1)} ${this.playerToMove ? 'b' : 'w'} KQkq ${this.lastDoubleMove === null ? '-' : Game.toAlgNot(this.lastDoubleMove[0], this.lastDoubleMove[1])} ${this.halfmoveCount} ${this.fullmoveCount}`;
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
    for (let i = 0; i < this.whitePieces.length; i++) {
      this.whitePieces[i].draw();
    }
    for (let i = 0; i < this.blackPieces.length; i++) {
      this.blackPieces[i].draw();
    }
  }

  calculateMoves() {
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
          piece.movesGenerated = false;
          piece.pinned = false;
        } else {
          this.board[i][j] = [];
        }
      }
    }

    for (let i = 0; i < this.enemyPieces.length; i++) {
      this.enemyPieces[i].generateAttacks();
    }

    // returns pinned pieces and their moves are already generated
    const pinnedPieces = this.currentKing.getPinnedPieces();

    if (this.currentKing.inCheck()) {
      this.checks++;

      // add moves that MOVE king out of check
      this.currentKing.generateMoves();

      // add moves that BLOCK the check (if checking piece is rook, bishop, or queen)
      // add moves that CAPTURE the piece that is delivering check

      const allowedMoves = this.currentKing.getAllowedMovesCheck();

      let possibleMoves = [];

      for (let i = 0; i < this.currentPieces.length; i++) {
        possibleMoves = possibleMoves.concat(this.currentPieces[i].generateMoves(allowedMoves));
      }

      // generate enpassant moves
      if (this.lastDoubleMove !== null) {
        const row = this.lastDoubleMove[0] + (this.lastDoubleMove[0] == 2 ? 1 : -1);
        const col = this.lastDoubleMove[1];

        const doubleMovePiece = this.board[row][col];

        let piece = this.board[row][col - 1];
        if (piece instanceof Pawn && piece.color != doubleMovePiece.color && !piece.pinned) {
          let allowed = true;
          if (piece.color == this.currentKing.color) {
            const dirFromPieceToKing = Game.getDirFromPos(piece.row, piece.col, this.currentKing.row, this.currentKing.col);
            let passedThroughDouble = false;
            let passedThroughPiece = false;
            // dir is horizontal
            if (dirFromPieceToKing[0] == 0) {
              const dir = dirFromPieceToKing[1] * -1;
              for (let i = 1; i < 8; i++) {
                const possiblePiece = this.board[this.currentKing.row][this.currentKing.col + i * dir];
                if (possiblePiece === undefined) break;

                if (possiblePiece instanceof Array) continue;
                if (possiblePiece == doubleMovePiece) {
                  passedThroughDouble = true;
                  continue;
                }
                if (possiblePiece == piece) {
                  passedThroughPiece = true;
                  continue;
                }

                if ((possiblePiece instanceof Rook || possiblePiece instanceof Queen) && possiblePiece.color != this.currentKing.color && passedThroughDouble && passedThroughPiece) {
                  allowed = false;
                  break;
                } else break;
              }
            }
          }
          if ((allowedMoves[doubleMovePiece.row + (doubleMovePiece.color ? 1 : -1)][doubleMovePiece.col] || allowedMoves[doubleMovePiece.row][doubleMovePiece.col]) && allowed) {
            piece.enpassant = new EnpassantMove(piece, this.lastDoubleMove[0], this.lastDoubleMove[1], doubleMovePiece.color ? -1 : 1);
            possibleMoves.push(piece.enpassant);
          }
        }

        piece = this.board[row][col + 1];
        if (piece instanceof Pawn && piece.color != doubleMovePiece.color && !piece.pinned) {
          let allowed = true;
          if (piece.color == this.currentKing.color) {
            const dirFromPieceToKing = Game.getDirFromPos(piece.row, piece.col, this.currentKing.row, this.currentKing.col);
            let passedThroughDouble = false;
            let passedThroughPiece = false;
            // dir is horizontal
            if (dirFromPieceToKing[0] == 0) {
              const dir = dirFromPieceToKing[1] * -1;
              for (let i = 1; i < 8; i++) {
                const possiblePiece = this.board[this.currentKing.row][this.currentKing.col + i * dir];
                if (possiblePiece === undefined) break;

                if (possiblePiece instanceof Array) continue;
                if (possiblePiece == doubleMovePiece) {
                  passedThroughDouble = true;
                  continue;
                }
                if (possiblePiece == piece) {
                  passedThroughPiece = true;
                  continue;
                }

                if ((possiblePiece instanceof Rook || possiblePiece instanceof Queen) && possiblePiece.color != this.currentKing.color && passedThroughDouble && passedThroughPiece) {
                  allowed = false;
                  break;
                } else break;
              }
            }
          }
          if ((allowedMoves[doubleMovePiece.row + (doubleMovePiece.color ? 1 : -1)][doubleMovePiece.col] || allowedMoves[doubleMovePiece.row][doubleMovePiece.col]) && allowed) {
            piece.enpassant = new EnpassantMove(piece, this.lastDoubleMove[0], this.lastDoubleMove[1], doubleMovePiece.color ? -1 : 1);
            possibleMoves.push(piece.enpassant);
          }
        }
      }

      this.moves = possibleMoves;

      if (possibleMoves.length == 0) this.stop("Checkmate, " + (this.enemyKing.color ? "black" : "white") + " is victorious!")
    } else {

      let possibleMoves = [];

      for (let i = 0; i < this.currentPieces.length; i++) {
        possibleMoves = possibleMoves.concat(this.currentPieces[i].generateMoves());
      }

      // generate enpassant moves
      if (this.lastDoubleMove !== null) {
        const row = this.lastDoubleMove[0] + (this.lastDoubleMove[0] == 2 ? 1 : -1);
        const col = this.lastDoubleMove[1];

        const doubleMovePiece = this.board[row][col];

        let piece = this.board[row][col - 1];
        // can perform enpassant
        if (piece instanceof Pawn && piece.color != doubleMovePiece.color && !piece.pinned) {
          let allowed = true;
          if (piece.color == this.currentKing.color) {
            const dirFromPieceToKing = Game.getDirFromPos(piece.row, piece.col, this.currentKing.row, this.currentKing.col);
            let passedThroughDouble = false;
            let passedThroughPiece = false;
            // dir is horizontal
            if (dirFromPieceToKing[0] == 0) {
              const dir = dirFromPieceToKing[1] * -1;
              for (let i = 1; i < 8; i++) {
                const possiblePiece = this.board[this.currentKing.row][this.currentKing.col + i * dir];
                if (possiblePiece === undefined) break;

                if (possiblePiece instanceof Array) continue;
                if (possiblePiece == doubleMovePiece) {
                  passedThroughDouble = true;
                  continue;
                }
                if (possiblePiece == piece) {
                  passedThroughPiece = true;
                  continue;
                }

                if ((possiblePiece instanceof Rook || possiblePiece instanceof Queen) && possiblePiece.color != this.currentKing.color && passedThroughDouble && passedThroughPiece) {
                  allowed = false;
                  break;
                } else break;
              }
            }
          }
          if (allowed) {
            piece.enpassant = new EnpassantMove(piece, this.lastDoubleMove[0], this.lastDoubleMove[1], doubleMovePiece.color ? -1 : 1);
            possibleMoves.push(piece.enpassant);
          }
        }

        piece = this.board[row][col + 1];
        if (piece instanceof Pawn && piece.color != doubleMovePiece.color && !piece.pinned) {
          let allowed = true;
          if (piece.color == this.currentKing.color) {
            const dirFromPieceToKing = Game.getDirFromPos(piece.row, piece.col, this.currentKing.row, this.currentKing.col);
            let passedThroughDouble = false;
            let passedThroughPiece = false;
            // dir is horizontal
            if (dirFromPieceToKing[0] == 0) {
              const dir = dirFromPieceToKing[1] * -1;
              for (let i = 1; i < 8; i++) {
                const possiblePiece = this.board[this.currentKing.row][this.currentKing.col + i * dir];
                if (possiblePiece === undefined) break;

                if (possiblePiece instanceof Array) continue;
                if (possiblePiece == doubleMovePiece) {
                  passedThroughDouble = true;
                  continue;
                }
                if (possiblePiece == piece) {
                  passedThroughPiece = true;
                  continue;
                }

                if ((possiblePiece instanceof Rook || possiblePiece instanceof Queen) && possiblePiece.color != this.currentKing.color && passedThroughDouble && passedThroughPiece) {
                  allowed = false;
                  break;
                } else break;
              }
            }
          }
          if (allowed) {
            piece.enpassant = new EnpassantMove(piece, this.lastDoubleMove[0], this.lastDoubleMove[1], doubleMovePiece.color ? -1 : 1);
            possibleMoves.push(piece.enpassant);
          }
        }
      }

      this.moves = possibleMoves;

      if (possibleMoves.length == 0) this.stop("Draw!");
    }
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
        'q': Queen,
        'b': Bishop,
        'r': Rook,
        'n': Knight
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

  multipleMoves(...moves) {
    this.calculateMoves();

    for (let i = 0; i < moves.length; i++) {
      this.move(moves[i]);
      this.calculateMoves();
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
    if (Game.debug) return;

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

  perftDivide(depth, debugMode) {
    console.time(`Amount of time to preform Preft Divide (depth = ${depth})`);

    console.log(`Perft Divide (depth = ${depth})`);
    console.log("========== Moves ==========");

    let numOfPositions = 0;

    this.calculateMoves();
    let done = false;

    const moves = [...this.moves];

    const results = {};

    for (let i = 0; i < moves.length; i++) {
      this.move(moves[i]);
      const algNot = Game.moveToAlgNot(moves[i]);
      const perftResult = this.perftBulk(depth - 1);
      console.log(algNot, perftResult);
      results[algNot] = perftResult;
      if (debugMode) {
        if (this.expectedResults[algNot] !== perftResult) {
          console.log(`Expected: %c${this.expectedResults[algNot]}`, "color: white; background: black;");
          done = true;
          break;
        }
      }
      numOfPositions += perftResult;
      this.unmove();
    }

    console.log(results);

    console.log("=================================");
    console.log("Total amount of moves: ", numOfPositions);
    console.timeEnd(`Amount of time to preform Preft Divide (depth = ${depth})`);

    if (debugMode && !done) {
      for (let [algNot, result] of Object.entries(this.expectedResults)) {
        if (results[algNot] !== this.expectedResults[algNot]) {
          console.log(`Expected: ${algNot} %c${this.expectedResults[algNot]}`, "color: white; background: black;");
        }
      }
    }

    this.calculateMoves();
    return numOfPositions;
  }

  loadPerftDivideExpectedResults(str) {
    this.expectedResults = {};
    str.split('\n').forEach((_) => this.expectedResults[_.split(':')[0]] = parseInt(_.split(':')[1].trim()));
  }

  static getDirFromPos(fromRow, fromCol, toRow, toCol) {
    let rowOff = toRow - fromRow;
    rowOff /= Math.abs(rowOff) == 0 ? 1 : Math.abs(rowOff);
    let colOff = toCol - fromCol;
    colOff /= Math.abs(colOff) == 0 ? 1 : Math.abs(colOff);

    return [rowOff, colOff];
  }

  static toAlgNot(row, col) {
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

    return `${lookup[(col + 1)]}${(8 - row)}`;
  }

  static arrToAlgNot(arr) {
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

    return `${lookup[(arr[1] + 1)]}${(8 - arr[0])}`;
  }

  static moveToAlgNot(move) {
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

    const typelookup = {
      'Queen': 'q',
      'Bishop': 'b',
      'Rook': 'r',
      'Knight': 'n'
    }

    if (move instanceof PromotionMove) {
      return this.toAlgNot(move.startRow, move.startCol) + this.toAlgNot(move.targetRow, move.targetCol) + typelookup[move.type.name];
    } else if (move instanceof Move) {
      return this.toAlgNot(move.startRow, move.startCol) + this.toAlgNot(move.targetRow, move.targetCol);
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
        if (Game.instance instanceof Game && Game.instance.board[i][j] instanceof Piece) Game.instance.board[i][j].update();
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