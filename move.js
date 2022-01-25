class Move {
  constructor(targetRow, targetCol) {
    this.targetRow = targetRow;
    this.targetCol = targetCol;
  }

  highlight() {
    fill(125, 0, 0, 160);
    rect(this.targetCol * Game.SquareSize, this.targetRow * Game.SquareSize, Game.SquareSize);
  }

  move(startPiece) {
    Game.instance.board[this.targetRow][this.targetCol] = Game.instance.board[startPiece.row][startPiece.col];
    Game.instance.board[startPiece.row][startPiece.col] = [];
    const targetPiece = Game.instance.board[this.targetRow][this.targetCol];
    targetPiece.col = this.targetCol;
    targetPiece.row = this.targetRow;
    targetPiece.moveCount++;
  }
}

class DoubleMove extends Move {
  constructor(targetRow, targetCol, otherStartCol, otherStartRow, otherTargetCol, otherTargetRow) {
    super(targetCol, targetRow);
    this.otherStartCol = otherStartCol;
    this.otherStartRow = otherStartRow;
    this.otherTargetCol = otherTargetCol;
    this.otherTargetRow = otherTargetRow;
  }

  highlight() {
    // draw first move
    fill(125, 0, 0, 160);
    rect(this.targetCol * Game.SquareSize, this.targetRow * Game.SquareSize, Game.SquareSize);

    // draw second start
    fill(0, 125, 125, 160)
    rect(this.otherStartCol * Game.SquareSize, this.otherStartRow * Game.SquareSize, Game.SquareSize);

    // draw second target
    fill(0, 127, 205, 160)
    rect(this.otherTargetCol * Game.SquareSize, this.otherTargetRow * Game.SquareSize, Game.SquareSize);
  }
}