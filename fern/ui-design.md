# UI Design System & Component Architecture
## Chess Platform - Comprehensive Design Foundation

### 1. DESIGN SYSTEM FOUNDATION

#### Color Palette

**Primary Colors (Chess Professional)**
```css
:root {
  /* Chess Board Colors */
  --chess-light: #F5DEB3;    /* Light squares - wheat */
  --chess-dark: #8B4513;     /* Dark squares - saddle brown */
  --chess-border: #654321;   /* Board frame - dark brown */

  /* Brand Colors */
  --primary-50: #f0f9ff;     /* Light blue backgrounds */
  --primary-100: #e0f2fe;    /* Hover states */
  --primary-500: #0ea5e9;    /* Primary buttons */
  --primary-600: #0284c7;    /* Primary hover */
  --primary-700: #0369a1;    /* Primary pressed */

  /* Game Control Colors */
  --blitz: #10b981;          /* Green - Fast games */
  --rapid: #3b82f6;          /* Blue - Medium games */
  --classical: #8b5cf6;      /* Purple - Long games */

  /* Status Colors */
  --success: #059669;        /* Valid moves, wins */
  --warning: #d97706;        /* Time warnings */
  --error: #dc2626;          /* Invalid moves, losses */
  --info: #0284c7;           /* Information states */
}
```

**Semantic Colors**
```css
:root {
  /* Background System */
  --bg-primary: #ffffff;     /* Main backgrounds */
  --bg-secondary: #f8fafc;   /* Cards, panels */
  --bg-tertiary: #f1f5f9;    /* Subtle separators */
  
  /* Text System */
  --text-primary: #0f172a;   /* Main text */
  --text-secondary: #475569; /* Secondary text */
  --text-tertiary: #94a3b8;  /* Placeholder text */
  
  /* Border System */
  --border-light: #e2e8f0;   /* Subtle borders */
  --border-medium: #cbd5e1;  /* Standard borders */
  --border-heavy: #94a3b8;   /* Emphasis borders */
}
```

**Dark Mode Support**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-tertiary: #334155;
    
    --text-primary: #f8fafc;
    --text-secondary: #cbd5e1;
    --text-tertiary: #64748b;
    
    --border-light: #334155;
    --border-medium: #475569;
    --border-heavy: #64748b;
  }
}
```

#### Typography Scale

**Font Families**
```css
:root {
  /* Primary Font - Modern, readable */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  
  /* Chess Notation Font - Monospace for coordinates */
  --font-mono: 'Fira Code', 'Monaco', monospace;
  
  /* Display Font - Headlines, chess pieces */
  --font-display: 'Inter', system-ui, sans-serif;
}
```

**Font Scale (Tailwind-based)**
```css
:root {
  --text-xs: 0.75rem;    /* 12px - Small labels */
  --text-sm: 0.875rem;   /* 14px - Secondary text */
  --text-base: 1rem;     /* 16px - Body text */
  --text-lg: 1.125rem;   /* 18px - Large body */
  --text-xl: 1.25rem;    /* 20px - Small headings */
  --text-2xl: 1.5rem;    /* 24px - Section headings */
  --text-3xl: 1.875rem;  /* 30px - Page headings */
  --text-4xl: 2.25rem;   /* 36px - Major headings */
}
```

**Font Weights**
```css
:root {
  --font-light: 300;     /* Light text */
  --font-normal: 400;    /* Body text */
  --font-medium: 500;    /* Emphasis */
  --font-semibold: 600;  /* Subheadings */
  --font-bold: 700;      /* Headlines */
  --font-extrabold: 800; /* Major emphasis */
}
```

#### Spacing System (8px Grid)

```css
:root {
  --space-px: 1px;      /* Borders */
  --space-0.5: 0.125rem; /* 2px - Tight spacing */
  --space-1: 0.25rem;   /* 4px - Minimal spacing */
  --space-2: 0.5rem;    /* 8px - Base unit */
  --space-3: 0.75rem;   /* 12px - Small spacing */
  --space-4: 1rem;      /* 16px - Medium spacing */
  --space-6: 1.5rem;    /* 24px - Large spacing */
  --space-8: 2rem;      /* 32px - XL spacing */
  --space-12: 3rem;     /* 48px - Section spacing */
  --space-16: 4rem;     /* 64px - Page spacing */
  --space-20: 5rem;     /* 80px - Major spacing */
}
```

#### Border Radius Standards

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;  /* 2px - Small elements */
  --radius-base: 0.25rem; /* 4px - Standard elements */
  --radius-md: 0.375rem;  /* 6px - Cards, buttons */
  --radius-lg: 0.5rem;    /* 8px - Panels */
  --radius-xl: 0.75rem;   /* 12px - Large panels */
  --radius-2xl: 1rem;     /* 16px - Chess board */
  --radius-full: 9999px;  /* Pills, avatars */
}
```

