import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, Volume2, Check, X } from 'lucide-react'
import { useVoice } from '../../hooks/useVoice'
import { EmptyState } from '../common/ErrorMessage'

const Flashcards = ({ flashcards }) => {
  const [currentCard, setCurrentCard] = useState(0)
  const [showBack, setShowBack] = useState(false)
  const [, setStudyMode] = useState('sequential') // 'sequential' or 'random'
  const [cardOrder, setCardOrder] = useState(() =>
    Array.from({ length: flashcards?.length || 0 }, (_, i) => i)
  )
  const [knownCards, setKnownCards] = useState(new Set())
  const [unknownCards, setUnknownCards] = useState(new Set())
  const { speak, isPlaying, stop } = useVoice()

  if (!flashcards || flashcards.length === 0) {
    return (
      <EmptyState
        icon={<Layers className="w-full h-full" />}
        title="No Flashcards Available"
        description="No flashcards were generated for this analysis. Try uploading content with more key terms or concepts."
      />
    )
  }

  const currentCardIndex = cardOrder[currentCard]
  const card = flashcards[currentCardIndex]

  const nextCard = () => {
    if (currentCard < cardOrder.length - 1) {
      setCurrentCard(prev => prev + 1)
      setShowBack(false)
    }
  }

  const previousCard = () => {
    if (currentCard > 0) {
      setCurrentCard(prev => prev - 1)
      setShowBack(false)
    }
  }

  const flipCard = () => {
    setShowBack(!showBack)
  }

  const shuffleCards = () => {
    const shuffled = [...cardOrder].sort(() => Math.random() - 0.5)
    setCardOrder(shuffled)
    setCurrentCard(0)
    setShowBack(false)
    setStudyMode('random')
  }

  const resetCards = () => {
    setCardOrder(Array.from({ length: flashcards.length }, (_, i) => i))
    setCurrentCard(0)
    setShowBack(false)
    setStudyMode('sequential')
    setKnownCards(new Set())
    setUnknownCards(new Set())
  }

  const markAsKnown = () => {
    setKnownCards(prev => new Set([...prev, currentCardIndex]))
    setUnknownCards(prev => {
      const newSet = new Set(prev)
      newSet.delete(currentCardIndex)
      return newSet
    })
    nextCard()
  }

  const markAsUnknown = () => {
    setUnknownCards(prev => new Set([...prev, currentCardIndex]))
    setKnownCards(prev => {
      const newSet = new Set(prev)
      newSet.delete(currentCardIndex)
      return newSet
    })
    nextCard()
  }

  const readCard = () => {
    const textToRead = showBack
      ? `Answer: ${card.back}`
      : `Question: ${card.front}`

    if (isPlaying) {
      stop()
    } else {
      speak(textToRead)
    }
  }

  const studyUnknownCards = () => {
    if (unknownCards.size === 0) return

    const unknownOrder = Array.from(unknownCards)
    setCardOrder(unknownOrder)
    setCurrentCard(0)
    setShowBack(false)
  }

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (['input', 'textarea'].includes(e.target.tagName.toLowerCase())) return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          flipCard()
          break
        case 'ArrowLeft':
          e.preventDefault()
          previousCard()
          break
        case 'ArrowRight':
          e.preventDefault()
          nextCard()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [flipCard, previousCard, nextCard])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="font-semibold mb-1">Flashcards Study Session</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {flashcards.length} cards • {knownCards.size} known • {unknownCards.size} unknown
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={shuffleCards}
            className="btn btn-secondary text-sm flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Shuffle
          </button>

          <button
            onClick={resetCards}
            className="btn btn-secondary text-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          {unknownCards.size > 0 && (
            <button
              onClick={studyUnknownCards}
              className="btn btn-primary text-sm"
            >
              Study Unknown ({unknownCards.size})
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Card {currentCard + 1} of {cardOrder.length}</span>
          <span>{Math.round(((currentCard + 1) / cardOrder.length) * 100)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-black dark:bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentCard + 1) / cardOrder.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative">
        <div
          className={`
            card p-8 min-h-64 flex items-center justify-center cursor-pointer transform transition-all duration-300 hover:scale-[1.02]
            ${showBack ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''}
          `}
          onClick={flipCard}
        >
          <div className="text-center space-y-4 w-full">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {showBack ? 'Answer' : 'Question'}
            </div>

            <div className="text-xl font-medium leading-relaxed">
              {showBack ? card.back : card.front}
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Click to {showBack ? 'see question' : 'reveal answer'}
            </div>
          </div>

          {/* Voice button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              readCard()
            }}
            className={`
              absolute top-4 right-4 p-2 rounded-lg transition-colors
              ${isPlaying
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'
              }
            `}
            aria-label="Read card aloud"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Card status indicator */}
          {knownCards.has(currentCardIndex) && (
            <div className="absolute top-4 left-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}

          {unknownCards.has(currentCardIndex) && (
            <div className="absolute top-4 left-4 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <X className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Knowledge tracking buttons */}
        {showBack && (
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={markAsUnknown}
              className="btn btn-danger flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Don't Know
            </button>

            <button
              onClick={markAsKnown}
              className="btn btn-success flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              I Know This
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={previousCard}
          disabled={currentCard === 0}
          className="btn btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex gap-2">
          {cardOrder.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentCard(index)
                setShowBack(false)
              }}
              className={`
                w-3 h-3 rounded-full transition-colors
                ${index === currentCard
                  ? 'bg-black dark:bg-white'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }
              `}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextCard}
          disabled={currentCard === cardOrder.length - 1}
          className="btn btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Study Progress */}
      {(knownCards.size > 0 || unknownCards.size > 0) && (
        <div className="card p-4">
          <h4 className="font-medium mb-3">Study Progress</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {knownCards.size}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Known</div>
            </div>

            <div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {unknownCards.size}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Unknown</div>
            </div>

            <div>
              <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                {flashcards.length - knownCards.size - unknownCards.size}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Not Studied</div>
            </div>
          </div>

          {knownCards.size + unknownCards.size === flashcards.length && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <p className="text-green-800 dark:text-green-200 font-medium">
                🎉 Study session complete!
                {unknownCards.size > 0 ? ` Review ${unknownCards.size} cards you marked as unknown.` : ' Great job!'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        <p>
          Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Space</kbd> to flip card,
          <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded ml-1">←→</kbd> to navigate
        </p>
      </div>
    </div>
  )
}

export default Flashcards