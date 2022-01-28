class Move {
  static debug = false;

  constructor(startPiece, targetRow, targetCol) {
    if (Move.debug) console.log((new Error).stack);
    this.startPiece = startPiece;
    this.targetPiece = Game.instance.board[targetRow][targetCol];
    this.startRow = startPiece.row;
    this.startCol = startPiece.col;
    this.targetRow = targetRow;
    this.targetCol = targetCol;

    this.lastDoubleMove = '-';
  }

  highlight() {
    fill(125, 0, 0, 160);
    rect(this.targetCol * Game.SquareSize, this.targetRow * Game.SquareSize, Game.SquareSize);
  }

  move() {
    Game.instance.remove(Game.instance.board[this.targetRow][this.targetCol]);
    Game.instance.board[this.targetRow][this.targetCol] = Game.instance.board[this.startRow][this.startCol];
    Game.instance.board[this.startRow][this.startCol] = [];
    const targetPiece = Game.instance.board[this.targetRow][this.targetCol];
    targetPiece.col = this.targetCol;
    targetPiece.row = this.targetRow;
    targetPiece.moveCount++;

    this.lastDoubleMove = Game.instance.lastDoubleMove;
    Game.instance.lastDoubleMove = '-';
  }

  unmove() {
    Game.instance.board[this.targetRow][this.targetCol] = this.targetPiece;
    this.targetPiece.row = this.targetRow;
    this.targetPiece.col = this.targetCol;

    Game.instance.add(this.targetPiece);

    this.targetPiece.drawX = this.targetPiece.col * Game.SquareSize;
    this.targetPiece.drawY = this.targetPiece.row * Game.SquareSize;

    Game.instance.board[this.startRow][this.startCol] = this.startPiece;
    this.startPiece.row = this.startRow;
    this.startPiece.col = this.startCol;
    this.startPiece.moveCount--;

    this.startPiece.drawX = this.startPiece.col * Game.SquareSize;
    this.startPiece.drawY = this.startPiece.row * Game.SquareSize;

    Game.instance.lastDoubleMove = this.lastDoubleMove;
  }
}

class CastleMove extends Move {
  constructor(startPiece, targetRow, targetCol, otherStartPiece, otherTargetRow, otherTargetCol) {
    super(startPiece, targetRow, targetCol);
    this.otherStartPiece = otherStartPiece;
    this.otherTargetPiece = Game.instance.board[otherTargetRow][otherTargetCol];
    this.otherStartRow = otherStartPiece.row;
    this.otherStartCol = otherStartPiece.col;
    this.otherTargetRow = otherTargetRow;
    this.otherTargetCol = otherTargetCol;
  }

  highlight() {
    fill(0, 125, 125, 160);
    rect(this.targetCol * Game.SquareSize, this.targetRow * Game.SquareSize, Game.SquareSize);
  }

  move() {
    Game.instance.remove(Game.instance.board[this.targetRow][this.targetCol]);
    Game.instance.board[this.targetRow][this.targetCol] = Game.instance.board[this.startRow][this.startCol];
    Game.instance.board[this.startRow][this.startCol] = [];
    let targetPiece = Game.instance.board[this.targetRow][this.targetCol];
    targetPiece.col = this.targetCol;
    targetPiece.row = this.targetRow;
    targetPiece.moveCount++;

    Game.instance.remove(Game.instance.board[this.otherTargetRow][this.otherTargetCol]);
    Game.instance.board[this.otherTargetRow][this.otherTargetCol] = Game.instance.board[this.otherStartRow][this.otherStartCol];
    Game.instance.board[this.otherStartRow][this.otherStartCol] = [];
    targetPiece = Game.instance.board[this.otherTargetRow][this.otherTargetCol];
    targetPiece.col = this.otherTargetCol;
    targetPiece.row = this.otherTargetRow;

    targetPiece.drawX = targetPiece.col * Game.SquareSize;
    targetPiece.drawY = targetPiece.row * Game.SquareSize;

    this.lastDoubleMove = Game.instance.lastDoubleMove;
    Game.instance.lastDoubleMove = '-';
  }

