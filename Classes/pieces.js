class Piece {
  constructor(type, p) {
    this.type = type;
    this.row = p % 8 > 0 ? (p - (p % 8)) / 8 : p / 8;
    this.col = p - this.row * 8;
    this.y = this.row * PiecePxSize; //Row
    this.x = this.col * PiecePxSize; //Col
  }

  static get Empty() {
    return 0b00000;
  }
  static get White() {
    return 0b01000;
  }
  static get Black() {
    return 0b10000;
  }
  static get King() {
    return 0b00001;
  }
  static get Pawn() {
    return 0b00010;
  }
  static get Knight() {
    return 0b00011;
  }
  static get Bishop() {
    return 0b00100;
  }
  static get Rook() {
    return 0b00101;
  }
  static get Queen() {
    return 0b00110;
  }
}
