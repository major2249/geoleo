import { useState, useEffect, useCallback } from 'react';
import { GameSession, GameRound, GameImage } from '../types/game';
import { generateGameImages } from '../services/gameService';

export const useGame = () => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startNewGame = useCallback(async (isDailyChallenge = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const images = await generateGameImages(isDailyChallenge);
      const rounds: GameRound[] = images.map(image => ({
        id: `round-${Date.now()}-${Math.random()}`,
        image,
        completed: false
      }));

      const newSession: GameSession = {
        id: `session-${Date.now()}`,
        rounds,
        currentRound: 0,
        totalScore: 0,
        startTime: Date.now(),
        isCompleted: false,
        isDailyChallenge
      };

      setSession(newSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitGuess = useCallback((guess: { lat: number; lng: number }, prediction: 'ai' | 'real') => {
    if (!session || session.isCompleted) return;

    const currentRound = session.rounds[session.currentRound];
    if (!currentRound || currentRound.completed) return;

    // Calculate distance if real image
    let distance = 0;
    if (!currentRound.image.isAI && currentRound.image.location) {
      distance = calculateDistance(
        guess.lat,
        guess.lng,
        currentRound.image.location.lat,
        currentRound.image.location.lng
      );
    }

    // Calculate score
    const distanceScore = currentRound.image.isAI ? 0 : Math.max(0, 5000 - distance);
    const predictionScore = prediction === (currentRound.image.isAI ? 'ai' : 'real') ? 2500 : 0;
    const totalRoundScore = Math.round(distanceScore + predictionScore);

    const updatedRound: GameRound = {
      ...currentRound,
      userGuess: guess,
      userPrediction: prediction,
      score: totalRoundScore,
      distance,
      completed: true
    };

    const updatedRounds = [...session.rounds];
    updatedRounds[session.currentRound] = updatedRound;

    const newTotalScore = session.totalScore + totalRoundScore;
    const isLastRound = session.currentRound === session.rounds.length - 1;

    setSession({
      ...session,
      rounds: updatedRounds,
      currentRound: isLastRound ? session.currentRound : session.currentRound + 1,
      totalScore: newTotalScore,
      isCompleted: isLastRound
    });
  }, [session]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return {
    session,
    loading,
    error,
    startNewGame,
    submitGuess
  };
};