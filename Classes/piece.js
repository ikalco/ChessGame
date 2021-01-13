class Piece {
  constructor(color, position = []) {
    this.color = color;
    this.boardPos = position;
    this.y = this.boardPos[0] * PiecePxSize;
    this.x = this.boardPos[1] * PiecePxSize;
    this.image = null;
    this.calcColor();
  }

  show() {
    //Background
    push();
    fill(this.backColor);
    rect(this.x, this.y, PiecePxSize, PiecePxSize);
    pop();

    if (this.image != null) {
      image(this.image, this.x, this.y, PiecePxSize, PiecePxSize);
    }
  }

  calcColor() {
    // Calculating Background Color
    if (this.boardPos[1] % 2 == 1) {
      if (this.boardPos[0] % 2 == 1) this.backColor = color(232, 235, 239);
      else this.backColor = color(125, 135, 150);
    } else {
      if (this.boardPos[0] % 2 == 1) this.backColor = color(125, 135, 150);
      else this.backColor = color(232, 235, 239);
    }
  }
}
