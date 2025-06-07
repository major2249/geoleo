import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mock data - in production, this would come from a database
let leaderboard = {
  daily: [],
  allTime: []
};

// Daily challenge images - these would be generated/selected once per day
let dailyChallengeImages = null;
let dailyChallengeDate = null;

// Expanded mock real locations with more diverse images
const mockRealLocations = [
  // European Cities
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: false,
    location: { lat: 48.8566, lng: 2.3522, address: 'Paris, France' }
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: false,
    location: { lat: 51.5074, lng: -0.1278, address: 'London, UK' }
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: false,
    location: { lat: 41.9028, lng: 12.4964, address: 'Rome, Italy' }
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: false,
    location: { lat: -33.8688, lng: 151.2093, address: 'Sydney, Australia' }
  },
  
  // Asian Cities
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: false,
    location: { lat: 35.6762, lng: 139.6503, address: 'Tokyo, Japan' }
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/2412603/pexels-photo-2412603.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: false,
    location: { lat: 22.3193, lng: 114.1694, address: 'Hong Kong' }
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: false,
    location: { lat: 1.3521, lng: 103.8198, address: 'Singapore' }
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: false,
    location: { lat: 28.6139, lng: 77.2090, address: 'New Delhi, India' }
  },
  
  // American Cities
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1738986/pexels-photo-1738986.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: false,
    location: { lat: 40.7589, lng: -73.9851, address: 'New York, USA' }
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1680247/pexels-photo-1680247.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: false,
    location: { lat: 34.0522, lng: -118.2437, address: 'Los Angeles, USA' }
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1519088/pexels-photo-1519088.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: false,
    location: { lat: 45.5017, lng: -73.5673, address: 'Montreal, Canada' }
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1804177/pexels-photo-1804177.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: false,
    location: { lat: -22.9068, lng: -43.1729, address: 'Rio de Janeiro, Brazil' }
  },
  
  // Natural Landmarks
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: false,
    location: { lat: 36.1069, lng: -112.1129, address: 'Grand Canyon, USA' }
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: false,
    location: { lat: 46.5197, lng: 7.4815, address: 'Swiss Alps, Switzerland' }
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: false,
    location: { lat: 64.0685, lng: -21.9422, address: 'Reykjavik, Iceland' }
  },
  
  // African and Middle Eastern
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: false,
    location: { lat: 29.9792, lng: 31.1342, address: 'Cairo, Egypt' }
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: false,
    location: { lat: -33.9249, lng: 18.4241, address: 'Cape Town, South Africa' }
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1534560/pexels-photo-1534560.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: false,
    location: { lat: 25.2048, lng: 55.2708, address: 'Dubai, UAE' }
  }
];

// Expanded AI-generated style images (using real photos as placeholders)
const mockAIImages = [
  // Futuristic Cities
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/460741/pexels-photo-460741.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: true,
    prompt: 'A futuristic cyberpunk city with neon lights and flying cars at night'
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: true,
    prompt: 'An underwater city with coral buildings and bioluminescent streets'
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1484759/pexels-photo-1484759.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: true,
    prompt: 'A floating island city in the clouds with waterfalls'
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: true,
    prompt: 'A desert oasis with crystal formations and purple sand'
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: true,
    prompt: 'A magical forest with glowing trees and floating rocks'
  },
  
  // Fantasy Landscapes
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: true,
    prompt: 'An alien planet with multiple moons and purple vegetation'
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: true,
    prompt: 'A steampunk city with brass towers and steam-powered vehicles'
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: true,
    prompt: 'A post-apocalyptic wasteland with overgrown ruins'
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: true,
    prompt: 'A medieval fantasy castle floating in space'
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1366630/pexels-photo-1366630.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: true,
    prompt: 'An ice palace with aurora borealis and crystal spires'
  },
  
  // Surreal Environments
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: true,
    prompt: 'A city built inside a giant tree with spiral walkways'
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: true,
    prompt: 'A volcanic landscape with lava rivers and obsidian structures'
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: true,
    prompt: 'A mirror dimension city with inverted gravity'
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: true,
    prompt: 'A clockwork mechanical landscape with gears and springs'
  },
  {
    id: uuidv4(),
    url: 'https://images.pexels.com/photos/1366630/pexels-photo-1366630.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isAI: true,
    prompt: 'A candy-colored dreamscape with impossible architecture'
  }
];

// Helper function to generate random images for a game
const generateGameImages = (isDailyChallenge = false) => {
  if (isDailyChallenge) {
    const today = new Date().toDateString();
    
    // Generate daily challenge images if not already generated for today
    if (!dailyChallengeImages || dailyChallengeDate !== today) {
      const realImages = [...mockRealLocations].sort(() => Math.random() - 0.5).slice(0, 3);
      const aiImages = [...mockAIImages].sort(() => Math.random() - 0.5).slice(0, 2);
      
      dailyChallengeImages = [...realImages, ...aiImages].sort(() => Math.random() - 0.5);
      dailyChallengeDate = today;
    }
    
    return dailyChallengeImages;
  }
  
  // Regular game - random selection from expanded pool
  const realImages = [...mockRealLocations].sort(() => Math.random() - 0.5).slice(0, 3);
  const aiImages = [...mockAIImages].sort(() => Math.random() - 0.5).slice(0, 2);
  
  return [...realImages, ...aiImages].sort(() => Math.random() - 0.5);
};

// Routes
app.get('/api/game/images', (req, res) => {
  try {
    const isDailyChallenge = req.query.daily === 'true';
    const images = generateGameImages(isDailyChallenge);
    res.json(images);
  } catch (error) {
    console.error('Error generating game images:', error);
    res.status(500).json({ error: 'Failed to generate game images' });
  }
});

app.post('/api/game/score', (req, res) => {
  try {
    const { score, isDailyChallenge } = req.body;
    
    const entry = {
      userId: uuidv4(),
      userName: `Player${Math.floor(Math.random() * 10000)}`,
      score,
      date: new Date().toISOString()
    };
    
    if (isDailyChallenge) {
      leaderboard.daily.push(entry);
      leaderboard.daily.sort((a, b) => b.score - a.score);
      leaderboard.daily = leaderboard.daily.slice(0, 10); // Keep top 10
    }
    
    leaderboard.allTime.push(entry);
    leaderboard.allTime.sort((a, b) => b.score - a.score);
    leaderboard.allTime = leaderboard.allTime.slice(0, 10); // Keep top 10
    
    res.json({ success: true, rank: leaderboard.allTime.findIndex(e => e.userId === entry.userId) + 1 });
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

app.get('/api/game/leaderboard', (req, res) => {
  try {
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`AI or Earth server running on port ${PORT}`);
  console.log(`Real locations pool: ${mockRealLocations.length} images`);
  console.log(`AI images pool: ${mockAIImages.length} images`);
});