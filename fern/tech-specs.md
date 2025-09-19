# Technical Architecture & Specifications
## Chess.com Platform - Comprehensive Technical Documentation

---

## 1. Stack Definition

### Frontend Architecture
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **State Management**: React hooks (useState, useEffect) + Zustand (planned upgrade)
- **Chess Logic**: chess.js v1.4.0
- **UI Components**: 
  - shadcn/ui (base components)
  - Aceternity UI (advanced animations)
  - Magic UI (special effects)
- **Authentication**: NextAuth.js v5.0.0-beta.29

### Backend Architecture
- **Runtime**: Node.js (via Next.js API routes)
- **API Design**: RESTful endpoints with Next.js App Router
- **Session Management**: JWT with NextAuth.js
- **Real-time Communication**: HTTP polling (WebSocket upgrade planned)

### Database Architecture
- **Current**: SQLite with better-sqlite3 v12.2.0
- **Production Target**: PostgreSQL with Drizzle ORM v0.44.5
- **Migration Strategy**: Drizzle Kit v0.31.4
- **Connection**: Local file-based (development) → PostgreSQL (production)

### Deployment & Infrastructure
- **Current Environment**: MorphVPS (morphvm)
- **Containerization**: Docker (planned)
- **Process Management**: PM2 (planned)
- **Public URL**: https://chess-app-main-morphvm-52mu6gct.http.cloud.morph.so

---

## 2. Database Design

### Entity Relationship Diagram
```
[users] ||--o{ [games] : whitePlayer
[users] ||--o{ [games] : blackPlayer
[users] ||--o{ [sessions] : user_sessions
[users] ||--o{ [accounts] : user_accounts
[games] ||--o{ [moves] : game_moves
[users] ||--o{ [authenticators] : user_auth
```

### Table Schemas

#### users
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (randomblob(16)),
    name TEXT,
    email TEXT UNIQUE,
    emailVerified INTEGER, -- timestamp_ms
    image TEXT,
    rating INTEGER DEFAULT 1200,
    createdAt INTEGER DEFAULT (unixepoch() * 1000)
);
```
- **Indexes**: UNIQUE(email), INDEX(rating)
- **Constraints**: email must be valid format, rating >= 0

#### games
```sql
CREATE TABLE games (
    id TEXT PRIMARY KEY DEFAULT (randomblob(16)),
    whitePlayerId TEXT REFERENCES users(id),
    blackPlayerId TEXT REFERENCES users(id),
    status TEXT CHECK(status IN ('waiting', 'in_progress', 'completed', 'draw')) DEFAULT 'waiting',
    result TEXT CHECK(result IN ('white', 'black', 'draw')),
    currentFen TEXT DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    timeControl TEXT DEFAULT '10+5',
    whiteTimeLeft INTEGER DEFAULT 600000, -- milliseconds
    blackTimeLeft INTEGER DEFAULT 600000, -- milliseconds
    createdAt INTEGER DEFAULT (unixepoch() * 1000),
    updatedAt INTEGER DEFAULT (unixepoch() * 1000)
);
```
- **Indexes**: INDEX(status), INDEX(whitePlayerId), INDEX(blackPlayerId), INDEX(createdAt)
- **Constraints**: Valid FEN string, positive time values

#### moves
```sql
CREATE TABLE moves (
    id TEXT PRIMARY KEY DEFAULT (randomblob(16)),
    gameId TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    moveNumber INTEGER NOT NULL,
    from TEXT NOT NULL,
    to TEXT NOT NULL,
    promotion TEXT,
    san TEXT NOT NULL, -- Standard Algebraic Notation
    fen TEXT NOT NULL, -- Position after move
    timestamp INTEGER DEFAULT (unixepoch() * 1000)
);
```
- **Indexes**: INDEX(gameId, moveNumber), INDEX(timestamp)
- **Constraints**: Valid chess square notation (a1-h8)

#### sessions (NextAuth.js)
```sql
CREATE TABLE sessions (
    sessionToken TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires INTEGER NOT NULL -- timestamp_ms
);
```

### Migration Strategy
1. **Phase 1**: SQLite to PostgreSQL schema conversion
2. **Phase 2**: Data migration with validation
3. **Phase 3**: Connection string update
4. **Phase 4**: Performance optimization with indexes

### Seed Data Requirements
- Test users: testuser@example.com, player2@example.com
- Sample games in different states (waiting, in_progress, completed)
- Move history for completed games
- Rating distributions for testing

---

## 3. API Design

### RESTful Endpoint Documentation

#### Authentication Endpoints
```
POST /api/auth/signin
POST /api/auth/signout  
POST /api/auth/signup
GET  /api/auth/session
```

#### Game Management Endpoints
```
GET    /api/games              # List available games
POST   /api/games              # Create new game
GET    /api/games/{id}          # Get specific game
POST   /api/games/{id}/join     # Join existing game
POST   /api/games/{id}/move     # Make chess move
DELETE /api/games/{id}          # Abandon game
```

### Request/Response Schemas

#### POST /api/games (Create Game)
```typescript
// Request
interface CreateGameRequest {
  timeControl: '5+3' | '10+5' | '30+30'
}

// Response  
interface CreateGameResponse {
  success: boolean
  game: {
    id: string
    whitePlayerId: string
    status: 'waiting'
    timeControl: string
    createdAt: number
  }
}
```

#### POST /api/games/{id}/move (Make Move)
```typescript
// Request
interface MakeMoveRequest {
  from: string    // e.g., "e2"
  to: string      // e.g., "e4"  
  promotion?: 'q' | 'r' | 'b' | 'n'
}

