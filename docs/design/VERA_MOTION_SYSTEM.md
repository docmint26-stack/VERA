# VERA Motion System

## Philosophy

VERA's motion system is inspired by Jitter and designed to provide:
- **Purposeful animations** - Every animation serves a functional purpose
- **Subtle and restrained** - No distracting or unnecessary motion
- **Accessible** - Respects user preferences and reduced motion settings
- **Performant** - Uses efficient CSS transforms and opacity
- **Consistent** - Uniform timing and easing across the application

## Motion Tokens

Defined in `src/app/globals.css`:

### Timing
```css
--duration-micro: 150ms    /* Microinteractions (button press, toggle) */
--duration-fast: 220ms     /* Normal transitions (hover, focus) */
--duration-normal: 300ms   /* Panel transitions (dropdown, modal) */
--duration-slow: 400ms     /* Entrance choreography (page load) */
```

### Easing
```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1)           /* Fast out */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)       /* Standard */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)    /* Spring-like */
```

### Application
- **Microinteractions**: 120-200ms
- **Normal transitions**: 200-300ms
- **Panel transitions**: 250-400ms
- **Entrance choreography**: 350-600ms

## Reduced Motion Support

All motion components respect the user's `prefers-reduced-motion` preference:

```tsx
import { usePrefersReducedMotion } from "@/components/motion/motion-pref";

function MyComponent() {
  const reduced = usePrefersReducedMotion();
  
  return (
    <motion.div
      animate={reduced ? {} : { opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.3 }}
    >
      Content
    </motion.div>
  );
}
```

## Motion Components

All motion components are located in `src/components/motion/`.

### 1. AnimatedLogo
**File**: `animated-logo.tsx`

Props:
- `className?`: string - Additional CSS classes
- `onComplete?`: () => void - Callback when animation finishes

Features:
- SVG stroke animation forming VERA geometric mark
- Smooth transition to wordmark reveal
- Respects reduced motion

Usage:
```tsx
<AnimatedLogo className="h-10 w-10" />
```

### 2. SplashScreen
**File**: `splash-screen.tsx`

Props:
- None (uses internal state)

Features:
- 1-2 second visual sequence
- White background
- VERA mark forms via SVG animation
- Subtle verification pulse
- Smooth transition into application
- Can be skipped
- Static logo fallback

### 3. RevealOnScroll
**File**: `reveal-on-scroll.tsx`

Props:
- `children`: React.ReactNode
- `className?`: string
- `delay?`: number - Animation delay in ms
- `threshold?`: number - Intersection threshold (default: 0.1)
- `once?`: boolean - Only animate once (default: true)

Features:
- Reveals content when it enters viewport
- Configurable delay
- Works with Intersection Observer
- Fallback for non-supporting browsers

Usage:
```tsx
<RevealOnScroll delay={100}>
  <Card>Content to reveal</Card>
</RevealOnScroll>
```

### 4. AnimatedButton
**File**: `animated-button.tsx`

Props:
- `children`: React.ReactNode
- `variant?`: Button variant
- `className?`: string
- `onClick?`: () => void
- All standard button props

Features:
- Hover elevation
- Press feedback
- Loading states
- Icon animations

### 5. MorphingIcon
**File**: `morphing-icon.tsx`

Props:
- `icon`: LucideIcon - Primary icon
- `altIcon`: LucideIcon - Alternate icon
- `isActive`: boolean - Which icon to show
- `className?`: string

Features:
- Smooth morph between two icons
- Uses SVG path morphing
- Size transitions

### 6. AnimatedSearch
**File**: `animated-search.tsx`

Props:
- `value`: string
- `onChange`: (value: string) => void
- `placeholder?`: string
- `className?`: string

Features:
- Expands on focus
- Search icon animation
- Clear button animation
- Smooth width transitions

### 7. AnimatedTabs
**File**: `animated-tabs.tsx`

Props:
- `items`: Array of tab items
- `activeIndex`: number
- `onChange`: (index: number) => void
- `className?`: string

Features:
- Active tab indicator animation
- Tab content transitions
- Keyboard navigation

### 8. AnimatedCounter
**File**: `animated-counter.tsx`

Props:
- `value`: number - Current value
- `target`: number - Target value
- `duration?`: number - Animation duration in ms
- `className?`: string
- `formatter?`: (value: number) => string

Features:
- Counts from current to target value
- Easing support
- Number formatting support
- Respects reduced motion

