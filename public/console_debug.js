async function load_modules_dev_console() {
    const { board } = await import("./init.js");
    const { AlgebraNotation } = await import("./algebra_notation.js")
    const { EMPTY_PIECE, Piece, PieceColor, PieceType } = await import("./piece.js");
    const { Move, MoveType } = await import("./move.js");
    const { LegalMoveGenerator } = await import("./legal_move_generator.js");
    const { Perft } = await import("./perft.js");

    window.board = board;
    window.AlgebraNotation = AlgebraNotation;
    window.EMPTY_PIECE = EMPTY_PIECE;
    window.Piece = Piece;
    window.PieceColor = PieceColor;
    window.PieceType = PieceType;
    window.Move = Move;
    window.MoveType = MoveType;
    window.LegalMoveGenerator = LegalMoveGenerator;
    window.Perft = Perft;

    console.log("Loaded modules to dev console tool.");
};

function do_moves(move_string) {
    if (window.board == undefined) throw Error("Modules aren't imported to dev console.");

    const generator = new LegalMoveGenerator(board)
    const moves = move_string.split(", ");

    for (const move of moves) {
        const from_col = AlgebraNotation.toCol(move[0]);
        const from_row = AlgebraNotation.toRow(move[1]);
        const to_col = AlgebraNotation.toCol(move[2]);
        const to_row = AlgebraNotation.toRow(move[3]);

        const possible_moves = generator.gen_legal_moves();

        for (const possible_move of possible_moves) {
            if (possible_move.from_col == from_col &&
                possible_move.from_row == from_row &&
                possible_move.to_row == to_row &&
                possible_move.to_col == to_col
            ) {
                board.move(possible_move);
                break;
            }
        }
    }
}