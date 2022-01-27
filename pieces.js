class Piece {
  constructor(row, col, color) {
    this.color = color;
    this.row = row;
    this.col = col;

    this.drawX = this.col * Game.SquareSize;
    this.drawY = this.row * Game.SquareSize;

    // For move generation
    this.moves = [];
    this.attacks = [];
    this.moveCount = 0;
    this.generatedMoves = [];
  }

  highlightMoves() {
    push();
    noStroke();
    fill(205, 78, 0, 160);
    rect(this.col * Game.SquareSize, this.row * Game.SquareSize, Game.SquareSize);
    for (let i = 0; i < this.moves.length; i++) {
      this.moves[i].highlight();
    }
    pop();
  }

  canMove(targetRow, targetCol) {
    for (let i = 0; i < this.moves.length; i++) {
      if (this.moves[i].targetCol == targetCol && this.moves[i].targetRow == targetRow) return this.moves[i];
    }
    return null;
  }
}

class Pawn extends Piece {
  static imageW;
  static imageB;

  constructor(row, col, color) {
    super(row, col, color);
    this.enpassant = null;
    this.canEnpassant = null;
  }

  draw() {
    image(this.color ? Pawn.imageB : Pawn.imageW, this.drawX, this.drawY, Game.SquareSize, Game.SquareSize);
  }

  generateMoves(allowedMoves = null) {
    if (this.moves.length != 0 || this.generatedMoves.length != 0) return;

    const dir = this.color ? 1 : -1;

    if (!Game.instance.board[this.row + dir]) return;

    if (Game.instance.board[this.row + dir][this.col] instanceof Array) {
      // move 1 forward if empty
      if (allowedMoves == null || allowedMoves[this.row + dir][this.col]) this.moves.push(new Move(this, this.row + dir, this.col));
      // move 2 forwards if both empty
      if (this.moveCount == 0 && Game.instance.board[this.row + dir * 2] && Game.instance.board[this.row + dir * 2][this.col] instanceof Array) {
        this.canEnpassant = Game.instance.halfmoveCount + 1;
        if (allowedMoves == null || allowedMoves[this.row + dir * 2][this.col]) this.moves.push(new Move(this, this.row + dir * 2, this.col));
      }
    }

    // diagonals in front of pawn is an enemy piece then you can move there
    if (Game.instance.board[this.row + dir][this.col + 1] instanceof Piece && Game.instance.board[this.row + dir][this.col + 1].color != this.color)
      if (allowedMoves == null || allowedMoves[this.row + dir][this.col + 1]) this.moves.push(new Move(this, this.row + dir, this.col + 1));

    if (Game.instance.board[this.row + dir][this.col - 1] instanceof Piece && Game.instance.board[this.row + dir][this.col - 1].color != this.color)
      if (allowedMoves == null || allowedMoves[this.row + dir][this.col - 1]) this.moves.push(new Move(this, this.row + dir, this.col - 1));

    // en passant

    let enemyPiece = Game.instance.board[this.row][this.col + 1];
    // enemy pawn just moved 2 squares forward (first move of enemy)
    if (enemyPiece instanceof Piece && enemyPiece.color != this.color && enemyPiece.row == (this.color ? 4 : 3) && enemyPiece.moveCount == 1) {
      // only allowed on first move after enemy pawn has moved forward two squares
      if (enemyPiece.canEnpassant == Game.instance.halfmoveCount) {
        // pawn takes enemy pawn and moves to one square behind enemy pawn
        const move = new EnpassantMove(this, enemyPiece.row + dir, enemyPiece.col);
        if (allowedMoves == null || allowedMoves[this.row + dir][this.col]) this.enpassant = move;
      }
    }

    enemyPiece = Game.instance.board[this.row][this.col - 1];
    // enemy pawn just moved 2 squares forward (first move of enemy)
    if (enemyPiece instanceof Piece && enemyPiece.color != this.color && enemyPiece.row == (this.color ? 4 : 3) && enemyPiece.moveCount == 1) {
      // only allowed on first move after enemy pawn has moved forward two squares
      console.log(enemyPiece.canEnpassant, Game.instance.halfmoveCount);
      if (enemyPiece.canEnpassant == Game.instance.halfmoveCount) {
        // pawn takes enemy pawn and moves to one square behind enemy pawn
        const move = new EnpassantMove(this, enemyPiece.row + dir, enemyPiece.col, dir);
        if (allowedMoves == null || allowedMoves[this.row + dir][this.col]) this.enpassant = move;
      }
    }

    this.generatedMoves = this.moves;
  }

