import { Board } from "./board";
import { Move } from "./move";
import { PieceColor } from "./piece";
import { PseduoLegalMoveGenerator } from "./pseudo_move_generator";

export class LegalMoveGenerator {
    private pseudo_gen: PseduoLegalMoveGenerator;

    constructor(private board: Board) {
        this.pseudo_gen = new PseduoLegalMoveGenerator(board);
    }

    private gen_moves_active(): Move[] {
        return this.pseudo_gen.gen_moves(
            this.board.active_color == PieceColor.WHITE ?
                this.board.whites :
                this.board.blacks
        );
    }

    private gen_moves_inactive(): Move[] {
        return this.pseudo_gen.gen_moves(
            this.board.active_color == PieceColor.WHITE ?
                this.board.blacks :
                this.board.whites
        );
    }

    gen_legal_moves(): Move[] {
        return this.gen_moves_active();
    }
}