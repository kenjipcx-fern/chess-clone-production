// Test board orientation for different players
const Chess = require('chess.js').Chess;

const chess = new Chess();
console.log('Starting FEN:', chess.fen());
console.log('Initial turn:', chess.turn()); // Should be 'w' for white

console.log('\nWhite starting pieces (should be on rank 1-2):');
const board = chess.board();
for (let rank = 0; rank < 8; rank++) {
  const rankNum = rank + 1;
  let row = `Rank ${rankNum}: `;
  for (let file = 0; file < 8; file++) {
    const piece = board[7-rank][file]; // chess.board() is [rank][file] where rank 0 = rank 1
    if (piece) {
      row += `${piece.color}${piece.type} `;
    } else {
      row += '-- ';
    }
  }
  console.log(row);
}

// Test what squares white pawns are on
const moves = chess.moves({ verbose: true });
const pawnMoves = moves.filter(m => m.piece === 'p');
console.log('\nWhite pawn starting squares:');
pawnMoves.forEach(move => {
  console.log(`From: ${move.from} To: ${move.to}`);
});