  generateAttacks() {
    const dir = this.color ? 1 : -1;

    if (Game.instance.board[this.row + dir]) {
      let piece = Game.instance.board[this.row + dir][this.col + 1];
      if (piece !== undefined) {
        if (piece instanceof Piece) piece.attacks.push([this.row, this.col]);
        else piece.push([this.row, this.col]);
      }

      piece = Game.instance.board[this.row + dir][this.col - 1];
      if (piece !== undefined) {
        if (piece instanceof Piece) piece.attacks.push([this.row, this.col]);
        else piece.push([this.row, this.col]);
      }
    }
  }

  highlightMoves() {
    push();
    noStroke();
    fill(205, 78, 0, 160);
    rect(this.col * Game.SquareSize, this.row * Game.SquareSize, Game.SquareSize);
    for (let i = 0; i < this.moves.length; i++) {
      if (this.enpassant) this.enpassant.highlight();
      this.moves[i].highlight();
    }
    pop();
  }

  canMove(targetRow, targetCol) {
    if (this.enpassant !== null && this.enpassant.targetRow == targetRow && this.enpassant.targetCol == targetCol) return this.enpassant;
    for (let i = 0; i < this.moves.length; i++) {
      if (this.moves[i].targetCol == targetCol && this.moves[i].targetRow == targetRow) return this.moves[i];
    }
    return null;
  }
}

class Rook extends Piece {
  static imageW;
  static imageB;

  constructor(row, col, color) {
    super(row, col, color);
  }

  draw() {
    image(this.color ? Rook.imageB : Rook.imageW, this.drawX, this.drawY, Game.SquareSize, Game.SquareSize);
  }

  generateMoves(allowedMoves = null) {
    if (this.moves.length != 0 || this.generatedMoves.length != 0) return;

    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    for (let dir = 0; dir < dirs.length; dir++) {
      for (let i = 1; i < 8; i++) {
        const targetRow = this.row + dirs[dir][0] * i;
        const targetCol = this.col + dirs[dir][1] * i;

        if (Game.instance.board[targetRow] === undefined) continue;

        const piece = Game.instance.board[targetRow][targetCol];
        if (piece === undefined) continue;

        const isPiece = piece instanceof Piece;

        // if encounter piece of same color then change direction
        if (isPiece && piece.color == this.color) break;

        if (allowedMoves == null || allowedMoves[targetRow][targetCol]) this.moves.push(new Move(this, targetRow, targetCol));

        // if encounter piece of different color then add move(to take the piece) and change direction
        if (isPiece && piece.color != this.color) break;
      }
    }

    this.generatedMoves = this.moves;
  }

  generateAttacks() {
    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    for (let dir = 0; dir < dirs.length; dir++) {
      for (let i = 1; i < 8; i++) {
        const targetRow = this.row + dirs[dir][0] * i;
        const targetCol = this.col + dirs[dir][1] * i;

        if (Game.instance.board[targetRow] === undefined) continue;

        const piece = Game.instance.board[targetRow][targetCol];
        if (piece === undefined) continue;

        const isPiece = piece instanceof Piece;

        // adding attack
        if (isPiece) piece.attacks.push([this.row, this.col]);
        else piece.push([this.row, this.col]);

        // if encounter piece of different color then add move(to take the piece) and change direction
        if (isPiece) {
          if (piece instanceof King && piece.color != this.color) continue;
          else break;
        }
      }
    }
  }
}

