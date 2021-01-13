class King extends Piece {
  constructor(color, pos) {
    super(color, pos);
    this.image = chessPiecesImg.get(-5, 80, 70, 72);
    this.calcColor();
  }

  show() {
    super.show();
    if (this.color == 0) this.image = chessPiecesImg.get(-4, 187, 70, 72);
  }
}
