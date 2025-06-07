import React, { useState, useEffect } from 'react';
import { Play, Trophy, Calendar, Globe, Bot, Star, Users } from 'lucide-react';
import { Leaderboard } from '../types/game';
import { getLeaderboard } from '../services/gameService';

interface MainMenuProps {
  onStartGame: (isDailyChallenge?: boolean) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [leaderboard, setLeaderboard] = useState<Leaderboard>({ daily: [], allTime: [] });
  const [activeTab, setActiveTab] = useState<'daily' | 'allTime'>('daily');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await getLeaderboard();
      setLeaderboard(data);
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Globe className="w-16 h-16 text-blue-400" />
              <Bot className="w-8 h-8 text-purple-400 absolute -top-2 -right-2" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI or Earth?
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Can you distinguish between real locations and AI-generated imagery? 
            Test your skills in this ultimate geography and AI detection challenge!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => onStartGame(false)}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Play className="w-6 h-6" />
              <span>Start Practice Game</span>
            </button>
            
            <button
              onClick={() => onStartGame(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Calendar className="w-6 h-6" />
              <span>Daily Challenge</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* How to Play */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <Trophy className="w-8 h-8 mr-3 text-yellow-400" />
              How to Play
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Analyze the Image</h3>
                  <p className="text-gray-300">Study the location image carefully for visual clues and details.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Make Your Prediction</h3>
                  <p className="text-gray-300">Decide if the image is a real photograph or AI-generated.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Guess the Location</h3>
                  <p className="text-gray-300">Click on the world map to pinpoint where you think this place is located.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Earn Points</h3>
                  <p className="text-gray-300">Score points based on prediction accuracy and location proximity.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-600/20 rounded-lg border border-blue-600/30">
              <h4 className="font-semibold mb-2 text-blue-400">Scoring System</h4>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• Correct AI/Real prediction: +2,500 points</li>
                <li>• Location accuracy: Up to +5,000 points</li>
                <li>• Perfect round: 7,500 points maximum</li>
              </ul>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold flex items-center">
                <Users className="w-8 h-8 mr-3 text-green-400" />
                Leaderboard
              </h2>
              
              <div className="flex bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('daily')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'daily' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setActiveTab('allTime')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'allTime' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {(leaderboard[activeTab].length > 0 ? leaderboard[activeTab] : [
                { userId: '1', userName: 'GeoMaster', score: 32500, date: '2024-01-15' },
                { userId: '2', userName: 'AIDetective', score: 28750, date: '2024-01-15' },
                { userId: '3', userName: 'WorldExplorer', score: 25000, date: '2024-01-15' },
                { userId: '4', userName: 'LocationGuru', score: 22300, date: '2024-01-15' },
                { userId: '5', userName: 'MapWizard', score: 19800, date: '2024-01-15' }
              ]).slice(0, 5).map((entry, index) => (
                <div key={entry.userId} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{entry.userName}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="font-mono font-bold">{entry.score.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              
              {leaderboard[activeTab].length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No scores yet. Be the first to play!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};