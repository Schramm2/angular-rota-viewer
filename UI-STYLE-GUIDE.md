# Rota Viewer UI Style Guide

## Overview

This style guide documents the design system for the Rota Viewer Angular application. It provides guidelines for maintaining consistency across all UI components and ensures a cohesive, professional user experience.

## Design Philosophy

- **Clean & Modern**: Emphasis on whitespace, clear hierarchy, and uncluttered layouts
- **Professional**: Suitable for business environments with sophisticated visual language  
- **Accessible**: WCAG 2.1 AA compliant with proper contrast ratios and keyboard navigation
- **Responsive**: Mobile-first approach that scales elegantly across all device sizes
- **Consistent**: Systematic approach using design tokens for predictable user experience

## Design Tokens

### Color System

#### Primary Colors
```scss
--color-primary-500: #3f51b5  // Main brand color
--color-primary-600: #3949ab  // Darker variant
--interactive-primary: var(--color-primary-500)
--interactive-primary-hover: var(--color-primary-600)
```

#### Secondary Colors  
```scss
--color-secondary-500: #e91e63  // Accent color
--color-secondary-600: #d81b60  // Darker variant
```

#### Semantic Colors
```scss
--status-success: #4caf50
--status-warning: #ff9800  
--status-error: #f44336
--status-info: #2196f3
```

#### Surface & Text Colors (Theme-aware)
```scss
// Light Theme
--surface-background: #fafafa
--surface-primary: #ffffff
--surface-secondary: #f5f5f5
--text-primary: #212121
--text-secondary: #757575
--text-tertiary: #9e9e9e

// Dark Theme  
--surface-background: #0a0a0a
--surface-primary: #1a1a1a
--surface-secondary: #2a2a2a
--text-primary: #ffffff
--text-secondary: #e0e0e0
--text-tertiary: #b0b0b0
```

### Typography Scale

#### Font Family
```scss
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
```

#### Font Sizes
```scss
--font-size-xs: 0.75rem    // 12px - Labels, metadata
--font-size-sm: 0.875rem   // 14px - Body text, descriptions  
--font-size-base: 1rem     // 16px - Default body text
--font-size-lg: 1.125rem   // 18px - Subheadings
--font-size-xl: 1.25rem    // 20px - Card titles
--font-size-2xl: 1.5rem    // 24px - Section headings
--font-size-3xl: 1.875rem  // 30px - Page titles
--font-size-4xl: 2.25rem   // 36px - Hero text, KPI values
```

#### Font Weights
```scss
--font-weight-normal: 400   // Body text
--font-weight-medium: 500   // Emphasized text
--font-weight-semibold: 600 // Subheadings
--font-weight-bold: 700     // Headings, important text
```

### Spacing System

Based on 4px grid system:
```scss
--spacing-1: 0.25rem   // 4px
--spacing-2: 0.5rem    // 8px  
--spacing-3: 0.75rem   // 12px
--spacing-4: 1rem      // 16px - Base unit
--spacing-5: 1.25rem   // 20px
--spacing-6: 1.5rem    // 24px
--spacing-8: 2rem      // 32px
--spacing-10: 2.5rem   // 40px
--spacing-12: 3rem     // 48px
```

### Border Radius
```scss
--border-radius-base: 0.25rem  // 4px - Small elements
--border-radius-lg: 0.5rem     // 8px - Buttons, inputs
--border-radius-xl: 0.75rem    // 12px - Cards, panels
--border-radius-2xl: 1rem      // 16px - Large containers
--border-radius-full: 9999px   // Circular elements
```

### Shadows
```scss
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05)     // Subtle elements
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1)      // Cards at rest
--shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.1) // Elevated cards
--shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1) // Hover states
--shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1) // Modals, dropdowns
```

### Transitions
```scss
--transition-fast: 150ms ease-in-out    // Micro-interactions
--transition-normal: 250ms ease-in-out  // Default transitions  
--transition-slow: 350ms ease-in-out    // Complex animations
```

## Component Patterns

### Cards

#### Basic Card Structure
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Title</h3>
    <p class="card-subtitle">Subtitle</p>
  </div>
  <div class="card-content">
    <!-- Content -->
  </div>
</div>
```

#### Styling Guidelines
- Use `--border-radius-xl` (12px) for card borders
- Apply `--shadow-sm` at rest, `--shadow-md` on hover
- 2px subtle transform on hover: `translateY(-2px)`
- Border: `1px solid var(--border-secondary)`

### KPI Cards

#### Structure
```html
<div class="kpi-card">
  <div class="kpi-content">
    <div class="kpi-icon-wrapper">
      <mat-icon class="kpi-icon">icon_name</mat-icon>
    </div>
    <div class="kpi-details">
      <div class="kpi-value">123</div>
      <div class="kpi-label">Metric Name</div>
      <div class="kpi-trend positive">
        <mat-icon>trending_up</mat-icon>
        <span>+5%</span>
      </div>
    </div>
  </div>
