let directionOffsets = [8, -8, -1, 1, 7, -7, 9, -9];
let numSquaresToEdge = [];
let whiteKingAttacks = [];

function preCalculateMoveData() {
  for (let file = 0; file < 8; file++) {
    for (let rank = 0; rank < 8; rank++) {
      let numNorth = 7 - rank;
      let numSouth = rank;
      let numWest = file;
      let numEast = 7 - file;

      let squareIndex = rank * 8 + file;

      numSquaresToEdge[squareIndex] = [
        numNorth,
        numSouth,
        numWest,
        numEast,
        min(numNorth, numWest),
        min(numSouth, numEast),
        min(numNorth, numEast),
        min(numSouth, numWest),
      ];
    }
  }
}

class Move {
  constructor(startSquare, targetSquare, takeSquare) {
    this.startSquare = startSquare;
    this.targetSquare = targetSquare;
    this.takeSquare = takeSquare;
    this.extraMove;
    this.targetRow = targetSquare % 8 > 0 ? (targetSquare - (targetSquare % 8)) / 8 : targetSquare / 8;
    this.targetCol = targetSquare - this.targetRow * 8;
    this.startRow = startSquare % 8 > 0 ? (startSquare - (startSquare % 8)) / 8 : startSquare / 8;
    this.startCol = startSquare - this.startRow * 8;
    this.startPiece = Board.Squares[startSquare];
    this.targetPiece = Board.Squares[targetSquare];
  }

  draw() {
    push();
    fill(125, 0, 0, 160);
    rect(this.targetCol * PiecePxSize, this.targetRow * PiecePxSize, PiecePxSize);
    pop();
  }
}

function generateLegalMoves() {
  console.time('Execution Time');
  let pseudoLegalMoves = GeneratePseudoLegalMoves();
  let legalMoves = [];
  let myKingSquare = Board.ColorToMove == 1 ? whiteKingSquare : blackKingSquare;

  for (let i = 0; i < pseudoLegalMoves.length; i++) {
    let moveToVerify = pseudoLegalMoves[i];
    Board.MakeMove(moveToVerify);
    let opponentResponses = GeneratePseudoLegalMoves();

    if (opponentResponses.some((response) => response.targetSquare == myKingSquare)) {
      //last move was illegal, king is captured
    } else {
      legalMoves.push(moveToVerify);
    }

    Board.UnmakeMove();
  }

  console.timeEnd('Execution Time');
  return legalMoves;
}

function generateMoves() {
  console.time('Execution Time');

  let pseudoLegalMoves = GeneratePseudoLegalMoves();
  let legalMoves = [];
  let inCheck = false;

  let whiteAttacks = [];
  let blackAttacks = [];
  for (let j = 0; j < pseudoLegalMoves.length; j++) {
    let piece = pseudoLegalMoves[j].startPiece;
    if (!whiteAttacks.includes(pseudoLegalMoves[j]) && Piece.IsColor(piece, 1)) whiteAttacks.push(pseudoLegalMoves[j]);
    if (!blackAttacks.includes(pseudoLegalMoves[j]) && Piece.IsColor(piece, 2)) blackAttacks.push(pseudoLegalMoves[j]);
  }

  for (let i = 0; i < blackAttacks.length; i++) {
    if (blackAttacks[i].targetSquare == whiteKingSquare) {
      print('white in check');
      inCheck = true;
      for (let j = 0; j < pseudoLegalMoves.length; j++) {
        let pMove = pseudoLegalMoves[j];
        //adding all the legal moves for when in check
        //moves where king isn't attacked anymore
        if (pMove.targetSquare == blackAttacks[i].startSquare) legalMoves.push(pMove);
        if (Piece.getPiece(pMove.startPiece) == Piece.King) {
          //check that the pMove.targetSquare is not in blackAttacks
          if (blackAttacks.every((attack) => attack.targetSquare != pMove.targetSquare)) legalMoves.push(pMove);
        }

        moves = legalMoves;
      }
    }
  }

  for (let i = 0; i < whiteAttacks.length; i++) {
    if (whiteAttacks[i].targetSquare == blackKingSquare) {
      print('black in check');
      inCheck = true;
      for (let j = 0; j < pseudoLegalMoves.length; j++) {
        let pMove = pseudoLegalMoves[j];
        //adding all the legal moves for when in check
        //moves where king isn't attacked anymore
        if (pMove.targetSquare == whiteAttacks[i].startSquare) legalMoves.push(pMove);
        if (Piece.getPiece(pMove.startPiece) == Piece.King) {
          //check that the pMove.targetSquare is not in blackAttacks
          if (whiteAttacks.every((attack) => attack.targetSquare != pMove.targetSquare)) legalMoves.push(pMove);
        }

        moves = legalMoves;
      }
    }
  }

  if (inCheck == false) moves = pseudoLegalMoves;
  console.timeEnd('Execution Time');
}

