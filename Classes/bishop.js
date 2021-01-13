class Bishop extends Piece {
  constructor(color, pos) {
    super(color, pos);
    this.image = chessPiecesImg.get(370.75, 80, 71.5, 74);
    this.calcColor();
  }

  show() {
    super.show();
    if (this.color == 0) this.image = chessPiecesImg.get(370.75, 186, 71.5, 74);
  }
}
