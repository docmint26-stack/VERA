# VERA Design System

## Philosophy

VERA's design philosophy combines:
- **Linear**: Interface precision and clarity
- **Notion**: Simplicity and information organization
- **Stripe**: Professional layout and trust
- **Framer**: Refined product presentation
- **Vercel**: Technical polish

Result: A premium, original design language that is both sophisticated and approachable.

## Core Principles

1. **White-first visual design** - Clean, spacious interfaces
2. **Strong information hierarchy** - Clear content organization
3. **Clean, meaningful whitespace** - Breathing room without waste
4. **Beautiful typography** - Excellent readability
5. **Restrained use of color** - Premium feel through subtle color
6. **Premium-looking cards and surfaces** - Elevated, professional appearance
7. **Microinteractions** - Subtle feedback on user actions
8. **Accessibility throughout** - Inclusive design
9. **Excellent mobile usability** - Mobile-first approach
10. **No unnecessary complexity** - Simple, intuitive interfaces

## Color System

### Semantic Tokens (CSS Variables)

#### Surfaces
```css
--background: #ffffff
--surface: #f8fafc
--surface-elevated: #f3f5f9
--surface-sunken: #f1f5f9
--overlay: rgb(15 23 42 / 0.45)
```

#### Text
```css
--foreground: #111827
--muted-foreground: #64748b
--subtle-foreground: #94a3b8
--foreground-inverse: #ffffff
```

#### Brand
```css
--brand: #635bff          /* VERA Purple */
--brand-hover: #5148e8
--brand-active: #4338ca
--brand-soft: #f0eeff
--brand-soft-hover: #e6e3ff
--brand-foreground: #ffffff
--brand-ring: rgb(99 91 255 / 0.35)
```

#### Status
```css
--success: #16a34a
--success-soft: #ecfdf3
--warning: #d97706
--warning-soft: #fff7ed
--error: #dc2626
--error-soft: #fef2f2
--info: #0284c7
--info-soft: #f0f9ff
```

#### Borders
```css
--border: #e5e7eb
--border-strong: #d1d5db
--divider: #eef1f5
```

### Verification Status Palette
```css
--status-submitted: #64748b
--status-submitted-soft: #f1f5f9
--status-assessed: #0284c7
--status-assessed-soft: #f0f9ff
--status-corroborated: #7c3aed
--status-corroborated-soft: #f5f3ff
--status-verified: #16a34a
--status-verified-soft: #ecfdf3
--status-rejected: #dc2626
--status-rejected-soft: #fef2f2
--status-revoked: #b91c1c
--status-revoked-soft: #fef2f2
--status-expired: #d97706
--status-expired-soft: #fff7ed
```

### Chart Colors
```css
--chart-1: #635bff
--chart-2: #16a34a
--chart-3: #d97706
--chart-4: #0284c7
--chart-5: #a855f7
```

### Usage Guidelines