### 9. ProgressRing
**File**: `progress-ring.tsx`

Props:
- `value`: number - Current percentage (0-100)
- `size?`: number - Ring size in pixels (default: 48)
- `strokeWidth?`: number - Stroke width (default: 4)
- `className?`: string
- `showValue?`: boolean - Show percentage text

Features:
- Circular progress visualization
- SVG-based for smooth rendering
- Color transitions
- Label animation

### 10. SuccessCheckmark
**File**: `success-checkmark.tsx`

Props:
- `className?`: string
- `size?`: number - Checkmark size

Features:
- Draws checkmark with stroke animation
- Bounce effect
- Green color (success state)
- Respects reduced motion

### 11. ToastNotification
**File**: `toast.tsx`

Exports:
- `ToastNotification` - Component
- `useToast` - Hook to trigger toasts
- `ToastProvider` - Context provider

Props for ToastNotification:
- `id`: string - Unique identifier
- `title`: string
- `message`: string
- `variant`: "success" | "info" | "warning" | "error"
- `duration?`: number - Auto-dismiss time in ms
- `onDismiss?`: () => void

Features:
- Slide-in animation
- Auto-dismiss
- Manual dismiss
- Multiple toasts stacking
- Rich content support

Usage:
```tsx
const { toast } = useToast();

toast.success("Success!", "Your action was completed");
toast.error("Error", "Something went wrong");
```

### 12. UploadProgress
**File**: `upload-progress.tsx`

Props:
- `progress`: number - Current percentage (0-100)
- `fileName`: string
- `fileSize?`: number - File size in bytes
- `status?`: "uploading" | "complete" | "error"
- `className?`: string

Features:
- Progress bar animation
- File information display
- Status indicators
- Success/error states

### 13. RewardCoinAnimation (RewardCoin)
**File**: `reward-coin.tsx`

Exports:
- `RewardCoinAnimation` - Main component
- `RewardCoin` - Alias

Props:
- `amount`: number - Points earned
- `className?`: string
- `onComplete?`: () => void

Features:
- Coin spin animation
- Bounce effect
- Point value display
- Success celebration

### 14. VerificationStatusTransition
**File**: `verification-status.tsx`

Exports:
- `VerificationStatusTransition` - Main component
- `VerificationBadge` - Status badge component
- `VerificationStatus` - Type

Props:
- `status`: VerificationStatus
- `previousStatus?`: VerificationStatus - For transition animation
- `className?`: string

Features:
- Status badge with icon
- Color-coded by status
- Smooth transitions between statuses
- Pulse effect on change

Status Types:
- "submitted"
- "awaiting-institution"
- "review-required"
- "ai-assessed"
- "source-corroborated"
- "issuer-verified"
- "rejected"
- "revoked"
- "expired"

### 15. AIThinkingIndicator (AIThinking)
**File**: `ai-thinking.tsx`

Exports:
- `AIThinkingIndicator` - Main component
- `AIThinking` - Alias

Props:
- `className?`: string

Features:
- Pulsing dots animation
- Simulates AI thinking/processing
- Used in chat composer when waiting for response
- Respects reduced motion

### 16. PageTransition
**File**: `page-transition.tsx`

Props:
- `children`: React.ReactNode
- `routeKey`: string - Unique key for the route
- `className?`: string

Features:
- Smooth page transitions
- Fade and slide effects
- Preserves scroll position
- Respects reduced motion

### 17. SidebarTransition
**File**: `sidebar-transition.tsx`

Props:
- `children`: React.ReactNode
- `isOpen`: boolean
- `className?`: string

Features:
- Sidebar expand/collapse animation
- Width transitions
- Smooth easing
- Respects reduced motion

### 18. ModalTransition
**File**: `modal-transition.tsx`

Props:
- `children`: React.ReactNode
- `isOpen`: boolean
- `onClose?`: () => void
- `className?`: string

Features:
- Modal fade-in animation
- Backdrop animation
- Slide-up effect
- Focus trap management
- Keyboard accessibility
- Respects reduced motion

### 19. SkeletonLoader
**File**: `src/components/ui/skeleton.tsx`

Exports:
- `SkeletonLoader` - Alias for Skeleton
- `Skeleton` - Main component
- `SkeletonText` - Text skeleton
- `SkeletonCard` - Card skeleton

Props:
- `className?`: string
- All HTML attributes

Features:
- Shimmering placeholder animation
- Multiple skeleton types
- Accessible (aria-hidden)
- Respects reduced motion

