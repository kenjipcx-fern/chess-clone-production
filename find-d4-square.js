const { Chess } = require('chess.js');

// Load the current position
const currentFen = 'rnbqkbnr/p1ppppp1/1p5p/8/3P4/1P6/P1P1PPPP/RNBQKBNR w KQkq - 0 3';
const chess = new Chess(currentFen);

console.log('🎯 FINDING THE D4 WHITE PAWN LOCATION');
console.log('=====================================');

// Get the board array
const board = chess.board();

console.log('📋 BOARD LAYOUT FROM CHESS.JS:');
console.log('(rank 8 = index 0, rank 1 = index 7)');

for (let rank = 0; rank < 8; rank++) {
  const rankNum = 8 - rank;
  let row = `Rank ${rankNum}: `;
  
  for (let file = 0; file < 8; file++) {
    const piece = board[rank][file];
    if (piece) {
      const pieceStr = `${piece.color}${piece.type}`;
      row += `${pieceStr.padEnd(3)} `;
    } else {
      row += '--- ';
    }
  }
  console.log(row);
}

console.log('\n🎯 FINDING WHITE PIECES:');
for (let rank = 0; rank < 8; rank++) {
  for (let file = 0; file < 8; file++) {
    const piece = board[rank][file];
    if (piece && piece.color === 'w') {
      const square = String.fromCharCode(97 + file) + (8 - rank);
      console.log(`White ${piece.type} on ${square} (board[${rank}][${file}])`);
    }
  }
}

console.log('\n⚡ LEGAL MOVES FROM WHITE PIECES:');
const moves = chess.moves({ verbose: true });
const whitePawnMoves = moves.filter(m => m.piece === 'p');
console.log('White pawn moves:');
whitePawnMoves.forEach(move => {
  console.log(`  ${move.from} → ${move.to}`);
});

console.log('\n🎮 FOR PLAYER2 (WHITE) TO CLICK:');
console.log('The d4 white pawn should be clickable at coordinates: d4');
console.log('Visual check: d4 should have a white pawn piece');

// Check what's on d4
const d4Piece = chess.get('d4');
if (d4Piece) {
  console.log(`✅ Confirmed: ${d4Piece.color} ${d4Piece.type} is on d4`);
} else {
  console.log('❌ ERROR: No piece found on d4');
}
