'use client'

import { Chess, Square } from 'chess.js'
import { useState, useEffect } from 'react'

interface ChessBoardProps {
  fen: string
  onMove: (move: { from: string; to: string; promotion?: string }) => void
  playerColor: 'white' | 'black' | null
  isPlayerTurn: boolean
}

const pieceSymbols: { [key: string]: string } = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'
}

export function ChessBoard({ fen, onMove, playerColor, isPlayerTurn }: ChessBoardProps) {
  const [chess] = useState(() => new Chess(fen))
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [possibleMoves, setPossibleMoves] = useState<string[]>([])

  useEffect(() => {
    chess.load(fen)
  }, [fen, chess])

  const handleSquareClick = (square: Square) => {
    console.log('Square clicked:', square, 'Player turn:', isPlayerTurn, 'Player color:', playerColor)
    
    if (!isPlayerTurn) {
      console.log('Not player turn, ignoring click')
      return
    }

    if (selectedSquare) {
      console.log('Selected square exists:', selectedSquare)
      // Try to make a move
      const availableMoves = chess.moves({ square: selectedSquare, verbose: true })
      console.log('Available moves from', selectedSquare, ':', availableMoves.map(m => m.to))
      
      const move = availableMoves.find(m => m.to === square)

      if (move) {
        console.log('Valid move found:', move)
        // Check for pawn promotion
        const promotion = move.promotion
        const moveData = {
          from: selectedSquare,
          to: square,
          promotion
        }
        console.log('Calling onMove with:', moveData)
        onMove(moveData)
        setSelectedSquare(null)
        setPossibleMoves([])
      } else {
        console.log('No valid move to', square, 'checking if new selection')
        // Select new square or deselect
        const newMoves = chess.moves({ square, verbose: true }).map(m => m.to)
        if (newMoves.length > 0) {
          console.log('Selecting new square:', square, 'with moves:', newMoves)
          setSelectedSquare(square)
          setPossibleMoves(newMoves)
        } else {
          console.log('Deselecting square')
          setSelectedSquare(null)
          setPossibleMoves([])
        }
      }
    } else {
      console.log('No selected square, attempting selection')
      // Select square
      const moves = chess.moves({ square, verbose: true }).map(m => m.to)
      if (moves.length > 0) {
        console.log('Selecting square:', square, 'with moves:', moves)
        setSelectedSquare(square)
        setPossibleMoves(moves)
      } else {
        console.log('No moves available from square:', square)
      }
    }
  }

  const renderSquare = (square: Square, piece: string | null) => {
    const file = square.charCodeAt(0) - 97 // a=0, b=1, etc.
    const rank = parseInt(square[1]) - 1    // 1=0, 2=1, etc.
    const isLight = (file + rank) % 2 === 0
    const isSelected = selectedSquare === square
    const isPossibleMove = possibleMoves.includes(square)
    const isFlipped = playerColor === 'black'

    return (
      <div
        key={square}
        className={`
          w-16 h-16 flex items-center justify-center text-4xl cursor-pointer relative
          ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
          ${isSelected ? 'ring-4 ring-blue-400' : ''}
          ${isPossibleMove ? 'ring-2 ring-green-400' : ''}
          hover:ring-2 hover:ring-gray-400
        `}
        onClick={() => handleSquareClick(square)}
      >
        {piece && pieceSymbols[piece]}
        {isPossibleMove && !piece && (
          <div className="w-4 h-4 bg-green-400 rounded-full absolute" />
        )}
        {/* Coordinate labels */}
        {!isFlipped && rank === 0 && (
          <div className="absolute bottom-0 right-1 text-xs text-amber-600 font-bold">
            {String.fromCharCode(97 + file)}
          </div>
        )}
        {!isFlipped && file === 0 && (
          <div className="absolute top-1 left-1 text-xs text-amber-600 font-bold">
            {rank + 1}
          </div>
        )}
        {isFlipped && rank === 7 && (
          <div className="absolute bottom-0 right-1 text-xs text-amber-600 font-bold">
            {String.fromCharCode(97 + file)}
          </div>
        )}
        {isFlipped && file === 7 && (
          <div className="absolute top-1 left-1 text-xs text-amber-600 font-bold">
            {rank + 1}
          </div>
        )}
      </div>
    )
  }

  const board = chess.board()
  const isFlipped = playerColor === 'black'

  return (
    <div className="inline-block border-4 border-amber-900 bg-amber-900">
      <div className="grid grid-cols-8">
        {Array.from({ length: 64 }).map((_, index) => {
          const row = Math.floor(index / 8)
          const col = index % 8
          const rank = isFlipped ? row : 7 - row
          const file = isFlipped ? 7 - col : col
          const square = `${String.fromCharCode(97 + file)}${rank + 1}` as Square
          const chessPiece = chess.get(square)
          const piece = chessPiece ? 
            (chessPiece.color === 'w' ? 
              chessPiece.type.toUpperCase() : 
              chessPiece.type) : null

          return renderSquare(square, piece)
        })}
      </div>
    </div>
  )
}
