# Bull-11 Theme System

A comprehensive, type-safe theme system for the Bull-11 React Native app, providing centralized design tokens for colors, typography, and spacing.

## 📁 Structure

```
src/core/theme/
├── index.ts        # Main entry point with usage guide
├── colors.ts       # Complete color palette
├── typography.ts   # Font sizes, weights, text styles
├── spacing.ts      # Padding, margin, border radius, shadows
└── README.md       # This file
```

## 🚀 Quick Start

### Basic Import

```typescript
import { theme } from '@/src/core/theme';

// Use in components
<Text style={{ color: theme.colors.text.primary }}>Hello</Text>
<View style={{ padding: theme.spacing.padding.card }}>Content</View>
```

### With StyleSheet

```typescript
import { StyleSheet } from 'react-native';
import { theme } from '@/src/core/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
    padding: theme.spacing.padding.screen,
  },
  title: {
    ...theme.typography.textStyles.h1,
    color: theme.colors.text.primary,
  },
});
```

## 🎨 Colors

### Categories

- **Primary**: iOS blue for main actions (`#007AFF`)
- **Secondary**: Orange for headers and accents (`#FF9800`)
- **Success**: Green for gains and positive actions
- **Error**: Red for losses and errors
- **Warning**: Amber for warnings
- **Info**: Blue for informational content
- **Neutral**: Gray scale (gray50 to gray900)
- **Gaming**: Rank colors, stock visualization colors
- **Admin**: Colors specific to admin interface

### Usage Examples

```typescript
// Primary actions
backgroundColor: theme.colors.primary.main

// Text colors
color: theme.colors.text.primary      // Main text
color: theme.colors.text.secondary    // Secondary text
color: theme.colors.text.disabled     // Disabled state

// Performance-based colors
color: theme.colors.success.main      // Gains
color: theme.colors.error.main        // Losses

// Gaming colors
color: theme.colors.gaming.rankS      // Gold rank (S)
color: theme.colors.gaming.stock1     // Blue stock visualization
```

### Helper Functions

```typescript
import { getPerformanceColor, getRankColor } from '@/src/core/theme';

// Get color based on percentage
const color = getPerformanceColor(5.2);  // Returns appropriate green
const color = getPerformanceColor(-3.1); // Returns appropriate red

// Get rank color
const color = getRankColor('S');  // Returns gold (#FFD700)
```

## ✏️ Typography

### Text Styles (Predefined)

```typescript
// Display styles (large numbers, hero text)
<Text style={theme.typography.textStyles.displayHero}>72px Bold</Text>
<Text style={theme.typography.textStyles.displayLarge}>48px Bold</Text>

// Headings
<Text style={theme.typography.textStyles.h1}>32px Bold</Text>
<Text style={theme.typography.textStyles.h2}>28px Bold</Text>
<Text style={theme.typography.textStyles.h3}>24px Semibold</Text>

// Body text
<Text style={theme.typography.textStyles.body}>16px Regular</Text>
<Text style={theme.typography.textStyles.bodySmall}>14px Regular</Text>

// Captions and labels
<Text style={theme.typography.textStyles.caption}>12px Regular</Text>
<Text style={theme.typography.textStyles.label}>12px Medium</Text>

// Buttons
<Text style={theme.typography.textStyles.button}>16px Semibold</Text>
```

### Individual Values

```typescript
fontSize: theme.typography.fontSize.lg           // 18
fontWeight: theme.typography.fontWeight.bold     // '700'
lineHeight: theme.typography.lineHeight.lg       // 28
letterSpacing: theme.typography.letterSpacing.wide  // 0.4
```

### Combining Styles

```typescript
<Text style={[
  theme.typography.textStyles.body,
  { color: theme.colors.text.primary }
]}>
  Custom text
</Text>
```

## 📏 Spacing

### Spacing Scale (4px base unit)

```typescript
padding: theme.spacing.spacing.xs    // 4px
padding: theme.spacing.spacing.sm    // 8px
padding: theme.spacing.spacing.md    // 12px
padding: theme.spacing.spacing.base  // 16px (default)
padding: theme.spacing.spacing.lg    // 20px
padding: theme.spacing.spacing.xl    // 24px
padding: theme.spacing.spacing['2xl'] // 32px
```

### Semantic Padding

```typescript
padding: theme.spacing.padding.screen       // Screen/container padding
padding: theme.spacing.padding.card         // Card padding
padding: theme.spacing.padding.button       // Button padding
padding: theme.spacing.padding.modal        // Modal padding
```

### Semantic Margin

```typescript
marginBottom: theme.spacing.margin.betweenElements   // 12px
marginBottom: theme.spacing.margin.betweenSections   // 24px
marginBottom: theme.spacing.margin.headingBottom     // 12px
```

### Border Radius

```typescript
borderRadius: theme.spacing.borderRadius.sm    // 4px
borderRadius: theme.spacing.borderRadius.base  // 8px (default)
borderRadius: theme.spacing.borderRadius.lg    // 16px
borderRadius: theme.spacing.borderRadius.full  // 9999 (pills)
```

### Shadows (Elevation)

