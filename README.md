# Bull-11 Mobile App

> Stock Market Fantasy Game - React Native Mobile Companion

## Overview

Bull-11 is a mobile application for participating in a real-time stock market fantasy game featuring Indian stocks (NSE/BSE). The app allows users to create games by selecting stocks and track their performance based on live market data from Zerodha Kite Connect API.

### Key Features

- User registration and JWT-based authentication
- Create fantasy games with 3-5 stocks from NSE/BSE
- Track real-time stock performance during market hours
- View game history and performance analytics
- Admin panel for system management (admin users only)
- Unified experience with role-based tab visibility

## Tech Stack

### Frontend
- **Framework**: Expo SDK 54, React Native 0.81.5
- **Language**: TypeScript 5.9.2
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Custom hooks with React Context
- **Forms**: react-hook-form with validation
- **HTTP Client**: Axios with JWT interceptors
- **Storage**: AsyncStorage for token management

### Backend Integration
- **Backend**: Spring Boot 3.2.5, Java 21
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Market Data**: Zerodha Kite Connect API
- **Real-time**: WebSocket support for live prices
- **Authentication**: JWT tokens with 24-hour expiry

## Project Structure

```
bull-11-app/
├── app/                          # Expo Router screens
│   ├── auth/                     # Authentication flow
│   │   ├── login.tsx             # Login screen
│   │   └── register.tsx          # Registration screen
│   ├── (tabs)/                   # Main app tabs (user flow)
│   │   ├── index.tsx             # Active games list
│   │   ├── new-game.tsx          # Create new game
│   │   ├── history.tsx           # Game history
│   │   ├── profile.tsx           # User profile
│   │   └── admin.tsx             # Admin panel (admin only)
│   └── (admin)/                  # Admin management (admin only)
│       ├── dashboard.tsx         # Admin dashboard
│       ├── kite-setup.tsx        # Kite OAuth integration
│       ├── users.tsx             # User management
│       └── users/[id].tsx        # User details
│
├── src/
│   ├── domain/                   # Business logic layer
│   │   ├── entities/             # Domain models (User, Game, Stock)
│   │   ├── repositories/         # Repository interfaces
│   │   └── usecases/             # Business use cases (15 total)
│   ├── data/                     # Implementation layer
│   │   ├── api/                  # API client & DTOs
│   │   ├── storage/              # AsyncStorage wrapper
│   │   ├── mappers/              # DTO ↔ Entity converters
│   │   └── repositories/         # Repository implementations
│   ├── presentation/             # UI layer
│   │   ├── screens/              # Screen components
│   │   ├── components/           # Reusable UI components
│   │   └── hooks/                # Custom React hooks
│   └── core/                     # Infrastructure
│       ├── constants/            # API endpoints & config
│       ├── di/                   # Dependency injection
│       └── security/             # Security modules
│
├── assets/                       # Images, fonts, icons
├── .env                          # Environment configuration
└── Documentation (archived)
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- iOS Simulator (Mac) or Android Emulator
- Expo CLI: `npm install -g expo-cli`
- Backend API running on port 8080

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bull-11-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
# Create .env file
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
EXPO_PUBLIC_WS_URL=ws://localhost:8080/ws
PORT=5050
```

4. Start the development server:
```bash
npm start
# or
npm run ios     # iOS simulator
npm run android # Android emulator
npm run web     # Web browser
```

### First Run

The app will start at the login screen. You can:
- **Register** a new user account (creates USER role)
- **Login** with existing credentials
- **Admin access** requires manual backend account creation

## User Roles

### Regular User (USER)
- Register through the mobile app
- Access 4 tabs: Games, New Game, History, Profile
- Create and manage personal games
- Track stock performance

### Administrator (ADMIN)
- Created manually in backend database (secure approach)
- Access 5 tabs: Games, New Game, History, Profile, **Admin**
- All user features PLUS:
  - User management
  - Kite OAuth integration setup
  - System statistics
  - Monitor all games

## User Flows

### Registration Flow
```
1. Open app → Login screen
2. Click "Sign Up"
3. Enter: Full Name, Email, Password, Confirm Password
4. Password validated (min 8 chars, uppercase, lowercase, number, special char)
5. Account created with USER role
6. Auto-login → Navigate to Games tab
```

### Login Flow
```
1. Enter email & password
2. Rate limit check (max 5 attempts per 15 minutes)
3. Password validation
4. JWT token received
5. Role-based navigation:
   - USER → /(tabs) (4 tabs)
   - ADMIN → /(tabs) (5 tabs, includes Admin tab)
```

### Game Creation Flow
```
1. Navigate to "New Game" tab
2. Search stocks by symbol (e.g., "INFY", "TCS")
3. Select 3-5 stocks
4. Start game → Opening prices recorded
5. Game appears in "Games" tab
6. Track performance with live prices
7. Close game → Final performance calculated
```

### Admin Management Flow
```
1. Login as ADMIN
2. Click "Admin" tab (5th tab)
3. Access features:
   - User Management: View all users, search, details
   - Kite Setup: OAuth integration with Zerodha
   - System Stats: Analytics and monitoring
```

## API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Get JWT token

### Authenticated (USER/ADMIN)
- `GET /api/auth/me` - Current user profile
- `GET /api/games/history` - User's games (filter: ACTIVE, COMPLETED)
- `GET /api/games/{id}` - Game details
- `GET /api/games/{id}/live` - Real-time game performance
- `POST /api/games/start` - Create new game
- `POST /api/games/{id}/close` - Finalize game
- `POST /api/games/{id}/cancel` - Cancel active game
- `GET /api/kite/instruments/search?q={query}` - Search stocks

