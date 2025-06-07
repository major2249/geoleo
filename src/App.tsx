import React, { useState } from 'react';
import { MainMenu } from './components/MainMenu';
import { GameInterface } from './components/GameInterface';
import { GameResults } from './components/GameResults';
import { useGame } from './hooks/useGame';

function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu');
  const { session, loading, error, startNewGame, submitGuess } = useGame();

  const handleStartGame = async (isDailyChallenge = false) => {
    setGameState('playing');
    await startNewGame(isDailyChallenge);
  };

  const handleSubmitGuess = (guess: { lat: number; lng: number }, prediction: 'ai' | 'real') => {
    submitGuess(guess, prediction);
    
    // Check if game is completed after this guess
    if (session && session.currentRound === session.rounds.length - 1) {
      setTimeout(() => setGameState('results'), 3000); // Delay to show results
    }
  };

  const handlePlayAgain = () => {
    setGameState('menu');
  };

  const handleMainMenu = () => {
    setGameState('menu');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-xl">Loading your challenge...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  switch (gameState) {
    case 'menu':
      return <MainMenu onStartGame={handleStartGame} />;
    
    case 'playing':
      if (!session) return <MainMenu onStartGame={handleStartGame} />;
      return <GameInterface session={session} onSubmitGuess={handleSubmitGuess} />;
    
    case 'results':
      if (!session) return <MainMenu onStartGame={handleStartGame} />;
      return (
        <GameResults 
          session={session} 
          onPlayAgain={handlePlayAgain}
          onMainMenu={handleMainMenu}
        />
      );
    
    default:
      return <MainMenu onStartGame={handleStartGame} />;
  }
}

export default App;