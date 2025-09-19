const { db } = require('./src/db/index.ts')
const { games } = require('./src/db/schema.ts')
const { eq, desc } = require('drizzle-orm')

async function debugGame() {
  try {
    const currentGames = await db
      .select()
      .from(games)
      .where(eq(games.status, 'in_progress'))
      .orderBy(desc(games.createdAt))
      .limit(1)
    
    if (currentGames.length > 0) {
      const game = currentGames[0]
      console.log('Current game FEN:', game.currentFen)
      console.log('White player ID:', game.whitePlayerId)
      console.log('Black player ID:', game.blackPlayerId)
      console.log('Status:', game.status)
    } else {
      console.log('No active games found')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

debugGame()
