class Queen extends Piece {
  constructor(color, pos) {
    super(color, pos);
    this.image = chessPiecesImg.get(118, 81, 74, 72);
    this.calcColor();
  }

  show() {
    super.show();
    if (this.color == 0) this.image = chessPiecesImg.get(119, 188, 74, 72);
  }
}

//To get the right coordinates for the picture first, get the (left farthest pixel x, top farthest pixel y,width, height)
//Then take 80 - width and divde the first two (left farthest pixel x, top farthest pixel y) and do
//farthest x - (80 - width)/2 + (80 - width)/4 and same for farthest y
//Then set the width and height parts to (left farthest pixel x, top farthest pixel y,"width", "height")
//80 - (80 - width)/2 (same for height)