#### Shadow/Elevation System

```css
:root {
  /* Depth shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  
  /* Glow effects for interactions */
  --glow-primary: 0 0 0 1px rgb(59 130 246 / 0.5);
  --glow-success: 0 0 0 1px rgb(34 197 94 / 0.5);
  --glow-error: 0 0 0 1px rgb(239 68 68 / 0.5);
  
  /* Chess-specific shadows */
  --chess-square-hover: inset 0 0 0 2px rgb(59 130 246 / 0.5);
  --chess-square-selected: inset 0 0 0 4px rgb(59 130 246 / 1);
  --chess-square-possible: inset 0 0 0 2px rgb(34 197 94 / 1);
}
```

### 2. COMPONENT LIBRARY PLANNING

#### Base Components (shadcn/ui)

**Form Components**
```tsx
// Button variants for chess platform
<Button variant="default">Create Game</Button>        // Primary actions
<Button variant="outline">Join Game</Button>          // Secondary actions  
<Button variant="ghost">Back to Dashboard</Button>    // Tertiary actions
<Button variant="destructive">Resign</Button>         // Destructive actions

// Input components
<Input placeholder="Enter your email" />
<Label>Time Control</Label>
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Choose time control" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="5+3">Blitz (5+3)</SelectItem>
    <SelectItem value="10+5">Rapid (10+5)</SelectItem>
    <SelectItem value="30+30">Classical (30+30)</SelectItem>
  </SelectContent>
</Select>
```

**Layout Components**
```tsx
// Card system for game information
<Card>
  <CardHeader>
    <CardTitle>Game Information</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div>Time Control: 5+3</div>
      <div>Status: in_progress</div>
    </div>
  </CardContent>
</Card>

// Table for leaderboards/history
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Player</TableHead>
      <TableHead>Rating</TableHead>
      <TableHead>Games</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>testuser</TableCell>
      <TableCell>1200</TableCell>
      <TableCell>15</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Advanced Animation Components (Aceternity UI)

**Background Effects**
```tsx
// Animated gradient backgrounds for login/signup pages
<BackgroundGradientAnimation
  gradientBackgroundStart="rgb(108, 0, 162)"
  gradientBackgroundEnd="rgb(0, 17, 82)"
  interactive={true}
>
  <div className="auth-form">
    {/* Sign in form content */}
  </div>
</BackgroundGradientAnimation>

// 3D Card effects for game thumbnails
<CardContainer className="inter-var">
  <CardBody>
    <div className="game-preview">
      {/* Chess position preview */}
    </div>
  </CardBody>
</CardContainer>
```

#### Special Effects Components (Magic UI)

**Text Animations**
```tsx
// Hero text animations
<TextAnimate 
  animateType="character" 
  animation="blurIn"
  className="text-4xl font-bold"
>
  Welcome to Chess Platform
</TextAnimate>

// Game status updates
<TypingAnimation className="text-lg">
  {gameStatus === 'waiting' ? "Waiting for opponent..." : "Game in progress"}
</TypingAnimation>

// Hover effects on chess pieces
<HyperText 
  animateOnHover={true} 
  duration={800}
  className="chess-piece"
>
  ♔
</HyperText>
```

**Interactive Animations**
```tsx
// Reveal animations for game results
<BoxReveal boxColor="#0ea5e9" duration={0.5}>
  <div className="game-result">
    {winner ? `${winner.name} Wins!` : "Draw"}
  </div>
</BoxReveal>

