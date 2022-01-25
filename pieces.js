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

  generateMoves() {

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

  generateMoves() {
    if (this.moves.length != 0) return;

    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    for (let dir = 0; dir < dirs.length; dir++) {
      for (let i = 1; i < 7; i++) {
        const targetRow = this.row + dirs[dir][0] * i;
        const targetCol = this.col + dirs[dir][1] * i;

        if (Game.instance.board[targetRow] === undefined) continue;

        const piece = Game.instance.board[targetRow][targetCol];
        if (piece === undefined) continue;

        const isPiece = piece instanceof Piece;

        // if encounter piece of same color then change direction
        if (isPiece && piece.color == this.color) break;

        this.moves.push(new Move(targetRow, targetCol));

        // if encounter piece of different color then add move(to take the piece) and change direction
        if (isPiece && piece.color != this.color) break;
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

  generateMoves() {

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

  generateMoves() {

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

  generateMoves() {
    // all 8 directions
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];

    for (let dir = 0; dir < dirs.length; dir++) {
      const targetRow = this.row + dirs[dir][0];
      const targetCol = this.col + dirs[dir][1];

      if (Game.instance.board[targetRow] === undefined) continue;

      const piece = Game.instance.board[targetRow][targetCol];
      if (piece === undefined) continue;

      // piece not attacked
      if (piece instanceof Piece && piece.attacks.length != 0) continue;

      // adding move
      this.moves.push(new Move(targetRow, targetCol));
    }

    // add castling
  }

  getPinnedPieces() {
    if (this.color != Game.instance.playerToMove) throw Error("???? getPinnedPieces in King prototype");

    let pinnedPieces = [];

    // first four are vertical and horizontal
    // last four are diagonals
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];

    // send ray in all directions from this to find pinned pieces
    for (let dir = 0; dir < dirs.length; dir++) {
      let pinnedPiece = null;

      for (let i = 1; i < 7; i++) {
        const targetRow = this.row + dirs[dir][0] * i;
        const targetCol = this.col + dirs[dir][1] * i;

        if (Game.instance.board[targetRow] === undefined) continue;

        const piece = Game.instance.board[targetRow][targetCol];
        if (piece === undefined) continue;

        const isPiece = piece instanceof Piece;

        if (isPiece) {
          if (piece.color != this.color) {
            if (pinnedPiece) {
              // encountered potential pinner
              if (piece instanceof Queen) {
                // add move that captures pinner
                pinnedPieces.push(pinnedPiece);
                const possibleMoves = [];
                pinnedPiece.generateMoves();
                for (let k = 0; k < pinnedPiece.moves.length; i++) {
                  // if pinnedPiece move captures pinner then add it
                  if (pinnedPiece.moves[k].targetRow == piece.row && pinnedPiece.moves[k].targetCol == piece.col) {
                    possibleMoves.push(pinnedPiece.moves[k]);
                  }
                }
                pinnedPiece.moves = possibleMoves;
              }

              if (dir <= 3) {
                // vertical and horizontal
                if (piece instanceof Rook) {
                  // add move that captures pinner
                  pinnedPieces.push(pinnedPiece);
                  const possibleMoves = [];
                  pinnedPiece.generateMoves();
                  for (let k = 0; k < pinnedPiece.moves.length; i++) {
                    // if pinnedPiece move captures pinner then add it
                    if (pinnedPiece.moves[k].targetRow == piece.row && pinnedPiece.moves[k].targetCol == piece.col) {
                      possibleMoves.push(pinnedPiece.moves[k]);
                    }
                  }
                  pinnedPiece.moves = possibleMoves;
                }
              } else {
                // diagonals
                if (piece instanceof Bishop) {
                  // add move that captures pinner
                  pinnedPieces.push(pinnedPiece);
                  const possibleMoves = [];
                  pinnedPiece.generateMoves();
                  for (let k = 0; k < pinnedPiece.moves.length; i++) {
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
              // if first encounter an enemy piece then no piece to be pinned
              break;
            }
          } else {
            if (!pinnedPiece) {
              // if first encounter is friendly piece then it could be pinned
              pinnedPiece = piece;
              continue;
            } else {
              break;
            }
          }
        }
      }
    }

    // send ray in all directions from enemy king to find any pinned pieces that can make discover attacks
    for (let dir = 0; dir < dirs.length; dir++) {
      let pinnedPiece = null;

      for (let i = 1; i < 7; i++) {
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
            // could potentially add duplicate moves as Double Check
          } else {
            break;
          }
        }
      }
    }
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

  generateMoves() {

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