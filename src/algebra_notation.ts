import { Move, MoveType } from "./move.js";
import { PieceType } from "./piece.js";

export namespace AlgebraNotation {
    export function toRow(row: string): number {
        switch (row) {
            case '8': return 0;
            case '7': return 1;
            case '6': return 2;
            case '5': return 3;
            case '4': return 4;
            case '3': return 5;
            case '2': return 6;
            case '1': return 7;
            default: return -1;
        }
    }

    export function fromRow(row: number): string {
        switch (row) {
            case 0: return '8';
            case 1: return '7';
            case 2: return '6';
            case 3: return '5';
            case 4: return '4';
            case 5: return '3';
            case 6: return '2';
            case 7: return '1';
            default: throw Error("Invalid row to convert into algebra notation.");
        }
    }

    export function toCol(col: string): number {
        switch (col) {
            case 'a': return 0;
            case 'b': return 1;
            case 'c': return 2;
            case 'd': return 3;
            case 'e': return 4;
            case 'f': return 5;
            case 'g': return 6;
            case 'h': return 7;
            default: return -1;
        }
    }

    export function fromCol(col: number): string {
        switch (col) {
            case 0: return 'a';
            case 1: return 'b';
            case 2: return 'c';
            case 3: return 'd';
            case 4: return 'e';
            case 5: return 'f';
            case 6: return 'g';
            case 7: return 'h';
            default: throw Error("Invalid column to convert into algebra notation.");
        }
    }

    export function fromMoveSimple(move: Move): string {
        let move_string = AlgebraNotation.fromCol(move.from_col) + AlgebraNotation.fromRow(move.from_row) + AlgebraNotation.fromCol(move.to_col) + AlgebraNotation.fromRow(move.to_row);

        if (move.type == MoveType.Promotion) {
            switch (move.promotion_type) {
                case PieceType.QUEEN: move_string += 'q'; break;
                case PieceType.ROOK: move_string += 'r'; break;
                case PieceType.BISHOP: move_string += 'b'; break;
                case PieceType.KNIGHT: move_string += 'n'; break;
            }
        }

        return move_string;
    }

    export function toPieceType(type: string): PieceType {
        switch (type) {
            case 'p': return PieceType.PAWN;
            case 'n': return PieceType.KNIGHT;
            case 'b': return PieceType.BISHOP;
            case 'r': return PieceType.ROOK;
            case 'q': return PieceType.QUEEN;
            case 'k': return PieceType.KING;
            default: throw Error("Invalid piece type letter.");
        }
    }
}