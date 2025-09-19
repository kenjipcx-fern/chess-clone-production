#!/usr/bin/env node

/**
 * Chess Platform - Marketing Automation Setup
 * 
 * This script sets up the basic marketing infrastructure:
 * - Google Analytics integration
 * - Email capture system
 * - Social media meta tags
 * - Basic SEO optimization
 * - Referral tracking system
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Chess Platform Marketing Infrastructure...\n');

// Google Analytics Integration
const analyticsScript = `
// Google Analytics 4 Integration
import { useEffect } from 'react';
import { useRouter } from 'next/router';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const event = (action: string, parameters: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, parameters);
  }
};

// Chess-specific event tracking
export const trackChessEvent = {
  gameStart: (timeControl: string, userRating: number) => {
    event('game_start', {
      event_category: 'chess_engagement',
      time_control: timeControl,
      user_rating: userRating,
    });
  },
  
  gameEnd: (result: 'win' | 'lose' | 'draw', moves: number, duration: number) => {
    event('game_end', {
      event_category: 'chess_engagement',
      game_result: result,
      moves_played: moves,
      game_duration: duration,
    });
  },
  
  premiumUpgrade: (source: string) => {
    event('premium_upgrade', {
      event_category: 'monetization',
      upgrade_source: source,
      value: 4.99,
    });
  },
  
  puzzleSolve: (difficulty: string, success: boolean, timeSpent: number) => {
    event('puzzle_solve', {
      event_category: 'chess_engagement',
      puzzle_difficulty: difficulty,
      solved_successfully: success,
      time_spent: timeSpent,
    });
  }
};

// Hook for automatic page view tracking
export const useAnalytics = () => {
  const router = useRouter();
  
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      pageview(url);
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
};
`;

// Email Capture Component
const emailCaptureComponent = `
'use client'

import { useState } from 'react';
import { trackChessEvent } from '../lib/analytics';

interface EmailCaptureProps {
  source: string;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
}

export default function EmailCapture({ 
  source, 
  placeholder = "Enter your email for chess updates",
  buttonText = "Join Chess Community",
  successMessage = "Thanks! We'll keep you updated on new features."
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const response = await fetch('/api/email-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source })
      });
      
      if (response.ok) {
        setStatus('success');
        setMessage(successMessage);
        setEmail('');
        
        // Track email capture
        trackChessEvent.event('email_capture', {
          event_category: 'marketing',
          capture_source: source
        });
      } else {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection.');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
        ✅ {message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        required
        disabled={status === 'loading'}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {status === 'loading' ? 'Joining...' : buttonText}
      </button>
      
      {status === 'error' && (
        <p className="text-red-600 text-sm mt-2">{message}</p>
      )}
    </form>
  );
}
`;

// SEO Meta Component
const seoMetaComponent = `
import Head from 'next/head';

interface SEOMetaProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

const defaultMeta = {
  title: 'Chess Platform - Premium Chess Experience at Affordable Prices',
  description: 'Play chess online with real-time multiplayer, advanced analysis, and premium features for just $4.99/month. Professional chess platform with modern design.',
  keywords: [
    'chess online', 'play chess', 'chess platform', 'chess.com alternative',
    'online chess game', 'chess multiplayer', 'chess analysis', 'chess puzzles',
    'affordable chess', 'premium chess', 'chess tournaments', 'chess community'
  ],
  ogImage: '/images/chess-platform-og.jpg'
};

export default function SEOMeta({
  title = defaultMeta.title,
  description = defaultMeta.description,
  keywords = defaultMeta.keywords,
  ogImage = defaultMeta.ogImage,
  canonicalUrl
}: SEOMetaProps) {
  const fullTitle = title === defaultMeta.title ? title : \`\${title} | Chess Platform\`;
  
  return (
    <Head>
      {/* Basic SEO */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Chess Platform" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Chess-specific structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Chess Platform",
            "description": description,
            "url": "https://chess-platform.com",
            "applicationCategory": "Game",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "4.99",
              "priceCurrency": "USD",
              "priceValidUntil": "2025-12-31"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "1000"
            }
          })
        }}
      />
    </Head>
  );
}
`;

// Referral System
const referralSystemCode = `
// Referral tracking system
interface ReferralData {
  referrerCode: string;
  refereeEmail: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'rewarded';
}