### Admin Only (ADMIN)
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/{id}` - User details
- `GET /api/admin/users/email/{email}` - Search by email
- `GET /api/kite/auth/login-url` - Get Kite OAuth URL
- `GET /api/kite/auth/callback?request_token=XXX` - Complete OAuth

## Security Features

### Authentication Security
- **JWT Tokens**: 24-hour expiry with automatic validation
- **Password Validation**: Strength requirements (8+ chars, complexity rules)
- **Rate Limiting**: Max 5 login attempts per 15 minutes, 30-min lockout
- **Session Management**: 30-minute inactivity timeout with auto-logout

### Authorization Security
- **Role-Based Access**: ADMIN vs USER routes
- **Privilege Escalation Detection**: Re-verify role on app resume
- **Admin Guards**: Protect admin screens from unauthorized access
- **Audit Logging**: Track all admin actions locally

### Data Security
- **Secure Storage**: Tokens stored with AsyncStorage + OS encryption
- **HTTPS Only**: All API communication over HTTPS
- **Token Cleanup**: Automatic removal of expired tokens

## Configuration

### Ports
- **Mobile App**: 5050 (Expo Metro bundler)
- **Backend API**: 8080 (Spring Boot)
- **WebSocket**: ws://localhost:8080/ws

### Environment Variables
```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080  # Backend URL
EXPO_PUBLIC_WS_URL=ws://localhost:8080/ws       # WebSocket URL
PORT=5050                                        # Expo dev server port
```

### Deep Linking
- **Scheme**: `bull11app://`
- **Usage**: OAuth callback for Kite integration
- **Format**: `bull11app:///?request_token=XXX&action=login`

## Kite OAuth Integration (Admin Only)

### Setup Process
1. Login as ADMIN
2. Navigate to Admin tab → "Kite Setup"
3. Click "Start Kite Authentication"
4. Browser opens with Zerodha Kite login
5. Authenticate with Zerodha credentials
6. Deep link callback returns `request_token`
7. Click "Complete Authentication"
8. Backend exchanges token for access token
9. Live stock data now available for all users

### Testing Deep Links
```bash
# iOS Simulator
xcrun simctl openurl booted "bull11app:///?request_token=test123"

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "bull11app:///?request_token=test123"
```

## Troubleshooting

### Common Issues

**App won't start**
- Check Node.js version (18+)
- Run `npm install` to ensure dependencies
- Clear cache: `npx expo start -c`

**Login fails**
- Verify backend is running on port 8080
- Check `.env` file has correct API_BASE_URL
- Test backend endpoint: `curl http://localhost:8080/api/auth/login`

**"Rate limit exceeded" error**
- Wait 15 minutes for rate limit reset
- Max 5 failed login attempts per 15 minutes

**Session timeout**
- Auto-logout after 30 minutes of inactivity
- Warning shown at 5 minutes remaining
- Click "Stay Active" to extend session

**Admin tab not visible**
- Verify user has ADMIN role in backend
- Re-login to refresh role information
- Check backend logs for role assignment

**Kite OAuth fails**
- Verify backend has Kite API credentials
- Check deep linking is configured in app.json
- Try manual token entry as fallback

## Development

### Running Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Linting
```bash
npm run lint          # Check code style
npm run lint:fix      # Auto-fix issues
```

### Building
```bash
# Install EAS CLI
npm install -g eas-cli

# Build iOS
eas build --platform ios

# Build Android
eas build --platform android
```

## Architecture

The app follows **Clean Architecture** principles with clear separation of concerns:

- **Domain Layer**: Framework-independent business logic
- **Data Layer**: API integration, storage, repository implementations
- **Presentation Layer**: React Native UI components and screens
- **Core Layer**: Shared utilities, DI container, security modules

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md)

## Roadmap

### Phase 1 (Current)
- [x] User registration & authentication
- [x] JWT-based security
- [x] Active games list
- [x] Admin panel with user management
- [x] Kite OAuth integration

### Phase 2 (Completed ✅)
- [x] Game creation with stock search
- [x] Real-time price updates (polling every 30s)
- [x] Game history with performance analytics
- [x] User profile management
- [x] Structured logging with react-native-logs

### Phase 3 (Planned)
- [ ] Push notifications
- [ ] Biometric authentication (Face ID/Touch ID)
- [ ] Leaderboards and rankings
- [ ] Social sharing features
- [ ] Offline mode support

### Phase 4 (Future)
- [ ] Advanced analytics and insights
- [ ] Multiple game modes
- [ ] Educational content
- [ ] Watchlists and favorites

## Contributing

This is a proprietary project. For contributions or issues, contact the development team.

## Backend Repository

The backend API (Bull-11) is a separate Spring Boot project:
- Repository: https://github.com/karthiks2410/Bull-11
- Tech Stack: Spring Boot 3.2.5, PostgreSQL 16, Redis 7, Java 21
- API Docs: Available at backend `/swagger-ui.html` when running

## Support

For technical support or questions:
1. Check this README
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for developer docs
3. Contact the development team

## License

Proprietary - All rights reserved

---

**Bull-11 Mobile App** - A modern, secure stock market fantasy game built with React Native and clean architecture principles.
