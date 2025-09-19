'use client'

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ChessBoard } from "@/components/chess-board"

interface Game {
  id: string
  whitePlayerId: string | null
  blackPlayerId: string | null
  status: string
  currentFen: string
  timeControl: string
  whitePlayer?: { name: string; rating: number }
  blackPlayer?: { name: string; rating: number }
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [games, setGames] = useState<Game[]>([])
  const [currentGame, setCurrentGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(false)
  const [moveHistory, setMoveHistory] = useState<any[]>([])
  const [gameStatus, setGameStatus] = useState<string>('')

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchGames()
    }
  }, [session])

  // Auto-refresh current game every 5 seconds
  useEffect(() => {
    if (currentGame) {
      const interval = setInterval(() => {
        fetchGames()
        if (currentGame.id) {
          fetchMoveHistory(currentGame.id)
        }
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [currentGame])

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games', {
        credentials: 'include'
      })
      const data = await response.json()
      const allGames = data.games || []
      setGames(allGames)
      
      // Check if user is currently in a game and set as current
      if (session?.user?.id && !currentGame) {
        const userGame = allGames.find((game: Game) => 
          game.status === 'in_progress' && (
            game.whitePlayerId === session.user.id || 
            game.blackPlayerId === session.user.id
          )
        )
        if (userGame) {
          setCurrentGame(userGame)
          fetchMoveHistory(userGame.id)
        }
      }
    } catch (error) {
      console.error('Error fetching games:', error)
    }
  }

  const fetchMoveHistory = async (gameId: string) => {
    try {
      const response = await fetch(`/api/games/${gameId}/moves`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setMoveHistory(data.moves || [])
      }
    } catch (error) {
      console.error('Error fetching move history:', error)
    }
  }

  const createGame = async (timeControl: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ timeControl })
      })
      const data = await response.json()
      if (data.game) {
        setCurrentGame(data.game)
        await fetchGames()
      }
    } catch (error) {
      console.error('Error creating game:', error)
    } finally {
      setLoading(false)
    }
  }

  const joinGame = async (gameId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
        credentials: 'include'
      })
      const data = await response.json()
      if (data.game) {
        setCurrentGame(data.game)
        await fetchGames()
      }
    } catch (error) {
      console.error('Error joining game:', error)
    } finally {
      setLoading(false)
    }
  }

  const makeMove = async (move: { from: string; to: string; promotion?: string }) => {
    if (!currentGame) return

    console.log('Attempting to make move:', move)
    console.log('Current game ID:', currentGame.id)

    try {
      const response = await fetch(`/api/games/${currentGame.id}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(move)
      })
      
      console.log('Move response status:', response.status)
      const data = await response.json()
      console.log('Move response data:', data)
      
      if (data.game) {
        setCurrentGame(data.game)
        fetchMoveHistory(currentGame.id) // Refresh move history
        console.log('Updated game state:', data.game)
      } else if (data.error) {
        console.error('Move error from server:', data.error)
        alert('Error making move: ' + data.error)
      }
    } catch (error) {
      console.error('Error making move:', error)
      alert('Network error making move: ' + error.message)
    }
  }

  const getPlayerColor = (game: Game): 'white' | 'black' | null => {
    if (game.whitePlayerId === session?.user?.id) return 'white'
    if (game.blackPlayerId === session?.user?.id) return 'black'
    return null
  }

  const isPlayerTurn = (game: Game): boolean => {
    const playerColor = getPlayerColor(game)
    if (!playerColor) return false
    
    const fen = game.currentFen
    const turn = fen.split(' ')[1]
    return (turn === 'w' && playerColor === 'white') || (turn === 'b' && playerColor === 'black')
  }

  const getGameStatus = (game: Game): string => {
    try {
      const { Chess } = require('chess.js')
      const chess = new Chess(game.currentFen)
      
      if (chess.isCheckmate()) {
        const winner = chess.turn() === 'w' ? 'Black' : 'White'
        return `Checkmate! ${winner} wins`
      } else if (chess.isCheck()) {
        const inCheck = chess.turn() === 'w' ? 'White' : 'Black'
        return `${inCheck} is in check`
      } else if (chess.isStalemate()) {
        return 'Stalemate - Draw'
      } else if (chess.isDraw()) {
        return 'Draw'
      }
      
      return ''
    } catch {
      return ''
    }
  }

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Chess Platform</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Welcome, {session.user?.name} (Rating: {session.user?.rating || 1200})
              </span>
              <button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentGame ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex justify-center">
              <div className="text-center">
                <div className="mb-4 p-4 bg-white rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-2">Game in Progress</h2>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div>
                      <span className="font-medium">White:</span> {currentGame.whitePlayer?.name || 'Waiting...'}
                      {currentGame.whitePlayer && ` (${currentGame.whitePlayer.rating})`}
                    </div>
                    <div className="text-center">
                      Status: <span className="font-medium">{currentGame.status}</span>
                    </div>
                    <div>
                      <span className="font-medium">Black:</span> {currentGame.blackPlayer?.name || 'Waiting...'}
                      {currentGame.blackPlayer && ` (${currentGame.blackPlayer.rating})`}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm">
                      {isPlayerTurn(currentGame) ? "Your turn" : "Opponent's turn"}
                    </span>
                    {getGameStatus(currentGame) && (
                      <div className="mt-1">
                        <span className="text-sm font-bold text-red-600">
                          {getGameStatus(currentGame)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <ChessBoard
                  fen={currentGame.currentFen}
                  onMove={makeMove}
                  playerColor={getPlayerColor(currentGame)}
                  isPlayerTurn={isPlayerTurn(currentGame)}
                />
                
                <div className="mt-4">
                  <button
                    onClick={() => setCurrentGame(null)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Back to Game List
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Game Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Time Control:</span> {currentGame.timeControl}</div>
                  <div><span className="font-medium">Status:</span> {currentGame.status}</div>
                  <div><span className="font-medium">Your Color:</span> {getPlayerColor(currentGame) || 'Spectator'}</div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Move History</h3>
                <div className="max-h-64 overflow-y-auto">
                  {moveHistory.length === 0 ? (
                    <p className="text-gray-500 text-sm">No moves yet</p>
                  ) : (
                    <div className="space-y-1">
                      {moveHistory.map((move, index) => (
                        <div key={move.id} className="text-sm flex justify-between">
                          <span className="font-mono">
                            {Math.ceil((index + 1) / 2)}. {move.san}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {move.from}→{move.to}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Create New Game</h2>
              <div className="space-y-3">
                <button
                  onClick={() => createGame("5+3")}
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-md disabled:opacity-50"
                >
                  Blitz (5+3 minutes)
                </button>
                <button
                  onClick={() => createGame("10+5")}
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-md disabled:opacity-50"
                >
                  Rapid (10+5 minutes)
                </button>
                <button
                  onClick={() => createGame("30+30")}
                  disabled={loading}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-md disabled:opacity-50"
                >
                  Classical (30+30 minutes)
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Join Game</h2>
              <div className="space-y-3">
                {games.filter(game => game.status === 'waiting').length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No games available to join</p>
                ) : (
                  games.filter(game => game.status === 'waiting').map(game => (
                    <div key={game.id} className="border border-gray-200 rounded-md p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            {game.whitePlayer?.name} (Rating: {game.whitePlayer?.rating})
                          </div>
                          <div className="text-sm text-gray-600">
                            Time: {game.timeControl}
                          </div>
                        </div>
                        <button
                          onClick={() => joinGame(game.id)}
                          disabled={loading}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                        >
                          Join as Black
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
