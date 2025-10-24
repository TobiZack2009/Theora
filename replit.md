# Theora MVP - Productivity & Financial Copilot

## Overview
Theora is a productivity and financial management web application designed specifically for Nigerian students and young adults (18-35). The app helps users organize multiple responsibilities, maximize their hustle, and build financial discipline through AI-powered insights and intuitive interfaces.

## Current Project State (October 24, 2025)

### Completed Features
- ✅ **Authentication System**: Firebase-based login/signup with offline mode support
- ✅ **Dashboard**: AI-powered daily briefs, priority task overview, events, and spending summary
- ✅ **Todo Management**: Create, edit, delete, and prioritize tasks with AI-powered sorting
- ✅ **Calendar**: Visual calendar with event management and date selection
- ✅ **Budget Tracker**: Simulated virtual card with transaction tracking and category-based spending analysis
- ✅ **AI Integration**: AWS Bedrock (DeepSeek-R1) with graceful fallback to mock responses
- ✅ **Offline Support**: Service Worker implementation for PWA capabilities
- ✅ **Responsive Design**: Mobile-first UI using Tailwind CSS

### Tech Stack
- **Frontend**: Vanilla JavaScript (ES6+)
- **Build System**: Rollup with custom configuration
- **Styling**: Tailwind CSS v3 + Custom CSS
- **Backend Services**: 
  - Firebase (Authentication + Firestore)
  - AWS Bedrock (DeepSeek-R1 AI model)
- **State Management**: Custom reactive state management with localStorage persistence
- **Offline**: Service Worker for PWA functionality

### Project Structure
```
├── src/
│   ├── js/
│   │   ├── components/        # UI components (auth, dashboard, todos, calendar, budget)
│   │   ├── services/          # Firebase & Bedrock AI services
│   │   ├── state/             # App state management
│   │   └── utils/             # Helpers, storage, initialization
│   ├── styles/                # Tailwind CSS + custom styles
│   ├── index.html             # Main HTML template
│   └── sw.js                  # Service Worker
├── dist/                      # Build output (generated)
├── rollup.config.js           # Build configuration
├── tailwind.config.cjs        # Tailwind configuration
└── postcss.config.cjs         # PostCSS configuration
```

### Environment Variables Required
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_APP_ID`: Firebase App ID
- `VITE_FIREBASE_PROJECT_ID`: Firebase Project ID

### Optional AWS Credentials (for AI features)
AI features work without AWS credentials by using intelligent mock responses. To enable real AI:
- AWS Access Key ID
- AWS Secret Access Key
- Region: us-west-2 (DeepSeek-R1 availability)

## Key Features

### 1. Multi-Life Task Management
- Create todos with priority levels (high/medium/low)
- Categorize by: School, Work, Hustle, Personal
- Filter by: Today, This Week, This Month, Priority
- AI-powered task prioritization and recommendations
- Checkbox completion tracking with visual feedback

### 2. Nigerian Youth Money Reality Tracker
**Simulated Financial Card:**
- 3D flip card design with balance display
- Quick transaction entry on card back
- Visual budget progress bar
- Spending by category breakdown

**Transaction Categories:**
- Food, Transport, Data/Airtime, Education
- Entertainment, Health, Shopping, Bills

**Smart Features:**
- Budget vs. Spent tracking
- AI spending insights and recommendations
- Category-based expense visualization
- Transaction history with date stamps

### 3. AI Proactive Intelligence
- **Daily Brief**: Personalized morning motivation and task overview
- **Todo Sorting**: AI analyzes tasks and suggests optimal order
- **Budget Insights**: Spending pattern analysis and suggestions
- **Context-Aware**: Understands Nigerian student/youth lifestyle

### 4. Calendar & Event Management
- Visual monthly calendar view
- Create events with custom icons
- Time-based scheduling
- Today's schedule overview on dashboard

### 5. Offline-First Architecture
- Service Worker for offline functionality
- localStorage for data persistence
- Works without internet connection
- Syncs when Firebase is available

## User Workflow

### First Time User
1. **Landing**: Authentication screen with Login/Sign Up tabs
2. **Option**: Continue without account (offline mode)
3. **Onboarding**: Immediate access to dashboard after auth

### Authenticated User
1. **Dashboard**: View daily brief, priority tasks, events, spending
2. **Navigation**: Switch between Todos, Calendar, Budget via top nav
3. **Quick Actions**: Add tasks, events, transactions from any view
4. **AI Help**: Request AI insights for todos and budget
5. **Settings**: Toggle Hustle Mode, set budgets

### Offline User
- Full app functionality without account
- Data stored locally in browser
- Can create account later to sync data

## Development

### Build Commands
```bash
npm run dev      # Start development server with live reload
npm run build    # Production build
npm start        # Build and start dev server
```

### Development Server
- URL: http://localhost:5000 (or Replit dev URL)
- Port: 5000 (configured for Replit)
- Live Reload: Enabled in development mode
- Cache Control: Disabled for fresh updates

## Nigerian Youth-Specific Features

### Hustle Mode Toggle
- Prioritizes money-making tasks
- Visual indicator in header
- Persisted in settings

### Sapa Mode (Future)
- Ultra-budget mode concept
- Spending lockdown
- Free resource suggestions

### Cultural Considerations
- Naira (₦) currency formatting
- Nigerian English date/time formats
- Understands local realities (data costs, transport, etc.)
- Designed for intermittent connectivity

## Architecture Decisions

### Why Vanilla JavaScript?
- Lightweight and fast
- No framework overhead
- Direct DOM manipulation
- Easier to understand and maintain
- Better for offline-first PWA

### Why Rollup?
- Smaller bundle sizes than Webpack
- Tree-shaking for unused code
- Fast build times
- Simple configuration

### Why Firebase?
- Easy authentication
- Realtime database
- Offline support built-in
- Free tier generous for MVP

### Why LocalStorage + State Management?
- Instant reactivity
- Offline-first by default
- Simple to implement
- No backend required for core features

## Future Enhancements
- [ ] Firestore sync for authenticated users
- [ ] AWS Bedrock credentials integration for real AI
- [ ] Group Economy features (split bills)
- [ ] Income projection based on patterns
- [ ] Sapa Survival Mode
- [ ] Network/contact management
- [ ] Push notifications
- [ ] WhatsApp integration
- [ ] Dark mode
- [ ] Export data as PDF/CSV
- [ ] Goal tracking with milestones
- [ ] Debt tracker (who owes you, who you owe)

## Recent Changes (October 24, 2025)
- Created complete MVP with all core features
- Implemented authentication with Firebase
- Built responsive UI with Tailwind CSS
- Added AI service with DeepSeek-R1 integration
- Created simulated financial card with 3D flip animation
- Implemented Service Worker for offline support
- Added environment variable replacement in build
- Configured Rollup with Tailwind CSS v3
- Set up state management with localStorage persistence

## Known Issues & Limitations
- Firebase Firestore sync not yet implemented (data only stored locally)
- AWS Bedrock requires manual credential input (using mock AI by default)
- Service Worker caching needs refinement for production
- No data export functionality yet
- No user profile editing
- Limited to single user on device (no multi-account)

## Contributing
This is an MVP project. Code is intentionally simple and focused on core functionality first.

## License
MIT