class Knight extends Piece {
  static imageW;
  static imageB;

  constructor(row, col, color) {
    super(row, col, color);
  }

  draw() {
    image(this.color ? Knight.imageB : Knight.imageW, this.drawX, this.drawY, Game.SquareSize, Game.SquareSize);
  }

  generateMoves(allowedMoves = null) {
    if (this.moves.length != 0 || this.generatedMoves.length != 0) return;

    const dirs = [[-1, 2], [-1, -2], [-2, 1], [-2, -1], [1, 2], [1, -2], [2, 1], [2, -1]];

    for (let dir = 0; dir < dirs.length; dir++) {
      const targetRow = this.row + dirs[dir][0];
      const targetCol = this.col + dirs[dir][1];

      if (Game.instance.board[targetRow] === undefined) continue;

      const piece = Game.instance.board[targetRow][targetCol];
      if (piece === undefined) continue;

      // if encounter piece of same color then change direction
      if (piece instanceof Piece && piece.color == this.color) continue;

      if (allowedMoves == null || allowedMoves[targetRow][targetCol]) this.moves.push(new Move(this, targetRow, targetCol));
    }

    this.generatedMoves = this.moves;
  }

  generateAttacks() {
    const dirs = [[-1, 2], [-1, -2], [-2, 1], [-2, -1], [1, 2], [1, -2], [2, 1], [2, -1]];

    for (let dir = 0; dir < dirs.length; dir++) {
      const targetRow = this.row + dirs[dir][0];
      const targetCol = this.col + dirs[dir][1];

      if (Game.instance.board[targetRow] === undefined) continue;

      const piece = Game.instance.board[targetRow][targetCol];
      if (piece === undefined) continue;

      // adding attack
      if (piece instanceof Piece) piece.attacks.push([this.row, this.col]);
      else piece.push([this.row, this.col]);
    }
  }
}

class Bishop extends Piece {
  static imageW;
  static imageB;

  constructor(row, col, color) {
    super(row, col, color);
  }

  draw() {
    image(this.color ? Bishop.imageB : Bishop.imageW, this.drawX, this.drawY, Game.SquareSize, Game.SquareSize);
  }

  generateMoves(allowedMoves = null) {
    if (this.moves.length != 0 || this.generatedMoves.length != 0) return;

    const dirs = [[-1, -1], [1, -1], [-1, 1], [1, 1]];

    for (let dir = 0; dir < dirs.length; dir++) {
      for (let i = 1; i < 8; i++) {
        const targetRow = this.row + dirs[dir][0] * i;
        const targetCol = this.col + dirs[dir][1] * i;

        if (Game.instance.board[targetRow] === undefined) continue;

        const piece = Game.instance.board[targetRow][targetCol];
        if (piece === undefined) continue;

        const isPiece = piece instanceof Piece;

        // if encounter piece of same color then change direction
        if (isPiece && piece.color == this.color) break;

        if (allowedMoves == null || allowedMoves[targetRow][targetCol]) this.moves.push(new Move(this, targetRow, targetCol));

        // if encounter piece of different color then add move(to take the piece) and change direction
        if (isPiece && piece.color != this.color) break;
      }
    }

    this.generatedMoves = this.moves;
  }

  generateAttacks() {
    const dirs = [[-1, -1], [1, -1], [-1, 1], [1, 1]];

    for (let dir = 0; dir < dirs.length; dir++) {
      for (let i = 1; i < 8; i++) {
        const targetRow = this.row + dirs[dir][0] * i;
        const targetCol = this.col + dirs[dir][1] * i;

        if (Game.instance.board[targetRow] === undefined) continue;

        const piece = Game.instance.board[targetRow][targetCol];
        if (piece === undefined) continue;

        const isPiece = piece instanceof Piece;

        // adding attack
        if (isPiece) piece.attacks.push([this.row, this.col]);
        else piece.push([this.row, this.col]);

        // if encounter piece of different color then add move(to take the piece) and change direction
        if (isPiece) {
          if (piece instanceof King && piece.color != this.color) continue;
          else break;
        }
      }
    }
  }
}

