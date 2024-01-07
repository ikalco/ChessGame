export type move_flags = {
    promotion: boolean,
    castling: boolean,
    en_passant: boolean
}

export class Move {
    // defines and initializes class properties in the constructor
    constructor(
        public from_row: number,
        public from_col: number,
        public to_row: number,
        public to_col: number,
        public special_flags?: move_flags
    ) {
        if (typeof (special_flags) === undefined) {
            this.special_flags = {
                promotion: false,
                castling: false,
                en_passant: false
            };
        }
    }
}