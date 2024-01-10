import { PieceType } from "./piece";

export enum MoveType {
    Normal,
    PawnDouble,
    EnPassant,
    Promotion,
    Castling
}

export type Move = {
    from_row: number,
    from_col: number,
    to_row: number,
    to_col: number,
    type: MoveType,
    taking: boolean,
    first_move?: boolean,
    promotion_type?: PieceType;
};