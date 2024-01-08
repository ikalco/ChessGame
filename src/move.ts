export enum MoveType {
    Normal,
    PawnDouble,
    EnPassant,
    Promotion,
    Castling
}

export class Move {
    constructor(
        public from_row: number,
        public from_col: number,
        public to_row: number,
        public to_col: number,
        public type?: MoveType
    ) {
        if (typeof (type) === undefined) {
            this.type = MoveType.Normal;
        }
    }
}