function GeneratePseudoLegalMoves() {
  pseudoLegalMoves = [];

  for (let startSquare = 0; startSquare < 64; startSquare++) {
    let piece = Board.Squares[startSquare];
    //if (Piece.IsColor(piece, Board.ColorToMove)) {
    if (Piece.IsSlidingPiece(piece)) {
      let tmp = GenerateSlidingMoves(startSquare, piece);
      for (let i = 0; i < tmp.length; i++) {
        pseudoLegalMoves.push(tmp[i]);
      }
    }
    if (Piece.getPiece(piece) == Piece.Pawn || Piece.getPiece(piece) == Piece.King) {
      let tmp = GeneratePawnKingMoves(startSquare, piece);
      for (let i = 0; i < tmp.length; i++) {
        pseudoLegalMoves.push(tmp[i]);
      }
    }
    if (Piece.getPiece(piece) == Piece.Knight) {
      let tmp = GenerateKnightMoves(startSquare);
      for (let i = 0; i < tmp.length; i++) {
        pseudoLegalMoves.push(tmp[i]);
      }
    }
    //}
  }

  return pseudoLegalMoves;
}

function GeneratePseudoLegalMove(startSquare) {
  pseudoLegalMoves = [];

  let piece = Board.Squares[startSquare];
  if (Piece.IsSlidingPiece(piece)) {
    let tmp = GenerateSlidingMoves(startSquare, piece);
    for (let i = 0; i < tmp.length; i++) {
      pseudoLegalMoves.push(tmp[i]);
    }
  }
  if (Piece.getPiece(piece) == Piece.Pawn || Piece.getPiece(piece) == Piece.King) {
    let tmp = GeneratePawnKingMoves(startSquare, piece);
    for (let i = 0; i < tmp.length; i++) {
      pseudoLegalMoves.push(tmp[i]);
    }
  }
  if (Piece.getPiece(piece) == Piece.Knight) {
    let tmp = GenerateKnightMoves(startSquare);
    for (let i = 0; i < tmp.length; i++) {
      pseudoLegalMoves.push(tmp[i]);
    }
  }

  return pseudoLegalMoves;
}

function GenerateKnightMoves(startSquare) {
  directionOffsets = [-17, 17, -15, 15, 6, -6, -10, 10];
  let pseudoLegalMoves = [];

  for (let directionIndex = 0; directionIndex < 9; directionIndex++) {
    let targetSquare = startSquare + directionOffsets[directionIndex];
    let targetPiece = Board.Squares[targetSquare];

    if (targetPiece == undefined) continue;

    let friendlyColor = Piece.getColor(Board.Squares[startSquare]);

    if (Piece.IsColor(targetPiece, friendlyColor)) continue;

    if (abs(targetPiece.col - Board.Squares[startSquare].col) > 2) continue;

    pseudoLegalMoves.push(new Move(startSquare, targetSquare, targetSquare));
  }

  return pseudoLegalMoves;
}

