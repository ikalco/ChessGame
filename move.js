class Move {
  constructor(startPiece, targetRow, targetCol) {
    this.startPiece = startPiece;
    this.targetPiece = Game.instance.board[targetRow][targetCol];
    this.startRow = startPiece.row;
    this.startCol = startPiece.col;
    this.targetRow = targetRow;
    this.targetCol = targetCol;
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
  }

  unmove() {
    Game.instance.board[this.targetRow][this.targetCol] = this.targetPiece;
    this.targetPiece.row = this.targetRow;
    this.targetPiece.col = this.targetCol;

    Game.instance.unremove(this.targetPiece);

    this.targetPiece.drawX = this.targetPiece.col * Game.SquareSize;
    this.targetPiece.drawY = this.targetPiece.row * Game.SquareSize;

    Game.instance.board[this.startRow][this.startCol] = this.startPiece;
    this.startPiece.row = this.startRow;
    this.startPiece.col = this.startCol;
    this.startPiece.moveCount--;

    this.startPiece.drawX = this.startPiece.col * Game.SquareSize;
    this.startPiece.drawY = this.startPiece.row * Game.SquareSize;
  }
}

class CastleMove extends Move {
  constructor(startPiece, targetRow, targetCol, otherStartPiece, otherTargetRow, otherTargetCol) {
    super(startPiece, targetRow, targetCol);
    this.otherStartPiece = otherStartPiece;
    this.otherTargetPiece = Game.instance.board[otherTargetRow, otherTargetCol];
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
  }

  unmove() {
    Game.instance.board[this.targetRow][this.targetCol] = this.targetPiece;
    this.targetPiece.row = this.targetRow;
    this.targetPiece.col = this.targetCol;
    this.targetPiece.moveCount--;

    Game.instance.unremove(this.targetPiece);

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

    Game.instance.unremove(this.otherTargetPiece);

    this.otherTargetPiece.drawX = this.otherTargetPiece.col * Game.SquareSize;
    this.otherTargetPiece.drawY = this.otherTargetPiece.row * Game.SquareSize;

    Game.instance.board[this.otherStartRow][this.otherStartCol] = this.otherStartPiece;
    this.otherStartPiece.row = this.otherStartRow;
    this.otherStartPiece.col = this.otherStartCol;

    this.otherStartPiece.drawX = this.otherStartPiece.col * Game.SquareSize;
    this.otherStartPiece.drawY = this.otherStartPiece.row * Game.SquareSize;
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

    Game.instance.unremove(this.targetPiece);
    Game.instance.board[this.targetRow - this.dir][this.targetCol] = this.targetPiece;

    this.targetPiece.row = this.targetRow - this.dir;
    this.targetPiece.col = this.targetCol;
    this.targetPiece.drawX = this.targetPiece.col * Game.SquareSize;
    this.targetPiece.drawY = this.targetPiece.row * Game.SquareSize;
  }
}