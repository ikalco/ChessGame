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
    Game.instance.remove(Game.instance.board[this.targetRow][this.targetCol]);
    Game.instance.board[this.targetRow][this.targetCol] = Game.instance.board[startPiece.row][startPiece.col];
    Game.instance.board[startPiece.row][startPiece.col] = [];
    const targetPiece = Game.instance.board[this.targetRow][this.targetCol];
    targetPiece.col = this.targetCol;
    targetPiece.row = this.targetRow;
    targetPiece.moveCount++;

  }
}

class DoubleMove {
  constructor(targetRow, targetCol, otherStartRow, otherStartCol, otherTargetRow, otherTargetCol) {
    this.targetRow = targetRow;
    this.targetCol = targetCol;
    this.otherStartRow = otherStartRow;
    this.otherStartCol = otherStartCol;
    this.otherTargetRow = otherTargetRow;
    this.otherTargetCol = otherTargetCol;
  }

  highlight() {
    // draw first move
    //fill(125, 0, 0, 160);
    fill(0, 125, 125, 160);
    rect(this.targetCol * Game.SquareSize, this.targetRow * Game.SquareSize, Game.SquareSize);

    // draw second start
    //fill(0, 125, 125, 160);
    //rect(this.otherStartCol * Game.SquareSize, this.otherStartRow * Game.SquareSize, Game.SquareSize);

    // draw second target
    //fill(0, 127, 205, 160);
    //rect(this.otherTargetCol * Game.SquareSize, this.otherTargetRow * Game.SquareSize, Game.SquareSize);
  }

  move(startPiece) {
    Game.instance.remove(Game.instance.board[this.targetRow][this.targetCol]);
    Game.instance.board[this.targetRow][this.targetCol] = Game.instance.board[startPiece.row][startPiece.col];
    Game.instance.board[startPiece.row][startPiece.col] = [];
    let targetPiece = Game.instance.board[this.targetRow][this.targetCol];
    targetPiece.col = this.targetCol;
    targetPiece.row = this.targetRow;
    targetPiece.moveCount++;

    Game.instance.remove(Game.instance.board[this.taotherTargetRowrgetRow][this.otherTargetCol]);
    Game.instance.board[this.otherTargetRow][this.otherTargetCol] = Game.instance.board[this.otherStartRow][this.otherStartCol];
    Game.instance.board[this.otherStartRow][this.otherStartCol] = [];
    targetPiece = Game.instance.board[this.otherTargetRow][this.otherTargetCol];
    targetPiece.col = this.otherTargetCol;
    targetPiece.row = this.otherTargetRow;

    targetPiece.drawX = targetPiece.col * Game.SquareSize;
    targetPiece.drawY = targetPiece.row * Game.SquareSize;
  }
}