class King extends Piece {
  static imageW;
  static imageB;

  constructor(row, col, color) {
    super(row, col, color);
  }

  draw() {
    image(this.color ? King.imageB : King.imageW, this.drawX, this.drawY, Game.SquareSize, Game.SquareSize);
  }

  inCheck() {
    return this.attacks.length != 0;
  }

  generateMoves(allowedMoves = null) {
    if (this.moves.length != 0 || this.generatedMoves.length != 0) return;

    // all 8 directions
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];

    for (let dir = 0; dir < dirs.length; dir++) {
      const targetRow = this.row + dirs[dir][0];
      const targetCol = this.col + dirs[dir][1];

      if (Game.instance.board[targetRow] === undefined) continue;

      const piece = Game.instance.board[targetRow][targetCol];
      if (piece === undefined) continue;

      if (piece instanceof Piece) {
        // if piece is of same color then change direction
        if (piece.color == this.color) continue;
        // piece not attacked
        if (piece.attacks.length != 0) continue;
      } else {
        if (piece.length != 0) continue;
      }

      // adding move
      if (allowedMoves == null || allowedMoves[targetRow][targetCol]) this.moves.push(new Move(this, targetRow, targetCol));
    }

    if (!Game.instance.board[this.row]) return;

    const castleRook = Game.instance.board[this.row][this.col - 4];

    this.generatedMoves = this.moves;

    if (!(castleRook instanceof Rook && castleRook.color == this.color)) return;

    // king can NOT be in check
    if (this.inCheck()) return;
    // king and rook must NOT have moved
    if (this.moveCount != 0 || castleRook.moveCount != 0) return;
    // no pieces between king and rook
    for (let i = 1; i < 4; i++) {
      if (Game.instance.board[this.row][this.col - i] instanceof Piece) return;
    }
    // king can NOT pass through a square under attack
    if (Game.instance.board[this.row][this.col - 1].length != 0) return;
    // king can NOT end up in a square under attack
    if (Game.instance.board[this.row][this.col - 2].length != 0) return;

    this.moves.push(new CastleMove(this, this.row, this.col - 2, Game.instance.board[this.row][this.col - 4], this.row, this.col - 1));

