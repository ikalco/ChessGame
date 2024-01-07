export enum PieceColor {
    WHITE,
    BLACK
}

export enum PieceType {
    PAWN,
    ROOK,
    KNIGHT,
    BISHOP,
    KING,
    QUEEN
}

export interface Piece {
    row: number,
    col: number,
    color: PieceColor,
    type: PieceType,
    moved: boolean
}
