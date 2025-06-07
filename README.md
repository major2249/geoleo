# AI or Earth? - GeoGuesser Game

A modern web-based geography and AI detection game where players must guess both the location of an image and whether it's real or AI-generated.

## 🎮 Game Features

- **Dual Challenge**: Guess both location and authenticity (real vs AI-generated)
- **Interactive World Map**: Click to guess locations using Leaflet.js
- **Scoring System**: Points based on accuracy and proximity
- **Daily Challenges**: Same 5 images for all players each day
- **Leaderboards**: Daily and all-time high scores
- **Modern UI**: Beautiful, responsive design with animations
- **Timer-Based Rounds**: 60 seconds per round, 5 rounds per game

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for styling and responsive design
- **Leaflet.js** for interactive world maps
- **Lucide React** for consistent iconography
- **Vite** for fast development and building

### Backend (Node.js + Express)
- **Express.js** API server
- **CORS** enabled for cross-origin requests
- **UUID** for unique identifiers
- **Mock data** for development (easily replaceable with real APIs)

### Key Components
- `GameInterface`: Main game UI with image display and map
- `GameMap`: Interactive Leaflet map for location guessing
- `Timer`: Visual countdown timer with color coding
- `GameResults`: Comprehensive results and scoring breakdown
- `MainMenu`: Landing page with leaderboards and instructions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with JavaScript enabled

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd ai-or-earth-geoguesser
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your API keys (optional for development)
```

3. **Start the development servers:**

Frontend:
```bash
npm run dev
```

Backend (in a separate terminal):
```bash
npm run server
```

4. **Open your browser:**
Navigate to `http://localhost:5173` to play the game!

## 🎯 How to Play

1. **Analyze the Image**: Study the location photo for visual clues
2. **Make Your Prediction**: Decide if it's real or AI-generated
3. **Guess the Location**: Click on the world map to pinpoint the location
4. **Submit & Score**: Earn points based on accuracy and proximity
5. **Complete 5 Rounds**: Build your total score across all rounds

### Scoring System
- **Correct AI/Real Prediction**: +2,500 points
- **Location Accuracy**: Up to +5,000 points (based on distance)
- **Perfect Round Maximum**: 7,500 points
- **Game Maximum**: 37,500 points

## 🔧 Production Setup

### External APIs Integration

For production deployment, integrate these APIs:

1. **Image Sources:**
   - Google Street View API for real location images
   - OpenAI DALL-E or Stability AI for AI-generated images

2. **Map Services:**
   - Google Maps API or continue with OpenStreetMap

3. **Database:**
   - MongoDB or Firebase for user data and scores
   - Redis for session management and caching

### Environment Variables
Set these in your production environment:
```
OPENAI_API_KEY=your_key
GOOGLE_MAPS_API_KEY=your_key
MONGODB_URI=your_connection_string
```

### Deployment Options

**Frontend (Vercel/Netlify):**
```bash
npm run build
# Deploy the 'dist' folder
```

**Backend (Railway/Render/Heroku):**
```bash
# Set NODE_ENV=production
# Configure your database connection
# Deploy with Docker or buildpack
```

## 🛡️ Anti-Cheat Measures

- **Timer Enforcement**: Server-side validation of submission times
- **Image Metadata Removal**: Strip EXIF data that might reveal locations
- **Rate Limiting**: Prevent rapid-fire submissions
- **Daily Challenge Consistency**: Same images for all players
- **Score Validation**: Server-side score calculation verification

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  avatar: String,
  bestScore: Number,
  gamesPlayed: Number,
  createdAt: Date
}
```

### GameSessions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  rounds: [{
    imageId: String,
    userGuess: { lat: Number, lng: Number },
    userPrediction: String, // 'ai' | 'real'
    score: Number,
    distance: Number,
    timeSpent: Number
  }],
  totalScore: Number,
  isDailyChallenge: Boolean,
  completedAt: Date
}
```

### DailyChallenge Collection
```javascript
{
  _id: ObjectId,
  date: String, // YYYY-MM-DD
  images: [{
    id: String,
    url: String,
    isAI: Boolean,
    location: { lat: Number, lng: Number },
    prompt: String // for AI images
  }]
}
```

## 🎨 Design System

- **Colors**: Blue (#3B82F6) primary, Purple (#8B5CF6) secondary
- **Typography**: Inter font family with clear hierarchy
- **Spacing**: 8px base grid system
- **Components**: Consistent button styles, cards, and animations
- **Responsive**: Mobile-first design with breakpoints at 768px and 1024px

## 🔮 Future Enhancements

- **Multiplayer Mode**: Real-time competition with Socket.io
- **User Accounts**: Google OAuth login and persistent profiles
- **Advanced AI**: More sophisticated AI-generated images
- **Mobile App**: React Native version for iOS/Android
- **Streaming Mode**: 360° panoramic images
- **Custom Challenges**: User-generated content and private rooms

## 📄 License

MIT License - feel free to use this project as a foundation for your own geography games!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Ready to test your geography and AI detection skills? Start playing AI or Earth!** 🌍🤖