    this.generatedMoves = this.moves;
  }

  generateAttacks() {
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];

    for (let dir = 0; dir < dirs.length; dir++) {
      const targetRow = this.row + dirs[dir][0];
      const targetCol = this.col + dirs[dir][1];

      if (Game.instance.board[targetRow] === undefined) continue;

      const piece = Game.instance.board[targetRow][targetCol];
      if (piece === undefined) continue;

      if (piece instanceof Piece) {
        if (piece.attacks.length != 0) continue;
      } else if (piece.length != 0) continue;

      // adding attack
      if (piece instanceof Piece) piece.attacks.push([this.row, this.col]);
      else piece.push([this.row, this.col]);
    }
  }

  getPinnedPieces() {
    if (this.color != Game.instance.playerToMove) throw Error("???? getPinnedPieces in King prototype");

    let pinnedPieces = [];

    // first four are vertical and horizontal
    // last four are diagonals
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];
    //const dirs = [[0, 1]];

    // find pinned pieces
    for (let dir = 0; dir < dirs.length; dir++) {
      let pinnedPiece = null;

      for (let i = 1; i < 8; i++) {
        const targetRow = this.row + dirs[dir][0] * i;
        const targetCol = this.col + dirs[dir][1] * i;

        if (Game.instance.board[targetRow] === undefined) continue;

        const piece = Game.instance.board[targetRow][targetCol];
        if (piece === undefined) continue;

        if (piece instanceof Array) continue;

        if (piece.color != this.color) {
          // if first encounter an enemy piece then no piece to be pinned
          if (pinnedPiece === null) break;

          // encountered potential pinner
          if ((piece instanceof Queen) || (piece instanceof Rook && dir <= 3) || (piece instanceof Bishop && dir > 3)) {
            // add move that captures pinner
            pinnedPieces.push(pinnedPiece);

            if (!this.inCheck()) {
              const possibleMoves = [];
              pinnedPiece.generateMoves();
              pinnedPiece.generatedMoves = pinnedPiece.moves;
              for (let k = 0; k < pinnedPiece.moves.length; k++) {
                // if pinnedPiece move captures pinner then add it
                if (pinnedPiece.moves[k].targetRow == piece.row && pinnedPiece.moves[k].targetCol == piece.col) {
                  possibleMoves.push(pinnedPiece.moves[k]);
                }
              }
              pinnedPiece.moves = possibleMoves;
            }
          }

          break;
        } else {
          if (pinnedPiece !== null) break;

          // if first encounter is friendly piece then it could be pinned
          pinnedPiece = piece;
        }
      }
    }

    // add 
    for (let dir = 0; dir < dirs.length; dir++) {
      let pinnedPiece = null;

      for (let i = 1; i < 8; i++) {
        const targetRow = Game.instance.enemyKing.row + dirs[dir][0] * i;
        const targetCol = Game.instance.enemyKing.col + dirs[dir][1] * i;

        if (Game.instance.board[targetRow] === undefined) continue;

        const piece = Game.instance.board[targetRow][targetCol];
        if (piece === undefined) continue;

        const isPiece = piece instanceof Piece;

        if (!isPiece) continue;

        if (!pinnedPiece) {
          if (pinnedPieces.includes(piece)) {
            // first encountered piece is a pinned piece
            pinnedPiece = piece;
          } else {
            break;
          }
        } else {
          if (piece.color == this.color) {
            // encountered potential discovery attacker
            // if in right direction for piece (if piece is a bishop then right direction is diagonals)
            // then add moves that move it out of the line of sight of piece
            // could potentially add duplicate moves because of Double Check

            if ((piece instanceof Queen) || (piece instanceof Rook && dir <= 3) || (piece instanceof Bishop && dir > 3)) {
              // added discovery checks
              const disallowedMoves = [];
              for (let l = 1; l < i; l++) {
                disallowedMoves.push([Game.instance.enemyKing.row + dirs[dir][0] * l, Game.instance.enemyKing.col + dirs[dir][1] * l])
              }
              const saveMoves = pinnedPiece.moves;
              pinnedPiece.moves = pinnedPiece.generatedMoves;
              for (let l = 0; l < pinnedPiece.moves.length; l++) {
                for (let k = 0; k < disallowedMoves.length; k++) {
                  if (!(pinnedPiece.moves[l].targetRow == disallowedMoves[k][0] && pinnedPiece.moves[l].targetCol == disallowedMoves[k][1])) {
                    saveMoves.push(pinnedPiece.moves[l]);
                  }
                }
              }
              //pinnedPiece.moves = saveMoves;
              // add moves that use pinnedPiece to give check
            }
          } else {
            break;
          }
        }
      }
    }

    return pinnedPieces;
  }

  getAllowedMovesCheck() {
    let allowedMoves = new Array(8).fill(false).map((_) => new Array(8).fill(false));

    // CAPTURE and BLOCK only possible if only one piece giving check
    if (this.attacks.length != 1) return allowedMoves;

    // add moves that CAPTURE the piece that is delivering check
    allowedMoves[this.attacks[0][0]][this.attacks[0][1]] = true;

    // add moves that BLOCK the check (if checking piece is rook, bishop, or queen)
    let rowOff = this.attacks[0][0] - this.row;
    rowOff /= Math.abs(rowOff);
    let colOff = this.attacks[0][1] - this.col;
    colOff /= Math.abs(colOff);

    const piece = Game.instance.board[this.attacks[0][0]][this.attacks[0][1]];

    if (piece instanceof Rook || piece instanceof Bishop || piece instanceof Queen) {
      for (let j = 1; j < 8; j++) {
        const targetRow = this.row + rowOff * j;
        const targetCol = this.col + colOff * j;

        if (targetRow == this.attacks[0][0] || targetCol == this.attacks[0][1]) break;

        if (Game.instance.board[targetRow] === undefined) continue;

        if (Game.instance.board[targetRow][targetCol] === undefined) continue;

        allowedMoves[targetRow][targetCol] = true;
      }
    }

    return allowedMoves;
  }
}

