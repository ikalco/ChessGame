import { Board } from "./board";
import { Move, MoveType } from "./move";
import { EMPTY_PIECE, Piece, PieceColor, PieceType } from "./piece";
import { PseduoLegalMoveGenerator } from "./pseudo_move_generator";

export class LegalMoveGenerator {
    private pseudo_gen: PseduoLegalMoveGenerator;

    constructor(private board: Board) {
        this.pseudo_gen = new PseduoLegalMoveGenerator(board);
    }

    gen_moves_active(): Move[] {
        return [];
    }

    gen_moves_inactive(): Move[] {
        return [];
    }
}