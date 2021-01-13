class Knight extends Piece {
  constructor(color, pos) {
    super(color, pos);
    this.image = chessPiecesImg.get(497.75, 84.5, 69.5, 69);
    this.calcColor();
  }

  show() {
    super.show();
    if (this.color == 0)
      this.image = chessPiecesImg.get(497.75, 191.5, 69.5, 69);
  }
}