  unmove() {
    Game.instance.board[this.targetRow][this.targetCol] = this.targetPiece;
    this.targetPiece.row = this.targetRow;
    this.targetPiece.col = this.targetCol;
    this.targetPiece.moveCount--;

    Game.instance.add(this.targetPiece);

    this.targetPiece.drawX = this.targetPiece.col * Game.SquareSize;
    this.targetPiece.drawY = this.targetPiece.row * Game.SquareSize;

    Game.instance.board[this.startRow][this.startCol] = this.startPiece;
    this.startPiece.row = this.startRow;
    this.startPiece.col = this.startCol;
    this.startPiece.moveCount--;

    this.startPiece.drawX = this.startPiece.col * Game.SquareSize;
    this.startPiece.drawY = this.startPiece.row * Game.SquareSize;

    Game.instance.board[this.otherTargetRow][this.otherTargetCol] = this.otherTargetPiece;
    this.otherTargetPiece.row = this.otherTargetRow;
    this.otherTargetPiece.col = this.otherTargetCol;
    this.otherTargetPiece.moveCount--;

    Game.instance.add(this.otherTargetPiece);

    this.otherTargetPiece.drawX = this.otherTargetPiece.col * Game.SquareSize;
    this.otherTargetPiece.drawY = this.otherTargetPiece.row * Game.SquareSize;

    Game.instance.board[this.otherStartRow][this.otherStartCol] = this.otherStartPiece;
    this.otherStartPiece.row = this.otherStartRow;
    this.otherStartPiece.col = this.otherStartCol;

    this.otherStartPiece.drawX = this.otherStartPiece.col * Game.SquareSize;
    this.otherStartPiece.drawY = this.otherStartPiece.row * Game.SquareSize;

    Game.instance.lastDoubleMove = this.lastDoubleMove;
  }
}

class EnpassantMove extends Move {
  constructor(startPiece, targetRow, targetCol, dir) {
    super(startPiece, targetRow, targetCol);
    this.dir = dir;
    this.targetPiece = Game.instance.board[this.targetRow - this.dir][this.targetCol];
  }

  move() {
    // where we are going (guaranteed to be empty)
    Game.instance.board[this.targetRow][this.targetCol] = Game.instance.board[this.startRow][this.startCol];

    // where we came from
    Game.instance.board[this.startRow][this.startCol] = [];

    // piece that just double moved
    Game.instance.remove(Game.instance.board[this.targetRow - this.dir][this.targetCol]);
    Game.instance.board[this.targetRow - this.dir][this.targetCol] = [];

    // updating position
    const piece = Game.instance.board[this.targetRow][this.targetCol];
    piece.col = this.targetCol;
    piece.row = this.targetRow;
    piece.moveCount++;

    piece.enpassant = null;

    this.lastDoubleMove = Game.instance.lastDoubleMove;
    Game.instance.lastDoubleMove = '-';
  }

  unmove() {
    // startPiece is where we came from
    // double move piece is [this.targetRow - this.dir][this.targetCol]
    // targetPiece is the empty piece behind double move piece

    Game.instance.board[this.startRow][this.startCol] = Game.instance.board[this.targetRow][this.targetCol];
    Game.instance.board[this.targetRow][this.targetCol] = [];

    this.startPiece.row = this.startRow;
    this.startPiece.col = this.startCol;
    this.startPiece.moveCount--;
    this.startPiece.drawX = this.startPiece.col * Game.SquareSize;
    this.startPiece.drawY = this.startPiece.row * Game.SquareSize;

    Game.instance.add(this.targetPiece);
    Game.instance.board[this.targetRow - this.dir][this.targetCol] = this.targetPiece;

    this.targetPiece.row = this.targetRow - this.dir;
    this.targetPiece.col = this.targetCol;
    this.targetPiece.drawX = this.targetPiece.col * Game.SquareSize;
    this.targetPiece.drawY = this.targetPiece.row * Game.SquareSize;

    Game.instance.board[this.targetRow - this.dir][this.targetCol].enpassant = null;
    Game.instance.board[this.targetRow][this.targetCol].enpassant = null;
    Game.instance.board[this.startRow][this.startCol].enpassant = null;

    Game.instance.lastDoubleMove = this.lastDoubleMove;
  }
}