// Response
interface MakeMoveResponse {
  success: boolean
  game: {
    id: string
    currentFen: string
    status: 'in_progress' | 'completed'
    result?: 'white' | 'black' | 'draw'
  }
  move: {
    san: string
    from: string
    to: string
    timestamp: number
  }
}
```

### Authentication/Authorization Strategy
- **JWT Tokens**: Stateless authentication via NextAuth.js
- **Session Duration**: 30 days with automatic refresh
- **Protected Routes**: All game endpoints require authentication
- **User Ownership**: Players can only make moves in their own games
- **Rate Limiting**: Applied per user, not per IP

### Error Response Standards
```typescript
interface ErrorResponse {
  success: false
  error: {
    code: string        // e.g., "INVALID_MOVE"
    message: string     // Human-readable description
    details?: any       // Additional context
  }
  timestamp: number
}
```

### API Versioning Strategy
- **Current**: No versioning (v1 implicit)
- **Future**: URL-based versioning (/api/v2/games)
- **Backward Compatibility**: 6-month deprecation notice
- **Documentation**: OpenAPI/Swagger integration planned

---

## 4. Technical Constraints

### Performance Budgets
- **Page Load Time**: < 2 seconds (First Contentful Paint)
- **Bundle Size**: 
  - Initial JS bundle: < 250KB gzipped
  - CSS bundle: < 50KB gzipped
  - Images: WebP format, < 500KB total
- **Chess Move Response**: < 100ms API response time
- **Database Queries**: < 50ms average query time

### Browser Compatibility Requirements
- **Supported Browsers**:
  - Chrome 90+ (95%+ coverage)
  - Firefox 88+ (90%+ coverage) 
  - Safari 14+ (85%+ coverage)
  - Edge 90+ (90%+ coverage)
- **Mobile Support**:
  - iOS Safari 14+
  - Chrome Mobile 90+
- **Progressive Enhancement**: Core functionality without JavaScript

### Security Requirements (OWASP Compliance)

#### Input Validation
- All chess moves validated against chess.js engine
- Email format validation with regex
- SQL injection prevention via parameterized queries
- XSS protection with Content Security Policy

#### Authentication Security
- Password hashing with bcryptjs (cost factor 10)
- JWT secret rotation every 90 days  
- Secure session cookies (httpOnly, secure, sameSite)
- CSRF protection enabled

#### Data Protection
- No sensitive data in client-side JavaScript
- Database connection strings in environment variables
- API rate limiting: 100 requests/minute per user
- Input sanitization for all user-generated content

### Scalability Considerations

#### Horizontal Scaling
- **Database**: Read replicas for game queries
- **Application**: Stateless design enables multiple instances
- **CDN**: Static assets served from global CDN
- **Caching**: Redis for session storage (planned)

#### Vertical Scaling Limits
- **Current VPS**: 2 CPU cores, 4GB RAM
- **Database**: SQLite suitable for < 10,000 concurrent games
- **Memory Usage**: < 512MB per Next.js instance
- **Concurrent Users**: Tested up to 50 simultaneous players

#### Monitoring & Observability
- **Application Metrics**: Response times, error rates
- **Database Metrics**: Query performance, connection counts
- **User Metrics**: Game completion rates, session durations
- **Infrastructure**: CPU/Memory/Disk usage alerts

---

## 5. Development & Deployment Specifications

### Environment Configuration
```bash
# Development
NODE_ENV=development
DATABASE_URL=file:./chess.db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-key

# Production  
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost:5432/chess
NEXTAUTH_URL=https://chess-app-main-morphvm-52mu6gct.http.cloud.morph.so
NEXTAUTH_SECRET=production-secret-key
```

### Build & Deployment Process
1. **Development**: `npm run dev` (Turbopack enabled)
2. **Testing**: `npm run test` (Jest + React Testing Library)
3. **Build**: `npm run build` (Static optimization)
4. **Production**: `npm run start` (PM2 process manager)

### Quality Assurance
- **Code Quality**: ESLint + Prettier
- **Type Safety**: TypeScript strict mode
- **Testing Coverage**: >80% unit test coverage target
- **E2E Testing**: Playwright for critical user journeys

---

## 6. Current Implementation Status

### ✅ Completed Features
- Next.js 15 application with TypeScript
- NextAuth.js authentication system  
- SQLite database with Drizzle ORM
- Chess game creation and joining
- Move validation with chess.js
- Multi-player session management
- Professional chess board UI
- Responsive design with Tailwind CSS

### 🚧 In Progress
- Real-time updates (currently requires refresh)
- WebSocket implementation for live games
- Advanced error handling and validation
- Performance optimization

### 📋 Planned Features
- PostgreSQL migration
- Tournament system
- ELO rating calculations
- Game replay and analysis
- Mobile application
- Advanced time controls
- Chess puzzles and training

---

## 7. Risk Assessment & Mitigation

### Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database scaling limits | High | Medium | PostgreSQL migration planned |
| Real-time sync issues | Medium | Low | WebSocket implementation |
| Security vulnerabilities | High | Low | OWASP compliance audits |
| Performance degradation | Medium | Medium | Monitoring and caching |

### Operational Risks  
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Server downtime | High | Low | Load balancing and backups |
| Data loss | High | Very Low | Automated database backups |
| Chess logic bugs | Medium | Low | Comprehensive test suite |
| User session issues | Medium | Low | Session management testing |

---

*Last Updated: January 2025*
*Version: 1.0*
*Author: Chess Platform Development Team*
