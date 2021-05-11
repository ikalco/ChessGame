let directionOffsets = [8, -8, -1, 1, 7, -7, 9, -9];
let numSquaresToEdge = [];
let whiteAttacks = [];
let blackAttacks = [];
let whiteAttacksExtra = [];
let blackAttacksExtra = [];
let pinnedPieces = [];
let skipKingMoves = [[], []];
let whiteMoves = [];
let blackMoves = [];

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
    this.takePiece = Board.Squares[takeSquare];
  }

  draw() {
    push();
    fill(125, 0, 0, 160);
    rect(this.targetCol * PiecePxSize, this.targetRow * PiecePxSize, PiecePxSize);
    pop();
  }
}

function generateAttacks(pseudoLegalMoves) {
  //Calculating all attackMoves
  whiteAttacks = [];
  blackAttacks = [];

  for (let j = 0; j < pseudoLegalMoves.length; j++) {
    let piece = pseudoLegalMoves[j].startPiece;
    if (!Piece.IsPiece(piece, Piece.Pawn)) {
      if (whiteAttacks.every((move) => move.takeSquare != pseudoLegalMoves[j].takeSquare) && Piece.IsColor(piece, 1))
        whiteAttacks.push(pseudoLegalMoves[j]);
      if (blackAttacks.every((move) => move.takeSquare != pseudoLegalMoves[j].takeSquare) && Piece.IsColor(piece, 2))
        blackAttacks.push(pseudoLegalMoves[j]);
    }
  }

  for (let i = 0; i < whiteAttacksExtra.length; i++) {
    if (whiteAttacks.every((move) => move.takeSquare != whiteAttacksExtra[i].takeSquare)) whiteAttacks.push(whiteAttacksExtra[i]);
  }
  //Adding all extra moves
  for (let i = 0; i < blackAttacksExtra.length; i++) {
    if (blackAttacks.every((move) => move.takeSquare != blackAttacksExtra[i].takeSquare)) blackAttacks.push(blackAttacksExtra[i]);
  }

  whiteAttacksExtra = [];
  blackAttacksExtra = [];
}

function generatePinnedPieces() {
  //cast a ray like a queen from the king and if it hits a friendly piece and an attacked enemy in the
  //same line of sight then the first hit piece is pinned;
  preCalculateMoveData();
  let startSquares = [whiteKingSquare, blackKingSquare];
  directionOffsets = [8, -8, -1, 1, 7, -7, 9, -9];
  let startDirIndex = 0;
  let endDirIndex = 8;
  let pcsInDir = [[], [], [], [], [], [], [], []];
  pinnedPieces = [[], []];

  for (let j = 0; j < startSquares.length; j++) {
    for (let directionIndex = startDirIndex; directionIndex < endDirIndex; directionIndex++) {
      for (let n = 0; n < numSquaresToEdge[startSquares[j]][directionIndex]; n++) {
        let targetSquare = startSquares[j] + directionOffsets[directionIndex] * (n + 1);
        let targetPiece = Board.Squares[targetSquare];

        if (targetPiece == undefined || Piece.IsPiece(targetPiece, Piece.Empty)) continue;
        pcsInDir[directionIndex].push(targetPiece);
      }
    }

    //pinned pieces start
    for (let i = 0; i < pcsInDir.length; i++) {
      if (pcsInDir[i].length < 2) continue;

      let pinnedPiece = pcsInDir[i][0];
      let pinningPiece = pcsInDir[i][1];

      if (
        (startSquares[j] == whiteKingSquare && Piece.IsColor(pinnedPiece, 1) && Piece.IsColor(pinningPiece, 2)) ||
        (startSquares[j] == blackKingSquare && Piece.IsColor(pinnedPiece, 2) && Piece.IsColor(pinningPiece, 1))
      ) {
        if (Piece.IsPiece(pinningPiece, Piece.Queen)) {
          pinnedPieces[0].push(directionOffsets[i]);
          pinnedPieces[1].push(pinnedPiece);
        }
        if ((abs(directionOffsets[i]) == 1 || abs(directionOffsets[i]) == 8) && Piece.IsPiece(pinningPiece, Piece.Rook)) {
          pinnedPieces[0].push(directionOffsets[i]);
          pinnedPieces[1].push(pinnedPiece);
        }
        if ((abs(directionOffsets[i]) == 7 || abs(directionOffsets[i]) == 9) && Piece.IsPiece(pinningPiece, Piece.Bishop)) {
          pinnedPieces[0].push(directionOffsets[i]);
          pinnedPieces[1].push(pinnedPiece);
        }
      }
    }
    //pinned pieces end

    for (let i = 0; i < pcsInDir.length; i++) {
      if (pcsInDir[i].length < 1) continue;
      let q;

      if (startSquares[j] == whiteKingSquare) q = 0;
      if (startSquares[j] == blackKingSquare) q = 1;

      if (Piece.IsPiece(pcsInDir[i][0], Piece.Queen)) skipKingMoves[q].push([directionOffsets[i], pcsInDir[i][0]]);

      if (Piece.IsPiece(pcsInDir[i][0], Piece.Bishop) && [7, 9].indexOf(abs(directionOffsets[i])) > -1)
        skipKingMoves[q].push([directionOffsets[i], pcsInDir[i][0]]);

      if (Piece.IsPiece(pcsInDir[i][0], Piece.Rook) && [8, 1].indexOf(abs(directionOffsets[i])) > -1)
        skipKingMoves[q].push([directionOffsets[i], pcsInDir[i][0]]);
    }
  }

  return pcsInDir;
}

