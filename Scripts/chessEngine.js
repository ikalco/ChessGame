class ChessEngine {
  constructor() {
    this.score = 0;
  }

  update() {
    if (Board.ColorToMove == 2 && checkmate == false) {
      Board.makeMove(this.sample(blackMoves));
      //this.playBestMove();
    }
  }

  saveBoard() {
    let originBoard = [];
    for (let i in Board.Squares) {
      originBoard.push(Board.Squares[i]);
    }
    return originBoard;
  }

  loadBoard(originBoard) {
    for (let i in originBoard) {
      Board.Squares[i] = originBoard[i];
    }
  }

  playBestMove() {
    let bestScore = 999999;
    let bestMove;

    moves = generateMoves();
    console.table(moves);

    for (let i = 0; i < 26; i++) {
      let move = moves[i];
      print(move);
      if (Piece.IsColor(move.startPiece, Board.ColorToMove)) {
        let oldBoard = this.saveBoard();
        Board.makeMove(move);
        let boardScore = this.evaluate(Board.Squares); //this.minimax(Board.Squares, 1, false);
        console.log(boardScore);
        Board.unmakeMove(move);
        this.loadBoard(oldBoard);
        if (boardScore < bestScore) {
          //TODO: NOT COMPARING PROPERLY
          bestScore = boardScore;
          bestMove = move;
        }
      }
    }
    //if (Piece.IsColor(bestMove.startPiece, Board.ColorToMove)) {
    Board.makeMove(bestMove);
    console.log('done');
    console.log(bestMove);
    //}
  }

  minimax(board, depth, maxPlayer) {
    if (depth == 0) return this.evaluate(board);
    moves = generateMoves();
    if (maxPlayer) {
      // white to move
      let value = -999999;
      for (let i = 0; i < moves.length; i++) {
        let move = moves[i];
        if (Piece.IsColor(move.startPiece, Board.ColorToMove)) {
          let oldBoard = this.saveBoard();
          Board.makeMove(move);
          value = Math.max(this.minimax(Board.Squares, depth - 1, false), value);
          Board.unmakeMove(move);
          this.loadBoard(oldBoard);
        }
      }
      return value;
    } else {
      // black to move
      let value = 999999;
      for (let i = 0; i < moves.length; i++) {
        let move = moves[i];
        if (Piece.IsColor(move.startPiece, Board.ColorToMove)) {
          let oldBoard = this.saveBoard();
          Board.makeMove(move);
          value = Math.min(this.minimax(Board.Squares, depth - 1, true), value);
          Board.unmakeMove(move);
          this.loadBoard(oldBoard);
        }
      }
      return value;
    }
  }

  evaluate(board) {
    let score = 0;

    let lookup = {
      0b00000: 0, // empty sqaure
      0b01001: 900,
      0b01010: 10,
      0b01011: 30,
      0b01100: 30,
      0b01101: 50,
      0b01110: 90,
      0b10001: -900,
      0b10010: -10,
      0b10011: -30,
      0b10100: -30,
      0b10101: -50,
      0b10110: -90,
    };

    // counts material
    for (let p in board) {
      //print(board[p].type);
      score += lookup[board[p].type];
    }

    return score;
  }

  sample(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