// Connection indicators between players
<AnimatedBeam
  containerRef={gameContainerRef}
  fromRef={whitePlayerRef}
  toRef={blackPlayerRef}
  className="connection-beam"
/>
```

#### Custom Chess Components

**ChessBoard Component Enhancement**
```ascii
┌─────────────────────────────────────┐
│            ChessBoard               │
├─────────────────────────────────────┤
│ Props:                              │
│ - fen: string                       │
│ - onMove: (move) => void            │
│ - playerColor: 'white'|'black'      │
│ - isPlayerTurn: boolean             │
│ - showCoordinates: boolean          │
│ - enableAnimations: boolean         │
│ - highlightLastMove: boolean        │
│ - showPossibleMoves: boolean        │
│                                     │
│ States:                             │
│ - selectedSquare: Square | null     │
│ - possibleMoves: string[]           │
│ - lastMove: {from, to} | null       │
│ - animatingPiece: Piece | null      │
└─────────────────────────────────────┘
```

**GameCard Component**
```ascii
┌─────────────────────────────────────┐
│             GameCard                │
├─────────────────────────────────────┤
│ ┌─────────────┐  Game Info         │
│ │   Player    │  • Time: 5+3       │
│ │ testuser    │  • Status: waiting │
│ │ Rating:1200 │  • Created: 2m ago │
│ └─────────────┘                     │
│                                     │
│ [Join as Black] [Spectate]          │
└─────────────────────────────────────┘
```

**PlayerCard Component**
```ascii
┌─────────────────────────────────────┐
│            PlayerCard               │
├─────────────────────────────────────┤
│ ┌───┐ PlayerName     [●] Online     │
│ │ A │ Rating: 1245   ⏱️ 5:00      │
│ └───┘ Games: 150     ♔ White       │
│                                     │
│ Last move: e4                       │
└─────────────────────────────────────┘
```

### 3. INTERACTION DESIGN

#### Micro-interactions using Framer Motion

**Hover States**
```tsx
// Button hover effects
const buttonVariants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

// Chess piece hover
const pieceVariants = {
  idle: { scale: 1, rotateZ: 0 },
  hover: { 
    scale: 1.1, 
    rotateZ: 2,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};
```

**Loading Animations**
```tsx
// Game creation loading
const loadingVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Thinking indicator (opponent's turn)
const thinkingVariants = {
  animate: {
    opacity: [1, 0.3, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};
```

**Page Transitions**
```tsx
// Route transitions
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3 }
  }
};

// Chess board slide-in
const boardVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      duration: 0.6,
      ease: [0.23, 1, 0.32, 1] // Custom easing
    }
  }
};
```

**Gesture Responses (Mobile)**
```tsx
// Swipe to navigate between games
const swipeVariants = {
  center: { x: 0, opacity: 1 },
  left: { x: -100, opacity: 0.3 },
  right: { x: 100, opacity: 0.3 }
};

// Pull to refresh games list
const pullRefreshVariants = {
  idle: { y: 0 },
  pulling: { y: 50 },
  refreshing: {
    rotate: 360,
    transition: { duration: 1, repeat: Infinity }
  }
};
```

#### Animation Timing and Easing Functions

```tsx
// Standard easing curves
const easings = {
  // UI elements
  standard: [0.4, 0.0, 0.2, 1],      // Material design standard
  decelerate: [0.0, 0.0, 0.2, 1],    // Elements entering screen
  accelerate: [0.4, 0.0, 1, 1],      // Elements leaving screen
  
  // Chess-specific
  pieceMove: [0.23, 1, 0.32, 1],     // Smooth piece movement
  boardFlip: [0.68, -0.55, 0.265, 1.55], // Board rotation with bounce
  
  // Game states
  victory: [0.175, 0.885, 0.32, 1.275], // Victory animation
  defeat: [0.55, 0.055, 0.675, 0.19]    // Defeat animation
};

