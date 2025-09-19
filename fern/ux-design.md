# UX Design & User Flow Architecture
## Chess Platform - Design Documentation

### 1. INFORMATION ARCHITECTURE

#### Site Map - Current Implementation
```
Chess Platform Root
├── / (Dashboard/Home)
│   ├── Create Game Section
│   │   ├── Blitz (5+3 minutes)
│   │   ├── Rapid (10+5 minutes)
│   │   └── Classical (30+30 minutes)
│   └── Join Game Section
│       └── Available Games List
│           ├── Player Info (name, rating)
│           ├── Time Control Display
│           └── "Join as Black" Button
├── /auth/
│   ├── /signin (Login Form)
│   └── /signup (Registration - implied)
└── /game/{gameId} (Chess Board Interface)
    ├── Game Information Panel
    ├── Interactive Chess Board
    └── Player Status Display

API Routes:
├── /api/auth/* (NextAuth.js endpoints)
├── /api/games (GET, POST)
├── /api/games/[id] (GET, PUT)
└── /api/moves (POST)
```

#### Navigation Hierarchy
```
Primary Navigation:
- Chess Platform (Logo/Home link)
- User Info Display (Name, Rating)
- Sign Out Button

Secondary Navigation:
- Game Creation (3 time control options)
- Available Games (dynamic list)
- Back to Dashboard (from game view)
```

#### User Roles & Permissions

**1. Anonymous User**
- ❌ Cannot access dashboard
- ✅ Can access signin/signup pages
- ❌ Cannot view or create games
- 🔄 Redirected to /auth/signin

**2. Authenticated Player**
- ✅ Access to dashboard
- ✅ Can create games (any time control)
- ✅ Can join available games
- ✅ Can play active games
- ✅ Session persists across browser tabs

**3. Future Roles (Planned)**
- **Premium Player**: Access to advanced features
- **Moderator**: Can manage games and users
- **Admin**: Full system access

### 2. USER FLOW DESIGN

#### Primary User Flows (Happy Paths)

**Flow 1: New User Registration & First Game**
```
[Landing] → [Sign Up Form] → [Dashboard] → [Create Game] → [Wait for Opponent] → [Game Start] → [Play Chess] → [Game End] → [Dashboard]
```

**Flow 2: Returning User - Join Game**
```
[Landing/Signin] → [Dashboard] → [View Available Games] → [Join Game] → [Chess Board] → [Play Move] → [Wait for Opponent] → [Continue Game]
```

**Flow 3: Quick Play Session**
```
[Sign In] → [Dashboard] → [Create Blitz Game] → [Opponent Joins] → [5-minute Game] → [Result] → [New Game/Dashboard]
```

#### Alternative Flows (Edge Cases)

**Flow A: No Available Games**
```
[Dashboard] → [Empty Join Game Section] → [Create New Game] → [Wait State] → [Game Matched]
```

**Flow B: Session Timeout**
```
[Playing Game] → [Session Expires] → [Redirect to Sign In] → [Re-authenticate] → [Return to Game]
```

**Flow C: Game Abandonment**
```
[Active Game] → [Opponent Leaves] → [Waiting State] → [Timeout] → [Victory by Default] → [Dashboard]
```

#### Error States & Recovery Flows

**Authentication Errors:**
```
[Invalid Login] → [Error Message] → [Retry Login] → [Success/Dashboard]
[Network Error] → [Retry Button] → [Reconnect] → [Resume Session]
```

**Game State Errors:**
```
[Invalid Move] → [Move Rejected] → [Board Reset] → [Continue Game]
[Connection Lost] → [Reconnecting...] → [Game State Sync] → [Resume Game]
```

**Database Errors:**
```
[Game Creation Fails] → [Error Toast] → [Retry Button] → [Success/Dashboard]
[Move Save Fails] → [Move Rollback] → [Error Display] → [Manual Retry]
```

### 3. WIREFRAMING

#### Low-Fidelity ASCII Wireframes

