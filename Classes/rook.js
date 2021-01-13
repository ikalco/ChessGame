class Rook extends Piece {
  constructor(color, pos) {
    super(color, pos);
    this.image = chessPiecesImg.get(250, 89, 64, 62);
    this.calcColor();
  }

  show() {
    super.show();
    if (this.color == 0) this.image = chessPiecesImg.get(250, 196, 64, 62);
  }
}