```typescript
const styles = StyleSheet.create({
  card: {
    ...theme.spacing.shadows.base,  // Standard card shadow
  },
  elevated: {
    ...theme.spacing.shadows.md,    // More elevated shadow
  },
});
```

## 🎯 Best Practices

### ✅ DO

```typescript
// Use theme values
color: theme.colors.primary.main

// Use semantic names
color: theme.colors.text.secondary

// Use predefined text styles
...theme.typography.textStyles.h1

// Use spacing scale
padding: theme.spacing.spacing.base

// Combine styles
style={[theme.typography.textStyles.body, customStyle]}
```

### ❌ DON'T

```typescript
// Hardcode colors
color: '#007AFF'

// Use wrong semantic meaning
color: theme.colors.success.main  // for error text

// Custom font sizes without reason
fontSize: 17  // Use theme.typography.fontSize instead

// Random spacing values
padding: 13  // Use theme.spacing scale (12 or 16)
```

## 🔄 Migration Guide

### Step 1: Import Theme

```typescript
import { theme } from '@/src/core/theme';
```

### Step 2: Replace Colors

```diff
- color: '#007AFF'
+ color: theme.colors.primary.main

- backgroundColor: '#F3F4F6'
+ backgroundColor: theme.colors.background.default
```

### Step 3: Replace Typography

```diff
- fontSize: 16
- fontWeight: 'bold'
+ ...theme.typography.textStyles.body
```

### Step 4: Replace Spacing

```diff
- padding: 16
+ padding: theme.spacing.padding.card

- marginBottom: 24
+ marginBottom: theme.spacing.margin.betweenSections
```

## 📦 Exports

### Main Export

```typescript
import { theme } from '@/src/core/theme';
// Access: theme.colors.*, theme.typography.*, theme.spacing.*
```

### Individual Systems

```typescript
import { colors, typography, spacing } from '@/src/core/theme';
```

### Specific Values

```typescript
import {
  primary,
  textStyles,
  padding,
  borderRadius,
} from '@/src/core/theme';
```

### Helper Functions

```typescript
import {
  getPerformanceColor,
  getSuccessColor,
  getErrorColor,
  getRankColor,
} from '@/src/core/theme';
```

## 🎨 Color Reference

### Primary Colors
- **Primary**: `#007AFF` (iOS Blue)
- **Secondary**: `#FF9800` (Orange)
- **Success**: `#4CAF50` (Green)
- **Error**: `#f44336` (Red)
- **Warning**: `#FFC107` (Amber)
- **Info**: `#2196F3` (Blue)

### Gaming Colors
- **Rank S**: `#FFD700` (Gold)
- **Rank A**: `#4CAF50` (Green)
- **Rank B**: `#2196F3` (Blue)
- **Rank C**: `#FF9800` (Orange)
- **Rank D**: `#f44336` (Red)

### Stock Visualization
- **Stock 1**: `#2196F3` (Blue)
- **Stock 2**: `#9C27B0` (Purple)
- **Stock 3**: `#FF9800` (Orange)
- **Stock 4**: `#00BCD4` (Teal)
- **Stock 5**: `#3F51B5` (Indigo)

## 📱 Platform Support

The theme system works on:
- iOS
- Android
- Web (via Expo)

Platform-specific adjustments are handled automatically (e.g., font families).

## 🔍 TypeScript Support

Full TypeScript support with autocomplete:

```typescript
import type { Theme, Colors, Typography } from '@/src/core/theme';

// Theme type for props
interface Props {
  theme: Theme;
}

// Extract specific types
type PrimaryColor = Colors['primary']['main'];
```

## 📝 Examples

### Card Component

```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.padding.card,
    borderRadius: theme.spacing.borderRadius.base,
    ...theme.spacing.shadows.base,
  },
  title: {
    ...theme.typography.textStyles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.margin.headingBottom,
  },
  description: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
  },
});
```

### Button Component

```typescript
const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.spacing.md,
    paddingHorizontal: theme.spacing.spacing.xl,
    borderRadius: theme.spacing.borderRadius.sm,
    ...theme.spacing.shadows.sm,
  },
  buttonText: {
    ...theme.typography.textStyles.button,
    color: theme.colors.primary.contrast,
  },
});
```

### Performance Display

```typescript
import { getPerformanceColor } from '@/src/core/theme';

const PerformanceText = ({ percentage }: { percentage: number }) => (
  <Text style={{
    ...theme.typography.textStyles.h2,
    color: getPerformanceColor(percentage),
  }}>
    {percentage > 0 ? '+' : ''}{percentage.toFixed(2)}%
  </Text>
);
```

## 🤝 Contributing

When adding new colors or styles:
1. Add to appropriate file (`colors.ts`, `typography.ts`, or `spacing.ts`)
2. Update type definitions
3. Add usage examples in comments
4. Update this README if adding new categories

## 📚 Resources

- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design](https://material.io/design)
- [React Native StyleSheet](https://reactnative.dev/docs/stylesheet)

---

**Note**: This theme system is the foundation for consistent design across the Bull-11 app. Always prefer theme values over hardcoded constants for maintainability and consistency.
