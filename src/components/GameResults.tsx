import React from 'react';
import { GameSession } from '../types/game';
import { Trophy, Star, Target, Bot, Globe, MapPin } from 'lucide-react';

interface GameResultsProps {
  session: GameSession;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const GameResults: React.FC<GameResultsProps> = ({ session, onPlayAgain, onMainMenu }) => {
  const getGrade = (score: number) => {
    if (score >= 30000) return { grade: 'S', color: 'text-yellow-400', bg: 'bg-yellow-400/20' };
    if (score >= 25000) return { grade: 'A+', color: 'text-green-400', bg: 'bg-green-400/20' };
    if (score >= 20000) return { grade: 'A', color: 'text-green-400', bg: 'bg-green-400/20' };
    if (score >= 15000) return { grade: 'B', color: 'text-blue-400', bg: 'bg-blue-400/20' };
    if (score >= 10000) return { grade: 'C', color: 'text-orange-400', bg: 'bg-orange-400/20' };
    return { grade: 'D', color: 'text-red-400', bg: 'bg-red-400/20' };
  };

  const grade = getGrade(session.totalScore);
  const correctPredictions = session.rounds.filter(round => 
    round.userPrediction === (round.image.isAI ? 'ai' : 'real')
  ).length;

  const averageDistance = session.rounds
    .filter(round => !round.image.isAI && round.distance !== undefined)
    .reduce((sum, round) => sum + (round.distance || 0), 0) / 
    session.rounds.filter(round => !round.image.isAI).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-16 h-16 text-yellow-400" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Game Complete!</h1>
          <p className="text-gray-400">
            {session.isDailyChallenge ? 'Daily Challenge' : 'Practice Mode'}
          </p>
        </div>

        {/* Score Summary */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 mb-8">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${grade.bg} border-4 border-current ${grade.color} mb-4`}>
              <span className="text-3xl font-bold">{grade.grade}</span>
            </div>
            
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className="w-8 h-8 text-yellow-400" />
              <span className="text-5xl font-bold text-white">
                {session.totalScore.toLocaleString()}
              </span>
            </div>
            
            <p className="text-gray-400 text-lg">Total Score</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400">{correctPredictions}/5</div>
              <div className="text-gray-400">Correct Predictions</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <MapPin className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-400">
                {isNaN(averageDistance) ? 'N/A' : `${Math.round(averageDistance)} km`}
              </div>
              <div className="text-gray-400">Avg Distance</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-yellow-400">
                {Math.round(session.totalScore / 5)}
              </div>
              <div className="text-gray-400">Avg Score/Round</div>
            </div>
          </div>
        </div>

        {/* Round Breakdown */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Round Breakdown</h2>
          
          <div className="space-y-4">
            {session.rounds.map((round, index) => (
              <div key={round.id} className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">Round {index + 1}</span>
                  <span className="text-xl font-bold text-blue-400">
                    +{(round.score || 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    {round.image.isAI ? <Bot className="w-4 h-4 text-purple-400" /> : <Globe className="w-4 h-4 text-green-400" />}
                    <span>Actual: {round.image.isAI ? 'AI Generated' : 'Real Photo'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {round.userPrediction === 'ai' ? <Bot className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    <span>
                      Your guess: {round.userPrediction === 'ai' ? 'AI Generated' : 'Real Photo'}
                      {round.userPrediction === (round.image.isAI ? 'ai' : 'real') && (
                        <span className="text-green-400 ml-1">✓</span>
                      )}
                    </span>
                  </div>
                  
                  {!round.image.isAI && round.distance !== undefined && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-orange-400" />
                      <span>Distance: {Math.round(round.distance)} km</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onPlayAgain}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-medium text-lg transition-colors"
          >
            Play Again
          </button>
          
          <button
            onClick={onMainMenu}
            className="bg-gray-600 hover:bg-gray-700 px-8 py-3 rounded-lg font-medium text-lg transition-colors"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};