class Move {
  constructor(targetRow, targetCol) {
    this.targetRow = targetRow;
    this.targetCol = targetCol;
  }

  move() {

  }

  highlight() {
    fill(125, 0, 0, 160);
    rect(this.targetCol * Game.SquareSize, this.targetRow * Game.SquareSize, Game.SquareSize);
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

  move() {

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