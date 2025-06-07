import React, { useState, useEffect } from 'react';
import { GameMap } from './GameMap';
import { GameImage } from './GameImage';
import { Timer } from './Timer';
import { Bot, Globe, MapPin, Star, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { GameSession } from '../types/game';
import clsx from 'clsx';

interface GameInterfaceProps {
  session: GameSession;
  onSubmitGuess: (guess: { lat: number; lng: number }, prediction: 'ai' | 'real') => void;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({ session, onSubmitGuess }) => {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [prediction, setPrediction] = useState<'ai' | 'real' | undefined>();
  const [showResults, setShowResults] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const currentRound = session.rounds[session.currentRound];
  const isLastRound = session.currentRound === session.rounds.length - 1;

  useEffect(() => {
    // Reset state for new round
    setSelectedLocation(undefined);
    setPrediction(undefined);
    setShowResults(false);
    setTimeUp(false);
    setAutoSubmitted(false);
  }, [session.currentRound]);

  useEffect(() => {
    if (currentRound?.completed && !showResults) {
      setShowResults(true);
      // Auto-advance to next round after showing results
      if (!isLastRound) {
        setTimeout(() => {
          // Trigger next round by reloading (this will advance currentRound)
          window.location.reload();
        }, 4000);
      }
    }
  }, [currentRound?.completed, showResults, isLastRound]);

  const handleSubmit = () => {
    if (!selectedLocation || !prediction || showResults) return;
    onSubmitGuess(selectedLocation, prediction);
  };

  // Auto-submit when both location and prediction are selected
  useEffect(() => {
    if (selectedLocation && prediction && !showResults && !timeUp && !autoSubmitted) {
      setAutoSubmitted(true);
      setTimeout(() => {
        handleSubmit();
      }, 500); // Small delay for better UX
    }
  }, [selectedLocation, prediction, showResults, timeUp, autoSubmitted]);

  const handleTimeUp = () => {
    setTimeUp(true);
    if (selectedLocation && prediction) {
      onSubmitGuess(selectedLocation, prediction);
    } else {
      // Auto-submit with random location and prediction
      const randomLat = (Math.random() - 0.5) * 180;
      const randomLng = (Math.random() - 0.5) * 360;
      const randomPrediction = Math.random() > 0.5 ? 'ai' : 'real';
      onSubmitGuess({ lat: randomLat, lng: randomLng }, randomPrediction);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 6000) return 'text-green-400';
    if (score >= 4000) return 'text-yellow-400';
    if (score >= 2000) return 'text-orange-400';
    return 'text-red-400';
  };

  const isPredictionCorrect = () => {
    if (!currentRound || !currentRound.userPrediction) return false;
    return currentRound.userPrediction === (currentRound.image.isAI ? 'ai' : 'real');
  };

  if (!currentRound) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-blue-400">AI or Earth?</h1>
              <div className="flex items-center space-x-4 text-sm">
                <span className="bg-gray-700 px-3 py-1 rounded-full">
                  Round {session.currentRound + 1}/5
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="font-mono">{session.totalScore.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {!showResults && !timeUp && (
              <Timer 
                duration={60} 
                onTimeUp={handleTimeUp}
                isPaused={showResults}
              />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* Image Panel */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-blue-400" />
              Analyze This Location
            </h2>
            
            <GameImage
              imageUrl={currentRound.image.url}
              className="h-80 mb-6"
            />

            {/* Prediction Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Is this image real or AI-generated?</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPrediction('real')}
                  disabled={showResults || timeUp}
                  className={clsx(
                    'flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition-all relative',
                    prediction === 'real'
                      ? 'border-green-400 bg-green-400/20 text-green-400'
                      : 'border-gray-600 hover:border-green-400 hover:bg-green-400/10',
                    (showResults || timeUp) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">Real Photo</span>
                  {showResults && !currentRound.image.isAI && (
                    <CheckCircle className="w-5 h-5 text-green-400 absolute -top-2 -right-2" />
                  )}
                </button>
                
                <button
                  onClick={() => setPrediction('ai')}
                  disabled={showResults || timeUp}
                  className={clsx(
                    'flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition-all relative',
                    prediction === 'ai'
                      ? 'border-purple-400 bg-purple-400/20 text-purple-400'
                      : 'border-gray-600 hover:border-purple-400 hover:bg-purple-400/10',
                    (showResults || timeUp) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Bot className="w-5 h-5" />
                  <span className="font-medium">AI Generated</span>
                  {showResults && currentRound.image.isAI && (
                    <CheckCircle className="w-5 h-5 text-green-400 absolute -top-2 -right-2" />
                  )}
                </button>
              </div>
            </div>

            {/* Instant Feedback */}
            {selectedLocation && prediction && !showResults && (
              <div className="mt-4 p-3 bg-blue-600/20 rounded-lg border border-blue-600/30">
                <div className="flex items-center space-x-2 text-blue-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Ready to submit! Processing your guess...</span>
                </div>
              </div>
            )}

            {/* Results */}
            {showResults && (
              <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold flex items-center">
                    {isPredictionCorrect() ? (
                      <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 mr-2" />
                    )}
                    Round Results
                  </span>
                  <span className={`text-xl font-bold ${getScoreColor(currentRound.score || 0)}`}>
                    +{(currentRound.score || 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Image is:</span>
                    <span className={currentRound.image.isAI ? 'text-purple-400' : 'text-green-400'}>
                      {currentRound.image.isAI ? 'AI Generated' : 'Real Photo'}
                      {currentRound.image.isAI && currentRound.image.prompt && (
                        <div className="text-xs text-gray-400 mt-1">"{currentRound.image.prompt}"</div>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Your prediction:</span>
                    <span className={isPredictionCorrect() ? 'text-green-400' : 'text-red-400'}>
                      {currentRound.userPrediction === 'ai' ? 'AI Generated' : 'Real Photo'}
                      {isPredictionCorrect() ? ' ✓' : ' ✗'}
                    </span>
                  </div>
                  
                  {!currentRound.image.isAI && currentRound.distance !== undefined && (
                    <div className="flex justify-between">
                      <span>Distance:</span>
                      <span>{Math.round(currentRound.distance)} km from {currentRound.image.location?.address}</span>
                    </div>
                  )}
                </div>

                {!isLastRound && (
                  <div className="mt-3 text-center text-blue-400 text-sm">
                    Next round starting in 4 seconds...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Map Panel */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                Where is this?
              </h2>
              
              {selectedLocation && prediction && !showResults && (
                <div className="text-green-400 text-sm font-medium">
                  Auto-submitting...
                </div>
              )}
            </div>

            <div className="h-96 rounded-lg overflow-hidden">
              <GameMap
                onLocationSelect={setSelectedLocation}
                selectedLocation={selectedLocation}
                actualLocation={showResults && !currentRound.image.isAI ? currentRound.image.location : undefined}
                showActual={showResults && !currentRound.image.isAI}
                disabled={showResults || timeUp}
              />
            </div>

            {selectedLocation && (
              <div className="mt-4 p-3 bg-gray-700/50 rounded-lg text-sm">
                <div className="flex items-center justify-between">
                  <span>Selected coordinates:</span>
                  <span className="font-mono text-blue-400">
                    {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Final Results Button */}
        {showResults && isLastRound && (
          <div className="text-center mt-6">
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-medium text-lg transition-colors flex items-center space-x-2 mx-auto"
            >
              <Trophy className="w-5 h-5" />
              <span>View Final Results</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};