// Timing standards
const durations = {
  instant: 0,           // Immediate feedback
  fast: 150,           // Button clicks, hovers
  normal: 300,         // Standard transitions
  slow: 500,           // Page transitions
  chess: 250,          // Piece movements
  board: 600,          // Board animations
  dramatic: 1000       // Game endings, celebrations
};
```

#### Interaction Priority Matrix

**High Priority Interactions (≤150ms)**
- Chess piece selection/deselection
- Button hover states
- Form input focus
- Menu item highlights

**Medium Priority Interactions (150-300ms)**
- Chess piece movement
- Card hover effects
- Modal open/close
- Page navigation

**Low Priority Interactions (300ms+)**
- Board rotation/flip
- Game result animations
- Background effects
- Loading transitions

### 4. COMPONENT VARIANTS AND STATES

#### Button Component System

```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'game';
  size: 'sm' | 'md' | 'lg';
  gameType?: 'blitz' | 'rapid' | 'classical';
  loading?: boolean;
  disabled?: boolean;
}

// Usage examples
<Button variant="primary" size="lg">Create Game</Button>
<Button variant="game" gameType="blitz">Blitz (5+3)</Button>
<Button variant="destructive" loading>Resigning...</Button>
```

#### Input Component States

```tsx
interface InputState {
  idle: 'border-gray-300';
  focus: 'border-blue-500 ring-blue-200';
  error: 'border-red-500 ring-red-200';
  success: 'border-green-500 ring-green-200';
  disabled: 'border-gray-200 bg-gray-50';
}
```

#### Chess Square States

```tsx
interface SquareState {
  default: 'chess-light | chess-dark';
  selected: 'ring-4 ring-blue-400';
  possible: 'ring-2 ring-green-400 after:dot-green';
  last-move: 'bg-yellow-200';
  check: 'bg-red-200 ring-2 ring-red-500';
  hover: 'ring-2 ring-gray-400';
}
```

### 5. RESPONSIVE COMPONENT BEHAVIOR

#### Breakpoint-Specific Component Adaptations

```tsx
// Chess board responsive sizing
const boardSizes = {
  mobile: 'w-72 h-72',    // 288px
  tablet: 'w-96 h-96',    // 384px  
  desktop: 'w-[512px] h-[512px]', // 512px
  large: 'w-[640px] h-[640px]'    // 640px
};

// Game card layouts
const cardLayouts = {
  mobile: 'grid-cols-1',           // Single column
  tablet: 'grid-cols-2',           // Two columns
  desktop: 'grid-cols-3',          // Three columns
  wide: 'grid-cols-4'              // Four columns
};
```

#### Touch vs Mouse Interactions

```tsx
// Touch-friendly chess interactions
const touchInteractions = {
  pieceSelection: {
    tapToSelect: true,
    doubleTapToMove: false,
    longPressForOptions: true,
    dragAndDrop: true
  },
  minimumTapTarget: '44px', // WCAG compliance
  hoverEffects: false       // Disabled on touch
};

// Mouse-specific enhancements
const mouseInteractions = {
  pieceHover: true,
  squareHover: true,
  contextMenus: true,
  tooltips: true,
  dragPreview: true
};
```

### 6. IMPLEMENTATION ROADMAP

#### Phase 1: Foundation (Current → Week 1)
- [ ] Install and configure shadcn/ui base components
- [ ] Implement design tokens and CSS custom properties
- [ ] Create Button, Input, Card component variants
- [ ] Add dark mode support

#### Phase 2: Chess-Specific Components (Week 2)
- [ ] Enhance ChessBoard with animations
- [ ] Create GameCard and PlayerCard components  
- [ ] Implement piece movement animations
- [ ] Add sound effects system

#### Phase 3: Advanced Animations (Week 3)
- [ ] Integrate Aceternity UI background effects
- [ ] Add Magic UI text animations
- [ ] Implement page transitions
- [ ] Create victory/defeat animations

#### Phase 4: Polish & Optimization (Week 4)
- [ ] Performance optimization for animations
- [ ] Accessibility audit and improvements
- [ ] Mobile gesture support
- [ ] Component documentation

---

**Design System Benefits:**
- **Consistency**: Unified visual language across all components
- **Scalability**: Easy to add new components following established patterns
- **Performance**: Optimized animations and efficient re-renders
- **Accessibility**: WCAG 2.1 AA compliance built into every component
- **Developer Experience**: Clear documentation and predictable APIs