class PromotionMove extends Move {
  constructor(startPiece, targetRow, targetCol, type) {
    super(startPiece, targetRow, targetCol);
    if (type.prototype instanceof Piece) this.type = type;
    else this.type = Queen;
  }

  move() {
    Game.instance.remove(Game.instance.board[this.startRow][this.startCol]);
    Game.instance.board[this.startRow][this.startCol] = []

    Game.instance.remove(Game.instance.board[this.targetRow][this.targetCol]);
    Game.instance.board[this.targetRow][this.targetCol] = new (this.type)(this.targetRow, this.targetCol, this.startPiece.color)
    Game.instance.board[this.targetRow][this.targetCol].moveCount = this.startPiece.moveCount + 1;

    Game.instance.add(Game.instance.board[this.targetRow][this.targetCol]);

    this.lastDoubleMove = Game.instance.lastDoubleMove;
    Game.instance.lastDoubleMove = '-';
  }

  unmove() {
    Game.instance.remove(Game.instance.board[this.targetRow][this.targetCol]);

    Game.instance.board[this.targetRow][this.targetCol] = this.targetPiece;
    this.targetPiece.row = this.targetRow;
    this.targetPiece.col = this.targetCol;

    this.targetPiece.drawX = this.targetPiece.col * Game.SquareSize;
    this.targetPiece.drawY = this.targetPiece.row * Game.SquareSize;
    Game.instance.add(this.targetPiece);

    Game.instance.board[this.startRow][this.startCol] = this.startPiece;
    this.startPiece.row = this.startRow;
    this.startPiece.col = this.startCol;

    this.startPiece.drawX = this.startPiece.col * Game.SquareSize;
    this.startPiece.drawY = this.startPiece.row * Game.SquareSize;
    Game.instance.add(this.startPiece);

    Game.instance.lastDoubleMove = this.lastDoubleMove;
  }
}

class DoubleMove extends Move {
  constructor(startPiece, targetRow, targetCol, dir) {
    super(startPiece, targetRow, targetCol);
    this.dir = dir;
    this.canEnpassantSave = null;
  }

  move() {
    Game.instance.remove(Game.instance.board[this.targetRow][this.targetCol]);
    Game.instance.board[this.targetRow][this.targetCol] = Game.instance.board[this.startRow][this.startCol];
    Game.instance.board[this.startRow][this.startCol] = [];
    const targetPiece = Game.instance.board[this.targetRow][this.targetCol];
    this.canEnpassantSave = targetPiece.canEnpassant;
    targetPiece.canEnpassant = Game.instance.halfmoveCount + 1;
    targetPiece.col = this.targetCol;
    targetPiece.row = this.targetRow;
    targetPiece.moveCount++;

    this.lastDoubleMove = Game.instance.lastDoubleMove;
    Game.instance.lastDoubleMove = Game.toAlgNot(this.targetRow - this.dir, this.targetCol);
  }

  unmove() {
    Game.instance.board[this.targetRow][this.targetCol] = this.targetPiece;
    this.targetPiece.row = this.targetRow;
    this.targetPiece.col = this.targetCol;

    Game.instance.add(this.targetPiece);

    this.targetPiece.drawX = this.targetPiece.col * Game.SquareSize;
    this.targetPiece.drawY = this.targetPiece.row * Game.SquareSize;

    Game.instance.board[this.startRow][this.startCol] = this.startPiece;
    this.startPiece.row = this.startRow;
    this.startPiece.col = this.startCol;
    this.startPiece.moveCount--;

    this.startPiece.drawX = this.startPiece.col * Game.SquareSize;
    this.startPiece.drawY = this.startPiece.row * Game.SquareSize;

    this.startPiece.canEnpassant = this.canEnpassantSave;

    Game.instance.lastDoubleMove = this.lastDoubleMove;
  }
}