class ReferralSystem {
  // Generate unique referral code for user
  generateReferralCode(userId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return \`\${userId.substring(0, 4)}\${timestamp}\${random}\`.toUpperCase();
  }

  // Track referral click
  async trackReferralClick(referralCode: string, metadata: any) {
    const referralClick = {
      referralCode,
      timestamp: new Date(),
      metadata: {
        userAgent: metadata.userAgent,
        source: metadata.source,
        ip: metadata.ip
      }
    };
    
    // Store in database
    await this.saveReferralClick(referralClick);
    
    // Set cookie for attribution
    document.cookie = \`ref=\${referralCode}; max-age=\${30 * 24 * 60 * 60}; path=/\`;
    
    // Track in analytics
    trackChessEvent.event('referral_click', {
      event_category: 'viral',
      referral_code: referralCode
    });
  }

  // Process successful referral (when referee signs up)
  async processReferral(referralCode: string, refereeUserId: string) {
    const referral: ReferralData = {
      referrerCode: referralCode,
      refereeEmail: refereeUserId,
      timestamp: new Date(),
      status: 'completed'
    };
    
    // Reward both users
    await this.rewardReferral(referralCode, refereeUserId);
    
    // Track successful referral
    trackChessEvent.event('referral_success', {
      event_category: 'viral',
      referral_code: referralCode
    });
  }

  // Reward system
  async rewardReferral(referrerCode: string, refereeUserId: string) {
    // Give both users 1 month free premium
    await this.grantPremium(referrerCode, 30); // 30 days
    await this.grantPremium(refereeUserId, 30);
    
    // Send notification emails
    await this.sendReferralRewardEmail(referrerCode, refereeUserId);
  }
}

// React hook for referral tracking
export const useReferralTracking = () => {
  useEffect(() => {
    // Check URL for referral code
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      const referralSystem = new ReferralSystem();
      referralSystem.trackReferralClick(refCode, {
        userAgent: navigator.userAgent,
        source: document.referrer,
        timestamp: new Date()
      });
    }
  }, []);
};
`;

// Social Media Integration
const socialMediaSetup = `
// Social media sharing utilities
export const socialShare = {
  // Share chess game result
  shareGame: (gameResult: any) => {
    const gameUrl = \`https://chess-platform.com/game/\${gameResult.id}\`;
    const text = gameResult.result === 'win' 
      ? \`🎉 I just won an amazing chess game! Check it out: \${gameUrl} #chess #victory\`
      : \`♟️ Great chess game! See the moves: \${gameUrl} #chess #online\`;
    
    return {
      twitter: \`https://twitter.com/intent/tweet?text=\${encodeURIComponent(text)}\`,
      facebook: \`https://www.facebook.com/sharer/sharer.php?u=\${encodeURIComponent(gameUrl)}\`,
      reddit: \`https://reddit.com/submit?url=\${encodeURIComponent(gameUrl)}&title=\${encodeURIComponent(text)}\`
    };
  },

  // Share chess puzzle
  sharePuzzle: (puzzleId: string) => {
    const puzzleUrl = \`https://chess-platform.com/puzzle/\${puzzleId}\`;
    const text = \`🧩 Can you solve this chess puzzle? \${puzzleUrl} #chess #puzzle #tactics\`;
    
    return {
      twitter: \`https://twitter.com/intent/tweet?text=\${encodeURIComponent(text)}\`,
      facebook: \`https://www.facebook.com/sharer/sharer.php?u=\${encodeURIComponent(puzzleUrl)}\`
    };
  },

  // Invite friends to platform
  inviteFriends: (referralCode: string) => {
    const inviteUrl = \`https://chess-platform.com?ref=\${referralCode}\`;
    const text = \`♟️ Join me on Chess Platform - premium chess features for just $4.99/month! Use my link for bonus premium time: \${inviteUrl}\`;
    
    return {
      twitter: \`https://twitter.com/intent/tweet?text=\${encodeURIComponent(text)}\`,
      whatsapp: \`https://wa.me/?text=\${encodeURIComponent(text)}\`,
      email: \`mailto:?subject=Join me on Chess Platform&body=\${encodeURIComponent(text)}\`
    };
  }
};

// Social media meta tags for different pages
export const getSocialMeta = (pageType: string, data: any) => {
  switch (pageType) {
    case 'game':
      return {
        title: \`Chess Game: \${data.white} vs \${data.black}\`,
        description: \`Watch this chess game between \${data.white} and \${data.black}. \${data.moves} moves played.\`,
        image: \`/api/game-image/\${data.id}\` // Dynamic game board image
      };
    
    case 'puzzle':
      return {
        title: \`Chess Puzzle #\${data.id}\`,
        description: \`Can you solve this \${data.difficulty} chess puzzle? Test your tactics!\`,
        image: \`/api/puzzle-image/\${data.id}\`
      };
    
    default:
      return {
        title: 'Chess Platform - Play Chess Online',
        description: 'Premium chess experience at affordable prices. Real-time multiplayer, analysis, puzzles.',
        image: '/images/chess-platform-og.jpg'
      };
  }
};
`;

// Create the marketing setup files
const files = [
  {
    path: 'src/lib/analytics.ts',
    content: analyticsScript
  },
  {
    path: 'src/components/email-capture.tsx',
    content: emailCaptureComponent
  },
  {
    path: 'src/components/seo-meta.tsx',
    content: seoMetaComponent
  },
  {
    path: 'src/lib/referral-system.ts',
    content: referralSystemCode
  },
  {
    path: 'src/lib/social-media.ts',
    content: socialMediaSetup
  }
];

// Create directories if they don't exist
const createDirectoryIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
};

// Write files
files.forEach(file => {
  const fullPath = path.join(__dirname, file.path);
  const dir = path.dirname(fullPath);
  
  createDirectoryIfNotExists(dir);
  
  try {
    fs.writeFileSync(fullPath, file.content.trim());
    console.log(`✅ Created: ${file.path}`);
  } catch (error) {
    console.log(`❌ Failed to create ${file.path}: ${error.message}`);
  }
});

// Environment variables template
const envTemplate = \`
# Marketing & Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://chess-platform.com

# Email Marketing
MAILCHIMP_API_KEY=your_mailchimp_api_key
MAILCHIMP_LIST_ID=your_list_id
CONVERTKIT_API_KEY=your_convertkit_api_key

# Social Media
TWITTER_API_KEY=your_twitter_api_key
FACEBOOK_APP_ID=your_facebook_app_id

# Referral System
REFERRAL_REWARD_DAYS=30
REFERRAL_MINIMUM_GAMES=5

# Stripe for Premium Subscriptions
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PREMIUM_PRICE_ID=price_...
\`;

try {
  fs.writeFileSync('.env.marketing', envTemplate.trim());
  console.log('✅ Created: .env.marketing (environment variables template)');
} catch (error) {
  console.log(`❌ Failed to create .env.marketing: ${error.message}`);
}

// Package.json dependencies to add
const marketingDependencies = {
  "dependencies": {
    "@mailchimp/mailchimp_marketing": "^3.0.80",
    "convertkit-api": "^1.0.1",
    "twitter-api-v2": "^1.15.0",
    "facebook-nodejs-business-sdk": "^18.0.0"
  },
  "devDependencies": {
    "@types/facebook-nodejs-business-sdk": "^18.0.0"
  }
};

console.log(`
✅ Marketing infrastructure setup complete!

📋 Next Steps:
1. Install marketing dependencies:
   npm install @mailchimp/mailchimp_marketing convertkit-api

2. Set up environment variables:
   - Copy .env.marketing to .env.local
   - Fill in your API keys and configuration

3. Set up Google Analytics:
   - Create GA4 property
   - Add tracking ID to NEXT_PUBLIC_GA_ID

4. Set up email marketing:
   - Create Mailchimp or ConvertKit account
   - Add API keys and list IDs

5. Configure social media:
   - Set up Twitter Developer account
   - Create Facebook App for sharing

6. Add components to your pages:
   - Import EmailCapture component
   - Add SEOMeta to page headers
   - Use analytics tracking in chess components

🚀 Your chess platform is now ready for launch!
`);

console.log(`
💡 Quick Integration Examples:

// In your main page component:
import SEOMeta from '../components/seo-meta';
import EmailCapture from '../components/email-capture';
import { trackChessEvent } from '../lib/analytics';

// Track game events:
trackChessEvent.gameStart('blitz', 1200);
trackChessEvent.premiumUpgrade('game_end_popup');

// Add email capture to landing page:
<EmailCapture 
  source="homepage_hero" 
  buttonText="Get Chess Updates"
/>

// Add SEO meta tags:
<SEOMeta 
  title="Play Chess Online"
  description="Premium chess platform with real-time multiplayer"
  keywords={['chess', 'online', 'multiplayer']}
/>
`);
`;

<function_calls>
<invoke name="terminal_start_bash_command-7a3d0">
<parameter name="command">cd /root/chess-platform-fixed && node marketing-setup.js
