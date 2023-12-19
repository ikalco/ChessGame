enum PieceColor {
	WHITE,
	BLACK
}

enum PieceType {
	PAWN,
	ROOK,
	KNIGHT,
	BISHOP,
	KING,
	QUEEN
}

interface Piece {
	row: number,
	col: number,
	color: PieceColor,
	type: PieceType
}
