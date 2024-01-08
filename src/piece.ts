export enum PieceColor {
    EMPTY = -1,
    WHITE,
    BLACK
}

export enum PieceType {
    EMPTY = -1,
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

export const EMPTY_PIECE = {
    row: -1,
    col: -1,
    color: PieceColor.EMPTY,
    type: PieceType.EMPTY,
    moved: false
};