- **Do NOT hardcode colors** in components - use semantic tokens
- **Brand color** (#635BFF) should be used sparingly for primary actions
- **Success** green for positive confirmations
- **Warning** orange for cautions and notices
- **Error** red for failures and critical issues
- **Info** blue for informational messages

## Typography

### Font Families

#### English (Primary)
- **Sans-serif**: Geist (primary), Inter (fallback)
- **Monospace**: Geist Mono

#### Bengali
- **Sans-serif**: Hind Siliguri
- **Fallback**: Geist, system sans-serif

#### CSS Variables
```css
--font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, ...
--font-mono: var(--font-geist-mono), ui-monospace, ...
--font-bn: var(--font-bn-sans), var(--font-geist-sans), ...
```

### Responsive Type Scale

#### Display Headings
- `text-h1`: 2.25rem (36px) / 2.5rem (40px) / 3rem (48px)
- `text-h2`: 1.875rem (30px) / 2rem (32px) / 2.25rem (36px)
- `text-h3`: 1.5rem (24px) / 1.625rem (26px) / 1.875rem (30px)

#### Section Headings
- `text-h4`: 1.25rem (20px) / 1.375rem (22px)
- `text-h5`: 1.125rem (18px)
- `text-h6`: 1rem (16px)

#### Body Text
- `text-base`: 1rem (16px)
- `text-sm`: 0.875rem (14px)
- `text-xs`: 0.75rem (12px)

#### Special
- `text-lead`: 1.125rem (18px) / 1.25rem (20px) - larger, relaxed
- `text-overline`: 0.6875rem (11px) - uppercase, tracking-wide

### Font Weights
- Regular: 400
- Medium: 500
- Semi-bold: 600
- Bold: 700

### Line Heights
- Headings: 1.2 - 1.3 (tight)
- Body: 1.5 - 1.7 (comfortable)
- Large text: 1.4 - 1.6

## Spacing System

### Spacing Scale (rem-based)
```css
/* 4px increments for consistency */
0   = 0
px  = 1px (for borders)
0.5 = 2px
1   = 4px
1.5 = 6px
2   = 8px
2.5 = 10px
3   = 12px
3.5 = 14px
4   = 16px
5   = 20px
6   = 24px
7   = 28px
8   = 32px
9   = 36px
10  = 40px
11  = 44px
12  = 48px
14  = 56px
16  = 64px
20  = 80px
24  = 96px
28  = 112px
32  = 128px
```

### Layout Dimensions
- **Sidebar width**: 256px (16rem)
- **Sidebar collapsed**: 64px (4rem)
- **Topbar height**: 64px (4rem)
- **Bottom nav height**: 72px (4.5rem)
- **Container max-width**: 1200px (75rem)
- **Page container**: 1152px (72rem)

### Component Spacing
- **Card padding**: 20px (1.25rem) / 24px (1.5rem)
- **Button padding**: 12-24px horizontal, 8-12px vertical
- **Form field padding**: 12-16px
- **Gap sizes**: 8px (0.5rem), 12px (0.75rem), 16px (1rem), 24px (1.5rem)

## Shadows & Borders

### Shadows (Subtle & Restrained)
```css
--shadow-xs: 0 1px 2px rgb(15 23 42 / 0.04)
--shadow-sm: 0 1px 3px rgb(15 23 42 / 0.06), 0 1px 2px rgb(15 23 42 / 0.04)
--shadow-md: 0 4px 12px rgb(15 23 42 / 0.06), 0 1px 3px rgb(15 23 42 / 0.04)
--shadow-lg: 0 12px 32px rgb(15 23 42 / 0.08), 0 2px 8px rgb(15 23 42 / 0.04)
--shadow-brand: 0 8px 24px rgb(99 91 255 / 0.24)
```

### Border Radius
```css
--radius-xs: 4px
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 24px
--radius-2xl: 32px
```

### Usage
- **Cards**: `--radius-md` (12px)
- **Buttons**: `--radius-sm` (8px)
- **Input fields**: `--radius-sm` (8px)
- **Dialogs/Modals**: `--radius-lg` (16px)
- **Hero surfaces**: `--radius-xl` (24px) or `--radius-2xl` (32px)
- **Icons/avatars**: `--radius-full` (9999px)

### Borders
- **Default**: 1px solid `--border` (#e5e7eb)
- **Strong**: 1px solid `--border-strong` (#d1d5db)
- **Dividers**: 1px solid `--divider` (#eef1f5)
- **Brand**: 2px solid `--brand` (#635bff)

## Theming

### Light Mode (Default)
- Background: White (#ffffff)
- Text: Dark (#111827)
- Surfaces: Light grays (#f8fafc, #f3f5f9)

### Dark Mode
- Background: Deep dark (#0b0d12 or #111827)
- Text: Light (#ffffff, #f8fafc)
- Surfaces: Darker grays (#1e293b, #334155)

### Implementation
- Uses `next-themes` for theme switching
- CSS variables automatically adapt
- Manual theme selection + system preference detection
- No flash of wrong theme on initial load
- Persists in local storage under `vera-theme`

### Theme Colors
```css
/* Dark mode overrides */
[data-theme="dark"] {
  --background: #0b0d12;
  --surface: #111827;
  --surface-elevated: #1e293b;
  --foreground: #f8fafc;
  --muted-foreground: #94a3b8;
  /* ... other overrides */
}
```

## Component Library

### shadcn/ui Components
VERA uses a modified version of shadcn/ui with custom styling:
- Button (primary, secondary, ghost, etc.)
- Input
- Card
- Badge
- Alert
- Dialog
- Dropdown Menu
- Select
- Checkbox
- Switch
- Tabs
- Toast
- Progress
- Scroll Area
- Separator
- Label
- Popover
- Accordion
- Tooltip

### Custom VERA Components
- **EmptyState** - Consistent empty states
- **PageHeader** - Page-level headers
- **PageContainer** - Consistent page width
- **DemoBadge** - Integration-pending indicator
- **Section** - Marketing page sections
- **IntegrationPending** - Backend integration notice

## Brand Identity

### Logo
- **Wordmark**: "VERA" with custom styling
- **Symbol**: Geometric V or verification mark
- **Variants**: Horizontal, icon-only, light/dark background
- **Favicon**: SVG favicon with VERA mark

### Colors
- **Primary**: #635BFF (VERA Purple)
- **Secondary**: Used for supporting actions
- **Accent**: For highlights and emphasis

### Voice & Tone
- **Professional yet approachable**
- **Clear and concise**
- **Trustworthy and honest**
- **Never condescending**
- **Explain complex concepts simply**

## Accessibility

### Color Contrast
- All text meets WCAG 2.2 AA contrast requirements
- Primary text: 21:1 ratio (black on white)
- Secondary text: 7:1 ratio minimum
- Interactive elements: 4.5:1 ratio minimum

### Typography
- Font sizes: Minimum 16px for body text
- Line heights: Comfortable for readability
- Letter spacing: Normal, not compressed

### Interactive Elements
- Touch targets: Minimum 44x44px on mobile
- Focus indicators: Visible on all interactive elements
- Keyboard navigation: Full support
- Screen reader: Proper ARIA labels and roles

## Responsive Design

### Breakpoints
```css
/* Mobile-first approach */
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Responsive Strategies
- **Mobile**: Stacked layouts, full-width elements
- **Tablet**: 2-column grids, expanded navigation
- **Desktop**: Multi-column layouts, sidebar navigation
- **Large Desktop**: Maximum width constraints, spacious layouts

### Mobile-Specific Features
- Bottom navigation bar (primary actions)
- Touch-friendly buttons and inputs
- Safe area insets support
- Optimized for on-screen keyboards
- Swipe gestures where appropriate

## Best Practices

### Do
- Use semantic tokens for colors and spacing
- Follow the responsive type scale
- Use consistent border radii
- Respect reduced motion preferences
- Provide accessible alternatives
- Use proper heading hierarchy
- Label all form inputs
- Provide clear error messages

### Don't
- Hardcode colors in components
- Use arbitrary spacing values
- Create custom shadows (use defined tokens)
- Use excessive animation
- Hide focus indicators
- Use color alone to convey meaning
- Use tiny text (< 14px)
- Use horizontal scrolling

## Design Resources

- **Figma File**: (To be created)
- **Color Palette**: Defined in globals.css
- **Typography Scale**: Defined in globals.css
- **Component Library**: src/components/ui/
- **Icons**: Lucide React
- **Images**: Optimized via Next.js Image

## Version History

- **v1.0**: Initial design system (Phase 1)
