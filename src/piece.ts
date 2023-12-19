class Piece {
	static WHITE = 0;
	static BLACK = 1;

	static PAWN = 0;
	static ROOK = 1;
	static KNIGHT = 2;
	static BISHOP = 3;
	static KING = 4;
	static QUEEN = 5;

	constructor(row, col, color, type) {
		this.row = row;
		this.col = col;
		this.color = color;
		this.type = type;
	}
}
