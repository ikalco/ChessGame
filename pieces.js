class Piece {
  constructor(row, col, color) {
    this.color = color;
    this.row = row;
    this.col = col;

    this.drawX = this.col * Game.SquareSize;
    this.drawY = this.row * Game.SquareSize;
    this.moveCount = false;
    this.blackAttacks = [];
    this.whiteAttacks = [];
    this.moves = [];
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

  canMove(targetCol, targetRow) {
    for (let i = 0; i < this.moves.length; i++) {
      if (this.moves[i].targetCol == targetCol && this.moves[i].targetRow == targetRow) return true;
    }
    return false;
  }
}

class Pawn extends Piece {
  static imageW;
  static imageB;

  constructor(row, col, color) {
    super(row, col, color);
  }

  draw() {
    image(this.color ? Pawn.imageB : Pawn.imageW, this.drawX, this.drawY, Game.SquareSize, Game.SquareSize);
  }

  getPossibleMoves() {
    let moves = []

    const dir = this.color == 0 ? -1 : 1;
    if (Game.instance.board[this.row + dir] === undefined) return moves;

    if (Game.instance.board[this.row + dir][this.col] instanceof Array) {
      // can move straight forward one square, if that square is vacant
      moves.push(new Move(this.col, this.row + dir));

      // can move straight forward two squares, if both squares are vacant AND piece hasn't moved yet
      if (this.moveCount == 0 && Game.instance.board[this.row + dir * 2][this.col] instanceof Array)
        moves.push(new Move(this.col, this.row + dir * 2));
    }

    // can capture forward-left-diagonally if it contains an enemy piece
    let piece = Game.instance.board[this.row + dir][this.col + 1];
    if (piece instanceof Piece) {
      if (piece.color != this.color) {
        moves.push(new Move(this.col + 1, this.row + dir));
      }
      piece.attacked.push([this.row, this.col]);
    } else if (piece instanceof Array) {
      piece.push([this.row, this.col]);
    }

    // can capture forward-right-diagonally if it contains an enemy piece
    piece = Game.instance.board[this.row + dir][this.col - 1];
    if (piece instanceof Piece) {
      if (piece.color != this.color) {
        moves.push(new Move(this.col - 1, this.row + dir));
      }
      piece.attacked.push([this.row, this.col]);
    } else if (piece instanceof Array) {
      piece.push([this.row, this.col]);
    }

    // TODO add en passant capturing

    return moves;
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

  getPossibleMoves() {
    let moves = [];

    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    for (let dir = 0; dir < dirs.length; dir++) {
      for (let i = 1; i < 8; i++) {
        const targetRow = this.row + dirs[dir][0] * i;
        const targetCol = this.col + dirs[dir][1] * i;

        if (Game.instance.board[targetRow]) {
          const piece = Game.instance.board[targetRow][targetCol];
          if (piece === undefined) break; // off the edge then break
          const isPiece = piece instanceof Piece;
          if (isPiece && piece.color == this.color) break;
          moves.push(new Move(targetCol, targetRow));
          if (isPiece) {
            if (piece.color != this.color) {
              piece.attacked.push([this.row, this.col]);
              break;
            }
          } else piece.push([this.row, this.col]);
        } else {
          break;
        }
      }
    }

    return moves;
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

  getPossibleMoves() {
    let moves = [];

    const dirs = [[-1, 2], [-1, -2], [-2, 1], [-2, -1], [1, 2], [1, -2], [2, 1], [2, -1]];

    for (let dir = 0; dir < dirs.length; dir++) {
      const targetRow = this.row + dirs[dir][0];
      const targetCol = this.col + dirs[dir][1];

      if (Game.instance.board[targetRow]) {
        const piece = Game.instance.board[targetRow][targetCol];
        if (piece === undefined) continue; // off the edge then break
        const isPiece = piece instanceof Piece;
        if (isPiece && piece.color == this.color) continue; // if friendly piece then skip it
        moves.push(new Move(targetCol, targetRow));
        if (isPiece) {
          if (piece.color != this.color) piece.attacked.push([this.row, this.col]);
        } else piece.push([this.row, this.col]);
      }
    }

    return moves;
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

  getPossibleMoves() {
    let moves = [];

    const dirs = [[-1, -1], [1, 1], [-1, 1], [1, -1]];

    for (let dir = 0; dir < dirs.length; dir++) {
      // while not hitting the corresponding edge do stuff
      for (let i = 1; i < 8; i++) {
        const targetRow = this.row + dirs[dir][0] * i;
        const targetCol = this.col + dirs[dir][1] * i;

        if (Game.instance.board[targetRow]) {
          const piece = Game.instance.board[targetRow][targetCol];
          if (piece === undefined) break; // off the edge then break
          const isPiece = piece instanceof Piece;
          if (isPiece && piece.color == this.color) break;
          moves.push(new Move(targetCol, targetRow));
          if (isPiece) {
            if (piece.color != this.color) {
              piece.attacked.push([this.row, this.col]);
              break;
            };
          } else piece.push([this.row, this.col]);
        } else {
          break;
        }
      }
    }

    return moves;
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

  getPossibleMoves() {
    let moves = [];

    let dirs = [[-1, -1], [1, 1], [-1, 1], [1, -1], [0, -1], [0, 1], [-1, 0], [1, 0]];

    for (let dir = 0; dir < dirs.length; dir++) {
      const targetRow = this.row + dirs[dir][0];
      const targetCol = this.col + dirs[dir][1];

      if (Game.instance.board[targetRow]) {
        const piece = Game.instance.board[targetRow][targetCol];
        if (piece === undefined) continue; // off the edge then break
        const isPiece = piece instanceof Piece;
        // if piece is being attacked or is a friendly then skip
        if (isPiece) {
          if (piece.attacked.length != 0 || piece.color == this.color) continue;
        } else if (piece.length != 0) continue;
        moves.push(new Move(targetCol, targetRow));
        if (isPiece) {
          if (piece.color != this.color) {
            piece.attacked.push([this.row, this.col]);
          };
        } else piece.push([this.row, this.col]);
      }
    }

    // castling
    // king hasnt moved and isnt in check
    if (this.moveCount == 0 && this.attacked.length != 0) {
      dirs = [-4, 3];
      for (let dir = 0; dir < dirs.length; dir++) {
        const targetRow = this.row + dirs[dir][0];
        const targetCol = this.col + dirs[dir][1];

        if (!Game.instance.board[targetRow]) break; // if row doesn't exist then skip

        const piece = Game.instance.board[targetRow][targetCol];
        // piece is a friendly rook and hasnt moved
        if (!(piece instanceof Rook && piece.color == this.color && piece.moveCount == 0)) continue;

        // no pieces between this and rook and they aren't being attacked
        const castleDir = dirs[dir] == Math.abs(dirs[dir]) ? 1 : -1;
        let canCastle = true;
        for (let i = 1; i < 2; i++) {
          const castlePiece = Game.instance.board[this.row][this.col + castleDir * i];
          // piece is empty and not attacked
          if (castlePiece instanceof Array && castlePiece.length == 0) canCastle &= true;
          else canCastle &= false;
        }

        if (dirs[dir] == -4) canCastle &= (Game.instance.board[this.row][this.col - 3] instanceof Array);

        if (canCastle) {
          // TODO make castling a move you can make
          this.moves.push(new DoubleMove(this.col + castleDir * 2, this.row, targetCol, targetRow, this.col + castleDir, this.row))
        }
      }
    }

    return moves;
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

  getPossibleMoves() {
    let moves = [];

    const dirs = [[-1, -1], [1, 1], [-1, 1], [1, -1], [0, -1], [0, 1], [-1, 0], [1, 0]];

    for (let dir = 0; dir < dirs.length; dir++) {
      // while not hitting the corresponding edge do stuff
      for (let i = 1; i < 8; i++) {
        const targetRow = this.row + dirs[dir][0] * i;
        const targetCol = this.col + dirs[dir][1] * i;

        if (Game.instance.board[targetRow]) {
          const piece = Game.instance.board[targetRow][targetCol];
          if (piece === undefined) break; // off the edge then break
          const isPiece = piece instanceof Piece;
          if (isPiece && piece.color == this.color) break;
          moves.push(new Move(targetCol, targetRow));
          if (isPiece) {
            if (piece.color != this.color) {
              piece.attacked.push([this.row, this.col]);
              break;
            };
          } else piece.push([this.row, this.col]);
        } else {
          break;
        }
      }
    }

    return moves;
  }
}

function preload() {
  const chessPiecesImg = loadImage('./assets/pieces.png', () => {
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