function generateMoves() {
  //console.time('Time to Generate Moves');

  let pseudoLegalMoves = GeneratePseudoLegalMoves();
  let legalMoves = [];
  let inCheck = 0;
  let mvAtkWhiteKing;
  let mvAtkBlackKing;
  let atkWhiteKingPath = [];
  let atkBlackKingPath = [];

  generateAttacks(pseudoLegalMoves);
  let pcsInDir = generatePinnedPieces();

  //checking if in check
  for (let i = 0; i < blackAttacks.length; i++) {
    if (blackAttacks[i].takeSquare == whiteKingSquare) {
      console.log('white in check');
      mvAtkWhiteKing = blackAttacks[i];
      inCheck = 1;
    }
  }

  for (let i = 0; i < whiteAttacks.length; i++) {
    if (whiteAttacks[i].takeSquare == blackKingSquare) {
      console.log('black in check');
      mvAtkBlackKing = whiteAttacks[i];
      inCheck = 2;
    }
  }

  // getting paths of the sliding pieces attaking the king
  for (let i = 0; i < pcsInDir.length; i++) {
    if (pcsInDir[i].length < 2) continue; // if there is nothing in that direction skip it
    let piece = pcsInDir[i][0];

    if (mvAtkWhiteKing != undefined && Piece.IsColor(piece, 2) && piece.row * 8 + piece.col == mvAtkWhiteKing.startSquare) {
      for (let n = mvAtkWhiteKing.startSquare; n != whiteKingSquare; n += directionOffsets[i] * -1) {
        atkWhiteKingPath.push(n);
      }
    }

    if (mvAtkBlackKing != undefined && Piece.IsColor(piece, 1) && piece.row * 8 + piece.col == mvAtkBlackKing.startSquare) {
      for (let n = mvAtkBlackKing.startSquare; n != blackKingSquare; n += directionOffsets[i] * -1) {
        atkBlackKingPath.push(n);
      }
    }
  }

  //TODO: fix king moves

  for (let i = 0; i < pseudoLegalMoves.length; i++) {
    let move = pseudoLegalMoves[i];
    /*
    //let skip = false;
    
    //skipKingMoves first array is for white second is for black
    //next level is an array where first value is direction and second is the attacking piece
    
    //if (abs(skipKingMoves[1][j][0]) == 8 && move.targetCol == move.startCol) skip = true;
    //if (abs(skipKingMoves[1][j][0]) == 1 && move.targetRow == move.startRow) skip = true;
    //if (abs(skipKingMoves[1][j][0]) == 7 && (move.targetSquare - move.startCol - move.startRow * 8) % 7 == 0) skip = true;
    //if (abs(skipKingMoves[1][j][0]) == 9 && (move.targetSquare - move.startCol - move.startRow * 8) % 9 == 0) skip = true;
    

    //if (skip == true) continue;
    */

    //Adds all moves for king that dont put him in danger
    if (Piece.IsPiece(move.startPiece, Piece.King)) {
      let arrk = [whiteAttacks, blackAttacks];
      for (let k = 0; k < arrk.length; k++) {
        let n = 0;
        for (let j = 0; j < arrk[k].length; j++) {
          if (arrk[k][j].takeSquare != move.targetSquare) {
            n++;
          }
        }

        if (n == arrk[k].length) {
          // Adds all moves to king that dont put him in danger;
          legalMoves.push(move);
        }
      }
    } else if (inCheck >= 1) {
      if (pinnedPieces[1].length > 0 && pinnedPieces[1].includes(move.startPiece)) continue;
      if (atkBlackKingPath.includes(move.takeSquare) && Piece.IsColor(move.startPiece, 2)) legalMoves.push(move);
      if (atkWhiteKingPath.includes(move.takeSquare) && Piece.IsColor(move.startPiece, 1)) legalMoves.push(move);
    }
  }

  // [8, -8, -1, 1, 7, -7, 9, -9]

  for (let i = 0; i < pseudoLegalMoves.length; i++) {
    let move = pseudoLegalMoves[i];
    if (inCheck == 1 && Piece.IsColor(move.startPiece, 1)) continue;
    if (inCheck == 2 && Piece.IsColor(move.startPiece, 2)) continue;
    if (Piece.IsPiece(move.startPiece, Piece.King)) continue;

    for (let j = 0; j < pinnedPieces.length; j++) {
      // if the piece is in the pinned pieces array
      if (move.startPiece == pinnedPieces[1][j] && Piece.IsSlidingPiece(move.startPiece)) {
        if (abs(pinnedPieces[0][j]) == 8 && move.targetCol == move.startCol) legalMoves.push(move);
        if (abs(pinnedPieces[0][j]) == 1 && move.targetRow == move.startRow) legalMoves.push(move);
        if (abs(pinnedPieces[0][j]) == 9 && (move.targetSquare - move.startCol - move.startRow * 8) % 9 == 0) legalMoves.push(move);
        if (abs(pinnedPieces[0][j]) == 7 && (move.targetSquare - move.startCol - move.startRow * 8) % 7 == 0) legalMoves.push(move);
      }
    }

    if (pinnedPieces[1].length > 0 && pinnedPieces[1].includes(move.startPiece)) continue;
    legalMoves.push(move);
  }

  whiteMoves = [];
  blackMoves = [];

  for (let i = 0; i < legalMoves.length; i++) {
    if (Piece.IsColor(legalMoves[i].startPiece, 1)) whiteMoves.push(legalMoves[i]);
    if (Piece.IsColor(legalMoves[i].startPiece, 2)) blackMoves.push(legalMoves[i]);
  }
  //console.timeEnd('Time to Generate Moves');
  return legalMoves;
}

