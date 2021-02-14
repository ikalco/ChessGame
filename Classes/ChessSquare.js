class ChessSquare {
  constructor(position = [], color) {
    this.boardPos = position;
    this.x = this.boardPos[1] * PiecePxSize;
    this.y = this.boardPos[0] * PiecePxSize;
    this.backColor = color;
  }

  show() {
    strokeWeight(0);
    push();
    fill(this.backColor);
    rect(this.x, this.y, PiecePxSize, PiecePxSize);
    pop();
  }

  update() {
    this.show();
  }
}
