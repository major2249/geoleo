import { GameImage } from '../types/game';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const generateGameImages = async (isDailyChallenge = false): Promise<GameImage[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/game/images${isDailyChallenge ? '?daily=true' : ''}`);
    if (!response.ok) {
      throw new Error('Failed to fetch game images');
    }
    return await response.json();
  } catch (error) {
    console.warn('API unavailable, using fallback images:', error);
    // Enhanced fallback with more diverse images
    return generateEnhancedMockImages();
  }
};

const generateEnhancedMockImages = (): GameImage[] => {
  const realImages: GameImage[] = [
    {
      id: '1',
      url: 'https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      isAI: false,
      location: { lat: 48.8566, lng: 2.3522, address: 'Paris, France' }
    },
    {
      id: '2',
      url: 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      isAI: false,
      location: { lat: 35.6762, lng: 139.6503, address: 'Tokyo, Japan' }
    },
    {
      id: '3',
      url: 'https://images.pexels.com/photos/1738986/pexels-photo-1738986.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      isAI: false,
      location: { lat: 40.7589, lng: -73.9851, address: 'New York, USA' }
    },
    {
      id: '4',
      url: 'https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      isAI: false,
      location: { lat: 51.5074, lng: -0.1278, address: 'London, UK' }
    },
    {
      id: '5',
      url: 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      isAI: false,
      location: { lat: -33.8688, lng: 151.2093, address: 'Sydney, Australia' }
    },
    {
      id: '6',
      url: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      isAI: false,
      location: { lat: 36.1069, lng: -112.1129, address: 'Grand Canyon, USA' }
    },
    {
      id: '7',
      url: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      isAI: false,
      location: { lat: 46.5197, lng: 7.4815, address: 'Swiss Alps, Switzerland' }
    }
  ];

  const aiImages: GameImage[] = [
    {
      id: '8',
      url: 'https://images.pexels.com/photos/460741/pexels-photo-460741.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      isAI: true,
      prompt: 'A futuristic cyberpunk city with neon lights and flying cars'
    },
    {
      id: '9',
      url: 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      isAI: true,
      prompt: 'An underwater city with coral buildings and bioluminescent streets'
    },
    {
      id: '10',
      url: 'https://images.pexels.com/photos/1484759/pexels-photo-1484759.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      isAI: true,
      prompt: 'A floating island city in the clouds with waterfalls'
    },
    {
      id: '11',
      url: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      isAI: true,
      prompt: 'A desert oasis with crystal formations and purple sand'
    },
    {
      id: '12',
      url: 'https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      isAI: true,
      prompt: 'A magical forest with glowing trees and floating rocks'
    },
    {
      id: '13',
      url: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      isAI: true,
      prompt: 'An alien planet with multiple moons and purple vegetation'
    }
  ];

  // Select 3 real and 2 AI images randomly
  const selectedReal = realImages.sort(() => Math.random() - 0.5).slice(0, 3);
  const selectedAI = aiImages.sort(() => Math.random() - 0.5).slice(0, 2);
  
  return [...selectedReal, ...selectedAI].sort(() => Math.random() - 0.5);
};

export const submitScore = async (score: number, isDailyChallenge = false) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/game/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ score, isDailyChallenge }),
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to submit score:', error);
  }
};

export const getLeaderboard = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/game/leaderboard`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return { daily: [], allTime: [] };
  }
};