function GeneratePseudoLegalMoves() {
  pseudoLegalMoves = [];

  for (let startSquare = 0; startSquare < 64; startSquare++) {
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

    if (friendlyColor == 1) {
      whiteAttacksExtra.push(new Move(startSquare, targetSquare, targetSquare));
    } else if (friendlyColor == 2) {
      blackAttacksExtra.push(new Move(startSquare, targetSquare, targetSquare));
    }

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
      if (directionOffsets[directionIndex] == -7 || directionOffsets[directionIndex] == -9) {
        whiteAttacksExtra.push(new Move(startSquare, targetSquare, targetSquare));
      }

      if (directionOffsets[directionIndex] == 7 || directionOffsets[directionIndex] == 9) {
        blackAttacksExtra.push(new Move(startSquare, targetSquare, targetSquare));
      }

      //White Pawn Movement
      if (directionOffsets[directionIndex] == -8 && Piece.getPiece(targetPiece) != Piece.Empty) continue;
      if (directionOffsets[directionIndex] == -7 && Piece.getPiece(targetPiece) == Piece.Empty) continue;

      if (directionOffsets[directionIndex] == -9 && Piece.getPiece(targetPiece) == Piece.Empty) continue;

      //Black Pawn Movement
      if (directionOffsets[directionIndex] == 8 && Piece.getPiece(targetPiece) != Piece.Empty) continue;
      if (directionOffsets[directionIndex] == 7 && Piece.getPiece(targetPiece) == Piece.Empty) continue;

      if (directionOffsets[directionIndex] == 9 && Piece.getPiece(targetPiece) == Piece.Empty) continue;

      //Move up two spaces on first move logic
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

      if (friendlyColor == 1) {
        whiteAttacksExtra.push(new Move(startSquare, targetSquare, targetSquare));
      } else if (friendlyColor == 2) {
        blackAttacksExtra.push(new Move(startSquare, targetSquare, targetSquare));
      }

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