### 20. CommandPalette
**File**: `src/components/app/command-palette.tsx`

Not strictly a motion component, but includes animation features:
- Keyboard-triggered (Cmd/Ctrl+K)
- Modal transition
- Search filtering animation
- Result list animation

## Animation Patterns

### Jitter-Inspired Patterns

VERA adopts several animation patterns from Jitter:

1. **Search Bar Animation**
   - Expands on focus
   - Search icon morphs or slides
   - Clear button appears smoothly

2. **AI Chat Transitions**
   - Messages fade in
   - Typing indicators animate
   - Composer expands for multiline input

3. **Morphing Icons**
   - Icons transform between states
   - Used for expand/collapse, play/pause, etc.

4. **Floating Action Menus**
   - Menu items slide in from button
   - Staggered animations
   - Backdrop fade

5. **Progress Rings**
   - Circular progress with smooth arc
   - Number count-up
   - Color transitions

6. **Success Animations**
   - Checkmark draw animation
   - Bounce effects
   - Confetti-like particles (not implemented - too distracting)

7. **Wallet Transaction Animations**
   - Balance updates with count animation
   - Transaction list item animations

8. **Notification Animations**
   - Slide in from side
   - Stacking notifications
   - Auto-dismiss with fade

9. **Progress Bars**
   - Fill animation
   - Stripe movement
   - Completion celebration

10. **Voice Input Feedback**
    - Waveform visualization
    - Volume meter
    - Recording state indicators

### Custom VERA Patterns

1. **Verification Flow Animation**
   - Multi-step progress visualization
   - Status badge transitions
   - Celebration on completion

2. **Reward Earning Animation**
   - Coin spin and bounce
   - Point counter animation
   - Success feedback

3. **Document Creation Animation**
   - Template preview transitions
   - Editor loading
   - Save status indicators

4. **File Upload Animation**
   - Drag-and-drop area expansion
   - Per-file progress bars
   - Success state transitions

## Best Practices

### Do
- Use `transform` and `opacity` for animations (most performant)
- Keep animations under 400ms for most interactions
- Use easing curves for natural motion
- Respect `prefers-reduced-motion`
- Provide static fallbacks for critical content
- Test animations on low-powered devices

### Don't
- Animate large DOM elements unnecessarily
- Use `left`, `top`, `width`, `height` for animations (use `transform`)
- Create infinite decorative animations
- Block user interaction during animations
- Use animations that cause layout shifts
- Animate content that's being read

### Performance Tips
- Use `will-change` sparingly
- Use `transform: translateZ(0)` to promote to GPU layer
- Avoid animating properties that trigger layout
- Use `AnimatePresence` for exit animations
- Keep animation complexity low on mobile

## Motion Preference System

VERA uses a centralized motion preference system:

```tsx
// components/motion/motion-pref.tsx

export type MotionPreference = "system" | "reduced" | "full";

export function useMotionPreference() {
  return React.useContext(MotionContext);
}

export function usePrefersReducedMotion() {
  return React.useContext(MotionContext).reduced;
}
```

### Usage
```tsx
const reduced = usePrefersReducedMotion();

<motion.div
  animate={reduced ? {} : { opacity: 1, y: 0 }}
  transition={{ duration: reduced ? 0 : 0.3 }}
>
  Content
</motion.div>
```

### Settings
- **System**: Respect OS preference
- **Reduced**: Force reduced motion
- **Full**: Force all animations
- **Storage Key**: `vera-motion`

## Accessibility Considerations

1. **Reduced Motion**: All animations respect `prefers-reduced-motion`
2. **Focus**: Animations don't interfere with focus management
3. **Timing**: Animations are long enough to be perceivable
4. **Content**: No critical information is conveyed only through animation
5. **Control**: Users can skip or dismiss animated content

## Testing

### Manual Testing
- Test animations on different devices
- Test with reduced motion enabled
- Test in low-performance mode (Chrome DevTools)
- Test on mobile devices

### Automated Testing
- Check for animation-related console errors
- Verify motion preference changes work
- Test keyboard navigation during animations

## Future Enhancements

### Phase 2
- More sophisticated transition choreography
- Shared element transitions between pages
- Animated routes with Next.js

### Phase 3
- Custom easing curves library
- Animation presets for common patterns
- Performance monitoring for animations

### Phase 4
- Advanced motion debugging tools
- Animation performance budgets
- Cross-platform motion consistency (native apps)