class Queen extends Piece {
  static imageW;
  static imageB;

  constructor(row, col, color) {
    super(row, col, color);
  }

  draw() {
    image(this.color ? Queen.imageB : Queen.imageW, this.drawX, this.drawY, Game.SquareSize, Game.SquareSize);
  }

  generateMoves(allowedMoves = null) {
    if (this.moves.length != 0 || this.generatedMoves.length != 0) return;

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];

    for (let dir = 0; dir < dirs.length; dir++) {
      for (let i = 1; i < 8; i++) {
        const targetRow = this.row + dirs[dir][0] * i;
        const targetCol = this.col + dirs[dir][1] * i;

        if (Game.instance.board[targetRow] === undefined) continue;

        const piece = Game.instance.board[targetRow][targetCol];
        if (piece === undefined) continue;

        const isPiece = piece instanceof Piece;

        // if encounter piece of same color then change direction
        if (isPiece && piece.color == this.color) break;

        if (allowedMoves == null || allowedMoves[targetRow][targetCol]) this.moves.push(new Move(this, targetRow, targetCol));

        // if encounter piece of different color then add move(to take the piece) and change direction
        if (isPiece && piece.color != this.color) break;
      }
    }

    this.generatedMoves = this.moves;
  }

  generateAttacks() {
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];

    for (let dir = 0; dir < dirs.length; dir++) {
      for (let i = 1; i < 8; i++) {
        const targetRow = this.row + dirs[dir][0] * i;
        const targetCol = this.col + dirs[dir][1] * i;

        if (Game.instance.board[targetRow] === undefined) continue;

        const piece = Game.instance.board[targetRow][targetCol];
        if (piece === undefined) continue;

        const isPiece = piece instanceof Piece;

        // adding attack
        if (isPiece) piece.attacks.push([this.row, this.col]);
        else piece.push([this.row, this.col]);

        // if encounter piece of different color then add move(to take the piece) and change direction
        if (isPiece) {
          if (piece instanceof King && piece.color != this.color) continue;
          else break;
        }
      }
    }
  }
}

let chessPiecesImg;

function preload() {
  chessPiecesImg = loadImage('./assets/pieces.png', () => {
    Pawn.imageW = chessPiecesImg.get(1665, 0.5, 333.33334, 333.5);
    Rook.imageW = chessPiecesImg.get(1332, 0.5, 333.33334, 333.5);
    Knight.imageW = chessPiecesImg.get(999, 0.5, 333.33334, 333.5);
    Bishop.imageW = chessPiecesImg.get(666, 0.5, 333.33334, 333.5);
    King.imageW = chessPiecesImg.get(0, 0.5, 333.33334, 333.5);
    Queen.imageW = chessPiecesImg.get(333, 0.5, 333.33334, 333.5);

    Pawn.imageB = chessPiecesImg.get(1665, 333.5, 333.33334, 333.5);
    Rook.imageB = chessPiecesImg.get(1332, 333.5, 333.33334, 333.5);
    Knight.imageB = chessPiecesImg.get(999, 333.5, 333.33334, 333.5);
    Bishop.imageB = chessPiecesImg.get(666, 333.5, 333.33334, 333.5);
    King.imageB = chessPiecesImg.get(0, 333.5, 333.33334, 333.5);
    Queen.imageB = chessPiecesImg.get(333, 333.5, 333.33334, 333.5);
  });
}