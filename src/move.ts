export enum MoveType {
    Normal,     // can be a normal move but also taking, probably bad but oh well
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
    type: MoveType;
};