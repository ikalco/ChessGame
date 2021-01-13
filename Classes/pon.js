class Pon extends Piece {
  constructor(color, pos) {
    super(color, pos);
    this.image = chessPiecesImg.get(628.5, 84.5, 61, 69);
    this.calcColor();
  }

  show() {
    super.show();
    if (this.color == 0) this.image = chessPiecesImg.get(628.5, 191.5, 61, 69);
  }
}