function GeneratePawnKingMoves(startSquare, piece) {
  let pseudoLegalMoves = [];

  directionOffsets = [-9, -8, -7, -16, -1, 1, 7, 8, 9, 16];
  let startDirIndex = Piece.getPiece(piece) == Piece.Pawn && Piece.IsColor(piece, 2) ? 6 : 0;
  let endDirIndex = Piece.getPiece(piece) == Piece.Pawn && Piece.IsColor(piece, 1) ? 4 : 10;

  for (let directionIndex = startDirIndex; directionIndex < endDirIndex; directionIndex++) {
    let targetSquare = startSquare + directionOffsets[directionIndex];
    let targetPiece = Board.Squares[targetSquare];

    if (targetPiece == undefined) continue;

    let friendlyColor = Piece.getColor(Board.Squares[startSquare]);

    if (Piece.IsColor(targetPiece, friendlyColor)) continue;

    if (Piece.getPiece(piece) == Piece.Pawn) {
      if (directionOffsets[directionIndex] == -8 && Piece.getPiece(targetPiece) != Piece.Empty) continue;
      if (directionOffsets[directionIndex] == 8 && Piece.getPiece(targetPiece) != Piece.Empty) continue;
      if (directionOffsets[directionIndex] == -7 && Piece.getPiece(targetPiece) == Piece.Empty) continue;
      if (directionOffsets[directionIndex] == -9 && Piece.getPiece(targetPiece) == Piece.Empty) continue;
      if (directionOffsets[directionIndex] == 7 && Piece.getPiece(targetPiece) == Piece.Empty) continue;
      if (directionOffsets[directionIndex] == 9 && Piece.getPiece(targetPiece) == Piece.Empty) continue;

      if (Board.Squares[startSquare].moved == true && (directionOffsets[directionIndex] == 16 || directionOffsets[directionIndex] == -16)) continue;
      if (Piece.IsColor(piece, 2) && Board.Squares[startSquare + 16] != undefined)
        if (Board.Squares[startSquare + 16].type != Piece.Empty && directionOffsets[directionIndex] == 16) continue;
      if (Piece.IsColor(piece, 1) && Board.Squares[startSquare - 16] != undefined)
        if (Board.Squares[startSquare - 16].type != Piece.Empty && directionOffsets[directionIndex] == -16) continue;
      if (directionOffsets[directionIndex] == 16 || directionOffsets[directionIndex] == -16) {
        if (Piece.getPiece(Board.Squares[startSquare - 8]) != Piece.Empty && Piece.IsColor(Board.Squares[startSquare], 1)) continue;
        if (Piece.getPiece(Board.Squares[startSquare + 8]) != Piece.Empty && Piece.IsColor(Board.Squares[startSquare], 2)) continue;
      }

      //En Passant Logic Start
      if (playedMoves.length > 0) {
        let lastMove = playedMoves[playedMoves.length - 1];
        if (lastMove.targetSquare - lastMove.startSquare == 16 && Piece.IsColor(Board.Squares[startSquare], 1)) {
          if (lastMove.targetRow == Board.Squares[startSquare].row) {
            if (lastMove.targetCol - 1 == Board.Squares[startSquare].col) {
              pseudoLegalMoves.push(new Move(startSquare, startSquare - 7, startSquare + 1));
            }
            if (lastMove.targetCol + 1 == Board.Squares[startSquare].col) {
              pseudoLegalMoves.push(new Move(startSquare, startSquare - 9, startSquare - 1));
            }
          }
        }
        if (lastMove.targetSquare - lastMove.startSquare == -16 && Piece.IsColor(Board.Squares[startSquare], 2)) {
          if (lastMove.targetRow == Board.Squares[startSquare].row) {
            if (lastMove.targetCol + 1 == Board.Squares[startSquare].col) {
              pseudoLegalMoves.push(new Move(startSquare, startSquare + 7, startSquare - 1));
            }
            if (lastMove.targetCol - 1 == Board.Squares[startSquare].col) {
              pseudoLegalMoves.push(new Move(startSquare, startSquare + 9, startSquare + 1));
            }
          }
        }
      }
      //En Passant Logic End
    } else {
      if (directionOffsets[directionIndex] == 16 || directionOffsets[directionIndex] == -16) continue;
    }

    //when the king gets a move it breaks and 134

    if (Piece.getPiece(piece) == Piece.King) {
      //Castling Logic Start
      if ((piece.row == 0 || piece.row == 7) && piece.col == 4) {
        // Chekcs if king has moved

        let kingsRow = [];
        for (let i = 0; i < 8; i++) {
          kingsRow.push(Board.Squares[piece.row * 8 + i]);
        }

        for (let i = 0; i < 8; i++) {
          let checkPiece = Board.Squares[piece.row * 8 + i];

          if (Piece.IsPiece(checkPiece, Piece.Rook) && checkPiece.moved == false) {
            if (kingsRow[5].type == Piece.Empty && kingsRow[6].type == Piece.Empty && !(checkPiece.col < 4)) {
              let tmp = new Move(startSquare, startSquare + 2, startSquare);
              tmp.extraMove = [piece.row * 8 + 7, piece.row * 8 + 5];
              pseudoLegalMoves.push(tmp);
            }
            if (kingsRow[1].type == Piece.Empty && kingsRow[2].type == Piece.Empty && kingsRow[3].type == Piece.Empty && checkPiece.col < 4) {
              let tmp = new Move(startSquare, startSquare - 2, startSquare);
              tmp.extraMove = [piece.row * 8, piece.row * 8 + 3];
              pseudoLegalMoves.push(tmp);
            }
          }
          //Castling Logic End
        }
      }
    }

    if (abs(targetPiece.col - Board.Squares[startSquare].col) > 1) continue;

    pseudoLegalMoves.push(new Move(startSquare, targetSquare, targetSquare));
  }

  return pseudoLegalMoves;
}

function GenerateSlidingMoves(startSquare, piece) {
  preCalculateMoveData();
  let pseudoLegalMoves = [];
  directionOffsets = [8, -8, -1, 1, 7, -7, 9, -9];
  let startDirIndex = Piece.getPiece(piece) == Piece.Bishop ? 4 : 0;
  let endDirIndex = Piece.getPiece(piece) == Piece.Rook ? 4 : 8;

  for (let directionIndex = startDirIndex; directionIndex < endDirIndex; directionIndex++) {
    for (let n = 0; n < numSquaresToEdge[startSquare][directionIndex]; n++) {
      let targetSquare = startSquare + directionOffsets[directionIndex] * (n + 1);
      let targetPiece = Board.Squares[targetSquare];

      if (targetPiece == undefined) continue;

      let friendlyColor = Piece.getColor(Board.Squares[startSquare]);

      if (Piece.IsColor(targetPiece, friendlyColor)) break;

      pseudoLegalMoves.push(new Move(startSquare, targetSquare, targetSquare));

      if (Piece.IsColor(targetPiece, friendlyColor == 1 ? 2 : 1)) break;
    }
  }

  return pseudoLegalMoves;
}

function Promotion(targetSquare) {
  Board.Squares[targetSquare].type += 4;
}