</div>
```

#### Design Specifications
- Icon wrapper: 56x56px with `--border-radius-xl`
- Value text: `--font-size-4xl` with `--font-weight-bold`
- Trend indicators: Green (positive), Red (negative), Gray (neutral)
- Hover effect: Scale icon 1.1x, change background to primary color

### Buttons

#### Hierarchy
1. **Primary**: Filled with primary color - main actions
2. **Secondary**: Stroked with primary border - secondary actions  
3. **Tertiary**: Text only - subtle actions

#### Specifications
- Border radius: `--border-radius-lg` (8px)
- Font weight: `--font-weight-medium`
- Padding: `--spacing-2` `--spacing-4`
- Hover: 1px upward transform + shadow

### Form Fields

#### Styling
- Appearance: `outline` for consistency
- Border radius: `--border-radius-lg`
- Focus state: 2px border with `--border-focus` color
- Label color: `--text-secondary`, focused: `--interactive-primary`

### Status Indicators

#### Chips/Badges
```html
<mat-chip class="status-chip success">
  <mat-icon matChipAvatar>check</mat-icon>
  Success
</mat-chip>
```

#### Color Mapping
- Success: Green background with darker green text
- Warning: Orange background with darker orange text  
- Error: Red background with darker red text
- Info: Blue background with darker blue text

## Layout Patterns

### Page Structure
```html
<div class="page-container">
  <!-- Page Header -->
  <div class="page-header">
    <div class="header-content">
      <div class="header-title">
        <mat-icon class="page-icon">icon</mat-icon>
        <h1>Page Title</h1>
      </div>
      <p class="header-subtitle">Description</p>
    </div>
  </div>
  
  <!-- Controls Panel -->
  <div class="controls-panel">
    <!-- Form controls -->
  </div>
  
  <!-- Content Sections -->
  <div class="section">
    <div class="section-container">
      <div class="section-header">
        <mat-icon class="section-icon">icon</mat-icon>
        <h2 class="section-title">Section Title</h2>
        <div class="section-meta">Metadata</div>
      </div>
      <!-- Section content -->
    </div>
  </div>
</div>
```

### Container System
- `.section-container`: Max-width 1200px, centered with responsive padding
- Padding: `--spacing-6` on desktop, `--spacing-4` on tablet, `--spacing-2` on mobile

### Grid Systems
- KPI Grid: `repeat(auto-fit, minmax(280px, 1fr))`
- Chart Grid: 1 column mobile, 2 columns desktop
- Summary Grid: `repeat(auto-fit, minmax(200px, 1fr))`

## Responsive Design

### Breakpoints
```scss
--breakpoint-sm: 640px   // Mobile
--breakpoint-md: 768px   // Tablet
--breakpoint-lg: 1024px  // Desktop
--breakpoint-xl: 1280px  // Large desktop
```

### Mobile-First Approach
1. Design for mobile first (320px+)
2. Enhance for tablet (768px+)  
3. Optimize for desktop (1024px+)

### Responsive Patterns
- Stack cards vertically on mobile
- Reduce padding and font sizes appropriately
- Hide non-essential elements (export buttons, decorative icons)
- Simplify navigation (icon-only on mobile)

## Accessibility Guidelines

### Color Contrast
- Text on background: Minimum 4.5:1 ratio
- Large text (18px+): Minimum 3:1 ratio
- Interactive elements: Maintain contrast in all states

### Focus Management
- Visible focus indicators: 2px solid `--border-focus`
- Logical tab order
- Skip links for screen readers
- Proper ARIA labels and roles

### Keyboard Navigation
- All interactive elements accessible via keyboard
- Enter/Space activation for buttons
- Arrow key navigation where appropriate
- Escape key dismisses overlays

## Animation Guidelines

### Principles
- **Purposeful**: Animations should have clear intent
- **Fast**: Keep durations under 300ms for micro-interactions
- **Respectful**: Honor `prefers-reduced-motion` setting

### Common Patterns
- Hover states: 150ms ease-in-out
- Page transitions: 250ms ease-in-out
- Loading states: Subtle, continuous animations
- Transform on hover: `translateY(-2px)` for cards

### Reduced Motion
```scss
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    transform: none !important;
  }
}
```

## Dark Theme Support

### Implementation
- Use CSS custom properties for all colors
- Provide both light and dark variants
- Automatic detection via `prefers-color-scheme`
- Manual toggle with persistent storage

### Dark Theme Considerations
- Increase shadow opacity for visibility
- Adjust border colors to be more subtle
- Ensure sufficient contrast for all text
- Test all interactive states

## Print Styles

### Optimization
- Hide navigation and interactive elements
- Force light theme colors
- Adjust layout for paper format
- Ensure charts and data remain readable

## Usage Examples

### Creating a New Card Component
```scss
.my-card {
  background-color: var(--surface-primary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-all);
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
    border-color: var(--border-primary);
  }
}
```

### Implementing Status Colors
```scss
.status-success {
  color: var(--status-success);
  background-color: var(--status-success-bg);
  border-color: var(--status-success);
}
```

## Maintenance

### Adding New Components
1. Follow established patterns from this guide
2. Use design tokens instead of hardcoded values
3. Test in both light and dark themes
4. Verify accessibility compliance
5. Update this guide with new patterns

### Updating Design Tokens
1. Update values in `design-tokens.scss`
2. Test across all components
3. Verify theme compatibility
4. Update documentation

---

*This style guide should be referenced for all UI development and updated as the design system evolves.*
