import React, { useState } from 'react'
import { CheckCircle, XCircle, RotateCcw, Trophy, Clock, Volume2 } from 'lucide-react'
import { analysisService } from '../../services/analysis'
import { useVoice } from '../../hooks/useVoice'
import { EmptyState } from '../common/ErrorMessage'

const QuizQuestions = ({ questions, analysisTitle }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const { speak, isPlaying, stop } = useVoice()

  if (!questions || questions.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle className="w-full h-full" />}
        title="No Quiz Questions Available"
        description="No quiz questions were generated for this analysis. Try uploading clearer content or providing more specific prompts."
      />
    )
  }

  const startQuiz = () => {
    setQuizStarted(true)
    setStartTime(Date.now())
    setCurrentQuestion(0)
    setSelectedAnswers({})
    setShowResults(false)
    setEndTime(null)
  }

  const resetQuiz = () => {
    setQuizStarted(false)
    setCurrentQuestion(0)
    setSelectedAnswers({})
    setShowResults(false)
    setStartTime(null)
    setEndTime(null)
  }

  const handleAnswerSelect = (answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }))
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      finishQuiz()
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const finishQuiz = () => {
    setEndTime(Date.now())
    setShowResults(true)
  }

  const readQuestion = () => {
    const question = questions[currentQuestion]
    if (!question) return

    let textToRead = `Question ${currentQuestion + 1}: ${question.question}`

    if (question.type === 'mcq' && question.options) {
      question.options.forEach((option, index) => {
        textToRead += `. Option ${String.fromCharCode(65 + index)}: ${option}`
      })
    }

    if (isPlaying) {
      stop()
    } else {
      speak(textToRead)
    }
  }

  const results = showResults ? analysisService.calculateQuizScore(selectedAnswers, questions) : null
  const currentQ = questions[currentQuestion]

  // Quiz start screen
  if (!quizStarted) {
    return (
      <div className="text-center space-y-6">
        <div>
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-xl font-bold mb-2">Ready to Test Your Knowledge?</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Challenge yourself with {questions.length} questions about "{analysisTitle}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
          {questions.slice(0, 3).map((_, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="font-bold text-lg">{questions.filter(q => q.type === 'mcq').length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Multiple Choice</div>
            </div>
          ))}
        </div>

        <button
          onClick={startQuiz}
          className="btn btn-primary btn-lg"
        >
          Start Quiz
        </button>
      </div>
    )
  }

  // Results screen
  if (showResults && results) {
    const duration = endTime && startTime ? Math.floor((endTime - startTime) / 1000) : 0
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60

    return (
      <div className="space-y-6">
        {/* Results Header */}
        <div className="text-center">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
            results.percentage >= 80 ? 'bg-green-100 dark:bg-green-900/20' :
            results.percentage >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/20' :
            'bg-red-100 dark:bg-red-900/20'
          }`}>
            <Trophy className={`w-10 h-10 ${
              results.percentage >= 80 ? 'text-green-600 dark:text-green-400' :
              results.percentage >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`} />
          </div>

          <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {analysisService.getScoreMessage(results.percentage)}
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${analysisService.getScoreColor(results.percentage)}`}>
                {results.score}/{results.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
            </div>

            <div className="text-center">
              <div className={`text-2xl font-bold ${analysisService.getScoreColor(results.percentage)}`}>
                {results.percentage}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={resetQuiz}
              className="btn btn-secondary flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>

        {/* Question Review */}
        <div className="space-y-4">
          <h4 className="font-semibold">Review Your Answers</h4>
          {questions.map((question, index) => {
            const result = results.results[index]
            const userAnswer = selectedAnswers[index]

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  result.isCorrect
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1">
                    <p className="font-medium mb-2">{question.question}</p>

                    {question.type === 'mcq' && question.options && (
                      <div className="space-y-1 text-sm">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded ${
                              optIndex === question.correct
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                : optIndex === userAnswer
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                  : ''
                            }`}
                          >
                            {String.fromCharCode(65 + optIndex)}. {option}
                            {optIndex === question.correct && ' ✓'}
                            {optIndex === userAnswer && optIndex !== question.correct && ' ✗'}
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === 'short_answer' && (
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="font-medium">Your answer: </span>
                          <span className={result.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                            {userAnswer || 'No answer provided'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Correct answer: </span>
                          <span className="text-green-700 dark:text-green-300">
                            {question.answer}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Quiz interface
  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Question {currentQuestion + 1} of {questions.length}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {startTime && Math.floor((Date.now() - startTime) / 1000)}s
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-black dark:bg-white h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold flex-1">
            {currentQ.question}
          </h3>
          <button
            onClick={readQuestion}
            className={`p-2 rounded-lg transition-colors ${
              isPlaying
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'
            }`}
            aria-label="Read question aloud"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQ.type === 'mcq' && currentQ.options && (
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`
                    w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:scale-[1.01]
                    ${selectedAnswers[currentQuestion] === index
                      ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium
                      ${selectedAnswers[currentQuestion] === index
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                        : 'border-gray-300 dark:border-gray-600'
                      }
                    `}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentQ.type === 'short_answer' && (
            <div>
              <textarea
                value={selectedAnswers[currentQuestion] || ''}
                onChange={(e) => handleAnswerSelect(e.target.value)}
                placeholder="Type your answer here..."
                className="textarea w-full h-24"
                rows={3}
              />
            </div>
          )}

          {currentQ.type === 'true_false' && (
            <div className="grid grid-cols-2 gap-4">
              {['True', 'False'].map((option, index) => (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(index === 0)}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02]
                    ${selectedAnswers[currentQuestion] === (index === 0)
                      ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className={`
                      w-8 h-8 rounded-full border-2 flex items-center justify-center mx-auto mb-2
                      ${selectedAnswers[currentQuestion] === (index === 0)
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                        : 'border-gray-300 dark:border-gray-600'
                      }
                    `}>
                      {index === 0 ? 'T' : 'F'}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
            className="btn btn-secondary disabled:opacity-50"
          >
            Previous
          </button>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {Object.keys(selectedAnswers).length} / {questions.length} answered
          </div>

          <button
            onClick={nextQuestion}
            disabled={selectedAnswers[currentQuestion] === undefined}
            className="btn btn-primary disabled:opacity-50"
          >
            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuizQuestions