# VERA Frontend Architecture

## Overview

VERA's frontend is a modern, production-ready Next.js application built with TypeScript, React, and Tailwind CSS. The architecture follows a feature-oriented structure with clear separation of concerns between UI components, business logic, and data services.

## Tech Stack

### Core Framework
- **Next.js 16.4.6** - React framework with App Router
- **React 19.3.1** - Component library
- **TypeScript 5.x** - Strict type checking
- **Tailwind CSS 4.3.3** - Utility-first styling

### UI & Components
- **shadcn/ui** - Reusable component library
- **Radix UI** - Unstyled primitive components
- **Lucide React** - Icon library

### State Management
- **Zustand** - Global state management
- **React Query (TanStack)** - Server state management
- **React Hook Form + Zod** - Form validation

### Motion & Animation
- **Motion (Framer Motion)** - Animation library
- **Custom motion system** - Jitter-inspired animations

### Testing
- **Vitest** - Unit and component testing
- **React Testing Library** - Component testing utilities
- **Playwright** - End-to-end testing
- **Axe-core** - Accessibility testing

### i18n
- **Custom i18n system** - English and Bangla support

### PWA
- **Service Worker** - Offline caching
- **Web Manifest** - PWA configuration

## Project Structure

```
src/
├── app/                          # Next.js routes
│   ├── (marketing)/              # Public website pages
│   ├── (auth)/                  # Authentication pages
│   ├── app/                     # Application pages
│   ├── u/                       # User profile pages
│   ├── verify/                  # Verification pages
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
│
├── components/                   # Reusable components
│   ├── ui/                      # Base UI components (shadcn/ui)
│   ├── layout/                  # Layout components
│   ├── branding/                # Branding components (logo, marks)
│   ├── motion/                  # Motion and animation components
│   ├── visualization/           # Data visualization components
│   ├── feedback/                # Feedback components (toast, alerts)
│   ├── app/                     # Application-specific components
│   │   ├── modules/             # Feature modules
│   │   └── nav-config.ts        # Navigation configuration
│   ├── auth/                    # Authentication components
│   ├── marketing/              # Marketing site components
│   ├── onboarding/              # Onboarding components
│   ├── i18n/                    # Internationalization components
│   └── providers/               # Context providers
│
├── features/                    # Feature-level components and logic
│   ├── dashboard/
│   ├── ai/
│   ├── documents/
│   ├── vault/
│   ├── passport/
│   ├── achievements/
│   ├── verification/
│   ├── rewards/
│   ├── opportunities/
│   ├── settings/
│   └── admin/
│
├── lib/                         # Utilities and services
│   ├── config/                  # Configuration files
│   ├── constants/               # Application constants
│   ├── utils/                   # Utility functions
│   ├── contracts/               # Type definitions for backend services
│   ├── services/                # Service adapters (Phase 2)
│   ├── validation/              # Validation schemas
│   └── demo-data.ts             # Demo data for Phase 1
│
├── hooks/                       # Custom React hooks
│
├── styles/                      # Additional styles
│
└── i18n/                        # Internationalization dictionaries
```

## Design System

### Design Tokens
VERA uses semantic CSS variables for all design tokens, defined in `src/app/globals.css`:

- **Colors**: Brand, success, warning, error, surfaces, text, borders
- **Typography**: Font families (Geist, Inter, Hind Siliguri for Bangla)
- **Spacing**: Consistent spacing scale
- **Radii**: Border radius tokens
- **Shadows**: Subtle, restrained shadows
- **Motion**: Animation durations and easing curves

### Color Palette
- Primary Brand: `#635BFF` (VERA Purple)
- Brand Hover: `#5148E8`
- Soft Brand: `#F0EEFF`
- Success: `#16A34A`
- Warning: `#D97706`
- Error: `#DC2626`
- Background: `#FFFFFF`
- Surface: `#F8FAFC`

### Typography
- **Sans-serif**: Geist (primary), Inter
- **Monospace**: Geist Mono
- **Bangla**: Hind Siliguri

### Responsive Breakpoints
- Mobile: 320px, 375px
- Tablet: 768px
- Laptop: 1024px
- Desktop: 1440px
- Large Desktop: 1920px+

## Navigation

### Public Routes
- `/` - Homepage
- `/features*` - Feature pages
- `/solutions*` - Solution pages
- `/about` - About page
- `/how-it-works` - How it works
- `/faq` - FAQ
- `/contact` - Contact
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/trust` - Trust & verification
- `/resources` - Resources

### Authentication Routes
- `/signin` - Sign in
- `/signup` - Create account
- `/forgot-password` - Password recovery
- `/verify-email` - Email verification

### Application Routes (require auth)
- `/app` - Dashboard
- `/app/ai` - AI Assistant
- `/app/documents` - Document Studio
- `/app/vault` - File Vault
- `/app/passport` - Professional Passport
- `/app/achievements` - Achievements
- `/app/verification` - Verification
- `/app/rewards` - Rewards
- `/app/opportunities` - Opportunities
- `/app/settings` - Settings
- `/app/help` - Help

### Dynamic Routes
- `/u/[slug]` - User profiles
- `/verify/[id]` - Verification pages

## Motion System

VERA's motion system is inspired by Jitter and provides:

### Motion Tokens (in CSS variables)
- `--duration-micro: 150ms` - Microinteractions
- `--duration-fast: 220ms` - Normal transitions
- `--duration-normal: 300ms` - Panel transitions
- `--duration-slow: 400ms` - Entrance choreography
- `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`
- `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)`
- `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)`

### Motion Components
1. **AnimatedLogo** - Animated VERA logo
2. **SplashScreen** - Premium loading experience
3. **RevealOnScroll** - Scroll-triggered animations
4. **AnimatedButton** - Animated button interactions
5. **MorphingIcon** - Icon morphing animations
6. **AnimatedSearch** - Animated search bar
7. **AnimatedTabs** - Tab switching animations
8. **AnimatedCounter** - Number counting animation
9. **ProgressRing** - Circular progress indicator
10. **SuccessCheckmark** - Checkmark animation
11. **ToastNotification** - Animated toast messages
12. **UploadProgress** - File upload progress
13. **RewardCoinAnimation** - Reward animation
14. **VerificationStatusTransition** - Verification status animation
15. **AIThinkingIndicator** - AI processing animation
16. **PageTransition** - Page transition animations
17. **SidebarTransition** - Sidebar expand/collapse
18. **ModalTransition** - Modal animations
19. **SkeletonLoader** - Loading skeletons

All motion components respect `prefers-reduced-motion` and provide static fallbacks.

## State Management

### Local State
- React `useState` and `useReducer` for component-level state
- Zustand for shared client state (theme, motion preferences, etc.)

### Server State
- React Query for data fetching and caching (Phase 2)
- Typed service contracts for backend integration

### Persistence
- Local storage for non-sensitive preferences
- Session storage for temporary data
- Cloud persistence via backend services (Phase 2+)

## i18n (Internationalization)

VERA supports English and Bangla with a custom i18n system:

- **Languages**: English (`en`), Bangla (`bn`)
- **Provider**: `LanguageProvider` in `components/i18n/language-provider.tsx`
- **Hooks**: `useLanguage()`, `useT()`, `useDictionary()`
- **Storage**: Persists in local storage under `vera-locale`

### Usage
```tsx
import { useT } from "@/components/i18n/language-provider";

function MyComponent() {
  const t = useT();
  return <p>{t("common.welcome")}</p>;
}
```

## PWA (Progressive Web App)

VERA is designed as a mobile-first, installable PWA:

- **Manifest**: `public/manifest.webmanifest`
- **Service Worker**: `public/sw.js`
- **Icons**: Multiple sizes for different devices
- **Offline Support**: Basic offline caching for app shell
- **Installability**: Supports PWA installation on supported browsers
- **Safe Area**: Respects mobile safe area insets
- **Touch Targets**: All interactive elements are touch-friendly

## Accessibility

VERA targets WCAG 2.2 AA compliance:

- **Semantic HTML**: Proper heading hierarchy, landmarks
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Visible focus indicators
- **Screen Readers**: ARIA labels, live regions
- **Reduced Motion**: Respects `prefers-reduced-motion`
- **Color Contrast**: Meets minimum contrast requirements
- **Touch Targets**: Minimum 44x44px for mobile

## Performance

Target metrics for production:
- **Lighthouse Performance**: >= 90
- **Accessibility**: >= 95
- **Best Practices**: >= 95
- **SEO**: >= 95
- **LCP**: <= 2.5s
- **CLS**: <= 0.1
- **INP**: <= 200ms

### Optimization Techniques
- Code splitting with dynamic imports
- Lazy loading of heavy components
- Optimized fonts with `next/font`
- Image optimization with Next.js Image
- Service worker caching
- Partial prefetching
- Cache components

## Testing

### Unit Tests (Vitest)
- Component rendering tests
- Interaction tests
- Utility function tests
- Form validation tests

### E2E Tests (Playwright)
- User journeys across the application
- Authentication flows
- Onboarding experience
- Navigation tests
- Responsive behavior
- Accessibility checks

### Test Coverage
- Public website navigation
- Authentication flows
- Onboarding wizard
- Dashboard interactions
- All major feature modules

## Backend Integration (Phase 2+)

VERA's frontend is designed for easy backend integration with typed service contracts:

### Service Contracts (Phase 2)
- Authentication service
- User profile service
- File storage service
- AI chat service
- Document generation service
- Achievement verification service
- Credential verification service
- Rewards service
- Opportunities service
- Notifications service

### Integration Strategy
- Typed API clients
- Mock implementations for Phase 1
- Service adapters for different backends
- Error handling and loading states
- Optimistic updates where appropriate

## Deployment

VERA is ready for deployment on:
- **Vercel** (recommended)
- **Netlify**
- **AWS**
- **Azure**
- **Any Node.js hosting**

### Build Commands
```bash
npm run dev      # Development server
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
npm run typecheck  # Type checking
npm run test     # Run Vitest
npm run test:e2e # Run Playwright
```

## Future Architecture Plans

### Phase 2
- Backend service integration
- Authentication provider (NextAuth/Clerk)
- Database connection
- Real-time updates

### Phase 3
- AI service integration
- Blockchain verification
- Web3 wallet connectivity
- Advanced analytics

### Phase 4
- Mobile apps (React Native)
- Desktop apps (Tauri/Electron)
- Cross-platform sync
- Offline-first capabilities

## Conclusion

VERA's frontend architecture is designed for:
- **Maintainability**: Clear structure, TypeScript types, documentation
- **Performance**: Optimized builds, lazy loading, efficient rendering
- **Accessibility**: WCAG 2.2 AA compliance
- **Scalability**: Modular features, typed contracts, PWA support
- **User Experience**: Premium design, fluid animations, responsive behavior
