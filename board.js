class Game {
  static instance;
  static SquareSize = Math.min(window.innerWidth, window.innerHeight) / 8;
  static #background;

  constructor(fenString) {
    if (Game.instance) throw Error("You can only have one game!");

    this.loadPosFromFen(fenString);
    console.log(this.board);
  }

  loadPosFromFen(fen) {
    const lookup = {
      k: King,
      p: Pawn,
      n: Knight,
      b: Bishop,
      r: Rook,
      q: Queen,
    };
    const fields = fen.split(' ');

    this.board = new Array(8).fill(0).map(() => new Array(8));
    const fenBoard = fields.shift().split('/');
    for (let i = 0; i < this.board.length; i++) {
      this.board[i] = fenBoard[i].split('');

      for (let j = 0; j < this.board[i].length; j++) {
        if (!/^\d$/g.test(this.board[i][j])) {
          const color = this.board[i][j].toLocaleLowerCase() == this.board[i][j] ? 1 : 0;
          this.board[i][j] = new (lookup[this.board[i][j].toLocaleLowerCase()])(i, j, color);
        } else {
          const numOfSkips = parseInt(this.board[i][j]);
          for (let k = 0; k < numOfSkips; k++) {
            this.board[i][j + k] = null;
          }
          j += numOfSkips;
        }
      }
    }

    this.playerToMove = fields.shift() == 'w' ? 0 : 1;

    // which sides the kings can castle
    // doesnt really matter in this implementation
    fields.shift();

    const enPassantPiece = fields.shift();
    if (enPassantPiece != '-') {
      if (enPassantPiece[1] == '3') {
        // add this position to list of black pawn attack moves
      } else if (enPassantPiece[1] == '6') {
        // add this position to list of white pawn attack moves
      }
    }

    this.halfmoveCount = parseInt(fields.shift());
    this.fullmoveCount = parseInt(fields.shift());
  }

  update() {

  }

  drawPieces() {
    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board[0].length; j++) {
        if (this.board[i][j]) this.board[i][j].draw();
      }
    }
  }

  static resizeBackground(size) {
    const SquareColorEven = "#f1d9c0";
    const SquareColorOdd = "#a97b65";

    this.#background.resizeCanvas(size, size);
    this.#background.background(color(SquareColorEven));
    this.#background.fill(color(SquareColorOdd));
    this.#background.noStroke();
    Game.SquareSize = width / 8;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if ((i + j) & 1 != 0) this.#background.rect(i * Game.SquareSize, j * Game.SquareSize, Game.SquareSize, Game.SquareSize);
      }
    }
  }

  static drawBackground() {
    image(this.#background, 0, 0);
  }

  static set background(bg) {
    if (!this.#background) this.#background = bg;
  }
}