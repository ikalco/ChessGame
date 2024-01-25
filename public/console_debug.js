async function load_modules_dev_console() {
    const { board } = await import("./init.js");
    const { AlgebraNotation } = await import("./algebra_notation.js")
    const { EMPTY_PIECE, Piece, PieceColor, PieceType } = await import("./piece.js");
    const { Move, MoveType } = await import("./move.js");
    const { LegalMoveGenerator } = await import("./legal_move_generator.js");

    window.board = board;
    window.AlgebraNotation = AlgebraNotation;
    window.EMPTY_PIECE = EMPTY_PIECE;
    window.Piece = Piece;
    window.PieceColor = PieceColor;
    window.PieceType = PieceType;
    window.Move = Move;
    window.MoveType = MoveType;
    window.LegalMoveGenerator = LegalMoveGenerator;

    console.log("Loaded modules to dev console tool.");
};