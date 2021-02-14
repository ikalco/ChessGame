class Piece {
  constructor(color, position = []) {
    this.color = color;
    this.boardPos = position;
    this.x = this.boardPos[1] * PiecePxSize; // if you switch
    this.y = this.boardPos[0] * PiecePxSize; // these it will work in white on left and black on right
    this.image = null;
  }

  show() {
    if (this.image != null) {
      image(this.image, this.x, this.y, PiecePxSize, PiecePxSize);
    }
  }

  checkIfClickedOn() {
    if (mouseIsPressed && mouseButton === LEFT) {
      if (mouseX >= this.x && mouseX <= this.x + PiecePxSize) {
        if (mouseY >= this.y && mouseY <= this.y + PiecePxSize) {
          // Show what moves you can do with a green dot.
          this.showPossibleMoves();
          // Only happens when mouse is clicked inside this instance of piece.
        }
      }
    }
  }

  update() {
    this.x = this.boardPos[1] * PiecePxSize;
    this.y = this.boardPos[0] * PiecePxSize;
    this.checkIfClickedOn();
    this.show();
  }

  showPossibleMoves() {
    print(this);
  }

  static get White() {
    return 0b01000;
  }
  static get Black() {
    return 0b10000;
  }
  static get Empty() {
    return 0b00000;
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

class Pon extends Piece {
  constructor(color, pos) {
    super(color, pos);
    this.image = chessPiecesImg.get(1665, 0.5, 333.33334, 333.5);
  }
  show() {
    super.show();
    if (this.color == 0) this.image = chessPiecesImg.get(1665, 333.5, 333.33334, 333.5);
  }
}

class Bishop extends Piece {
  constructor(color, pos) {
    super(color, pos);
    this.image = chessPiecesImg.get(666, 0.5, 333.33334, 333.5);
  }

  show() {
    super.show();
    if (this.color == 0) this.image = chessPiecesImg.get(666, 333.5, 333.33334, 333.5);
  }
}

class King extends Piece {
  constructor(color, pos) {
    super(color, pos);
    this.image = chessPiecesImg.get(0, 0.5, 333.33334, 333.5);
  }

  show() {
    super.show();
    if (this.color == 0) this.image = chessPiecesImg.get(0, 333.5, 333.33334, 333.5);
  }
}

class Knight extends Piece {
  constructor(color, pos) {
    super(color, pos);
    this.image = chessPiecesImg.get(999, 0.5, 333.33334, 333.5);
  }

  show() {
    super.show();
    if (this.color == 0) this.image = chessPiecesImg.get(999, 333.5, 333.33334, 333.5);
  }
}

class Queen extends Piece {
  constructor(color, pos) {
    super(color, pos);
    this.image = chessPiecesImg.get(333, 0.5, 333.33334, 333.5);
  }

  show() {
    super.show();
    if (this.color == 0) this.image = chessPiecesImg.get(333, 333.5, 333.33334, 333.5);
  }
}

class Rook extends Piece {
  constructor(color, pos) {
    super(color, pos);
    this.image = chessPiecesImg.get(1332, 0.5, 333.33334, 333.5);
  }

  show() {
    super.show();
    if (this.color == 0) this.image = chessPiecesImg.get(1332, 333.5, 333.33334, 333.5);
  }
}

//To get the right coordinates for the picture first, get the (left farthest pixel x, top farthest pixel y,width, height)
//Then take 80 - width and divde the first two (left farthest pixel x, top farthest pixel y) and do
//farthest x - (80 - width)/2 + (80 - width)/4 and same for farthest y
//Then set the width and height parts to (left farthest pixel x, top farthest pixel y,"width", "height")
//80 - (80 - width)/2 (same for height)