**Dashboard/Home Page**
```
┌─────────────────────────────────────────────────────────┐
│ Chess Platform          Welcome, [User] (Rating: 1200) │ Sign Out
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────┐    ┌─────────────────────────┐  │
│ │   Create New Game   │    │      Join Game          │  │
│ ├─────────────────────┤    ├─────────────────────────┤  │
│ │  ┌───────────────┐  │    │ ┌─────────────────────┐ │  │
│ │  │ Blitz (5+3)   │  │    │ │ player2 (1200)     │ │  │
│ │  └───────────────┘  │    │ │ Time: 5+3          │ │  │
│ │  ┌───────────────┐  │    │ │ [Join as Black]    │ │  │
│ │  │ Rapid (10+5)  │  │    │ └─────────────────────┘ │  │
│ │  └───────────────┘  │    │ ┌─────────────────────┐ │  │
│ │  ┌───────────────┐  │    │ │ testuser (1200)    │ │  │
│ │  │Classical(30+30)│ │    │ │ Time: 10+5         │ │  │
│ │  └───────────────┘  │    │ │ [Join as Black]    │ │  │
│ └─────────────────────┘    │ └─────────────────────┘ │  │
│                             └─────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Game Board Interface**
```
┌─────────────────────────────────────────────────────────┐
│ Chess Platform          Welcome, [User] (Rating: 1200) │ Sign Out
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────┐    ┌─────────────────────────┐  │
│ │   Game in Progress  │    │  Game Information       │  │
│ ├─────────────────────┤    ├─────────────────────────┤  │
│ │White: testuser(1200)│    │ Time Control: 5+3       │  │
│ │Status: in_progress  │    │ Status: in_progress     │  │
│ │Black: player2(1200) │    │ Your Color: white       │  │
│ │                     │    │                         │  │
│ │Your turn            │    │ ┌─────────────────────┐ │  │
│ └─────────────────────┘    │ │   Move History      │ │  │
│                             │ │ 1. e4 e5            │ │  │
│ ┌─────────────────────┐    │ │ 2. Nf3 Nc6          │ │  │
│ │  8 ♜♞♝♛♚♝♞♜         │    │ │ 3. Bb5 ...          │ │  │
│ │  7 ♟♟♟♟♟♟♟♟         │    │ └─────────────────────┘ │  │
│ │  6 . . . . . . . .  │    └─────────────────────────┘  │
│ │  5 . . . . . . . .  │                                │
│ │  4 . . . . . . . .  │                                │
│ │  3 . . . . . . . .  │                                │
│ │  2 ♙♙♙♙♙♙♙♙         │                                │
│ │  1 ♖♘♗♕♔♗♘♖         │                                │
│ │    a b c d e f g h   │                                │
│ └─────────────────────┘                                │
└─────────────────────────────────────────────────────────┘
```

**Sign In Page**
```
┌─────────────────────────────────────────────────────────┐
│                    Chess Platform                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│         ┌─────────────────────────────────┐            │
│         │      Sign In to Chess Platform  │            │
│         ├─────────────────────────────────┤            │
│         │                                 │            │
│         │ Email                           │            │
│         │ ┌─────────────────────────────┐ │            │
│         │ │ Enter your email            │ │            │
│         │ └─────────────────────────────┘ │            │
│         │                                 │            │
│         │ Password                        │            │
│         │ ┌─────────────────────────────┐ │            │
│         │ │ Enter your password         │ │            │
│         │ └─────────────────────────────┘ │            │
│         │                                 │            │
│         │        ┌─────────────┐          │            │
│         │        │   Sign In   │          │            │
│         │        └─────────────┘          │            │
│         │                                 │            │
│         │ Don't have an account? Sign up  │            │
│         └─────────────────────────────────┘            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Interaction Annotations

**Dashboard Interactions:**
- Hover: Game creation buttons show subtle shadow/scale effect
- Click: Immediate navigation with loading state
- Real-time: Available games list updates every 30 seconds
- Responsive: Game cards stack vertically on mobile

**Chess Board Interactions:**
- Click piece: Highlight legal moves with green dots
- Drag & Drop: Piece follows cursor with shadow
- Invalid move: Red flash animation + piece returns to origin
- Turn indicator: Subtle pulse animation on "Your turn"

**Form Interactions:**
- Focus: Input fields show blue border glow
- Validation: Real-time error messages below inputs
- Submit: Button shows loading spinner during authentication
- Error states: Red border + error message overlay

### 4. RESPONSIVE BREAKPOINTS

#### Desktop (1024px+)
- Two-column layout (Game Creation | Join Game)
- Full chess board (512px × 512px)
- Side-by-side game information panels
- Hover states enabled

#### Tablet (768px - 1023px)  
- Single column layout with sections stacked
- Medium chess board (400px × 400px)
- Condensed game information
- Touch-friendly button sizes (44px minimum)

#### Mobile (320px - 767px)
- Single column, full-width layout
- Small chess board (280px × 280px)
- Collapsible game information
- Bottom navigation for game actions
- Swipe gestures for piece movement

### 5. ACCESSIBILITY REQUIREMENTS (WCAG 2.1 AA)

#### Visual Accessibility
- **Color Contrast**: 4.5:1 minimum ratio for all text
- **Chess Board**: Alternative high-contrast theme option
- **Focus Indicators**: 2px blue outline on keyboard navigation
- **Text Size**: Scalable up to 200% without horizontal scrolling

#### Motor Accessibility  
- **Keyboard Navigation**: Full chess board playable via keyboard
- **Touch Targets**: 44px minimum for mobile interactions
- **Voice Control**: Compatible with Dragon NaturallySpeaking
- **Switch Control**: iOS/Android switch navigation support

#### Cognitive Accessibility
- **Clear Labels**: All buttons and links descriptively labeled
- **Error Messages**: Plain language, specific guidance
- **Progress Indicators**: Turn status clearly communicated
- **Consistent Navigation**: Same UI patterns throughout

#### Screen Reader Support
- **Chess Board**: Algebraic notation announced for moves
- **Game State**: "Your turn" / "Opponent's turn" announced
- **Semantic HTML**: Proper heading hierarchy (h1→h2→h3)
- **ARIA Labels**: Comprehensive labeling for interactive elements

#### Implementation Examples
```html
<!-- Accessible Chess Board -->
<div role="grid" aria-label="Chess board, 8 by 8 grid">
  <div role="row" aria-label="Rank 8">
    <div role="gridcell" aria-label="a8, black rook" tabindex="0">♜</div>
  </div>
</div>

<!-- Accessible Game Status -->
<div aria-live="polite" aria-atomic="true">
  <span id="game-status">Your turn - Move white pieces</span>
</div>

<!-- Accessible Form -->
<label for="email">Email Address</label>
<input 
  id="email" 
  type="email" 
  required 
  aria-describedby="email-error"
  autocomplete="email"
>
<div id="email-error" role="alert"></div>
```

---

**Next Steps for Implementation:**
1. Add keyboard navigation for chess board
2. Implement high-contrast theme toggle  
3. Add aria-live regions for game state updates
4. Create mobile-responsive chess piece touch areas
5. Add screen reader algebraic notation announcements
