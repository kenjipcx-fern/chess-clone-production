// Debug chess board coordinate mapping
console.log('Chess board coordinate mapping test:')
console.log('Expected: a1-h1 (bottom row for white), a8-h8 (top row)')

function testCoordinateMapping(isFlipped = false) {
  console.log(`\n=== Board orientation: ${isFlipped ? 'BLACK (flipped)' : 'WHITE (normal)'} ===`)
  
  for (let index = 0; index < 64; index++) {
    const row = Math.floor(index / 8)
    const col = index % 8
    const rank = isFlipped ? row : 7 - row
    const file = isFlipped ? 7 - col : col
    const square = `${String.fromCharCode(97 + file)}${rank + 1}`
    
    if (index % 8 === 0) console.log() // New row
    process.stdout.write(`${square.padStart(3)} `)
  }
  console.log()
}

// Test for white player (normal orientation)
testCoordinateMapping(false)

// Test for black player (flipped orientation)
testCoordinateMapping(true)

console.log('\nExpected layout for WHITE player:')
console.log('a8  b8  c8  d8  e8  f8  g8  h8')
console.log('a7  b7  c7  d7  e7  f7  g7  h7')
console.log('...')
console.log('a2  b2  c2  d2  e2  f2  g2  h2')
console.log('a1  b1  c1  d1  e1  f1  g1  h1')
