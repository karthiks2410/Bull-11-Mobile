# Theme System Quick Reference

Quick lookup guide for common theme values.

## 🎨 Common Colors

```typescript
import { theme } from '@/src/core/theme';

// Primary Actions
theme.colors.primary.main          // #007AFF

// Text
theme.colors.text.primary          // #1F2937 (dark gray)
theme.colors.text.secondary        // #6B7280 (medium gray)
theme.colors.text.disabled         // #9CA3AF (light gray)

// Backgrounds
theme.colors.background.default    // #F3F4F6 (app background)
theme.colors.background.paper      // #FFFFFF (cards, modals)

// Status
theme.colors.success.main          // #4CAF50 (green)
theme.colors.error.main            // #f44336 (red)
theme.colors.warning.main          // #FFC107 (amber)
theme.colors.info.main             // #2196F3 (blue)

// Gaming
theme.colors.gaming.rankS          // #FFD700 (gold)
theme.colors.gaming.stock1         // #2196F3 (blue)
```

## ✏️ Common Text Styles

```typescript
// Headings
theme.typography.textStyles.h1     // 32px Bold
theme.typography.textStyles.h2     // 28px Bold
theme.typography.textStyles.h3     // 24px Semibold

// Body
theme.typography.textStyles.body   // 16px Regular
theme.typography.textStyles.bodySmall  // 14px Regular

// Small Text
theme.typography.textStyles.caption    // 12px Regular
theme.typography.textStyles.label      // 12px Medium

// Buttons
theme.typography.textStyles.button     // 16px Semibold
```

## 📏 Common Spacing

```typescript
// Spacing Scale
theme.spacing.spacing.xs           // 4px
theme.spacing.spacing.sm           // 8px
theme.spacing.spacing.md           // 12px
theme.spacing.spacing.base         // 16px ⭐ Default
theme.spacing.spacing.lg           // 20px
theme.spacing.spacing.xl           // 24px

// Semantic Padding
theme.spacing.padding.screen       // 16px
theme.spacing.padding.card         // 16px
theme.spacing.padding.button       // 12px

// Border Radius
theme.spacing.borderRadius.sm      // 4px (buttons)
theme.spacing.borderRadius.base    // 8px (cards) ⭐ Default
theme.spacing.borderRadius.lg      // 16px (large cards)
theme.spacing.borderRadius.full    // 9999 (circles)
```

## 🎯 Quick Patterns

### Card

```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.padding.card,
    borderRadius: theme.spacing.borderRadius.base,
    ...theme.spacing.shadows.base,
  },
});
```

### Button

```typescript
const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.spacing.md,
    paddingHorizontal: theme.spacing.spacing.xl,
    borderRadius: theme.spacing.borderRadius.sm,
  },
  buttonText: {
    ...theme.typography.textStyles.button,
    color: theme.colors.primary.contrast,
  },
});
```

### Text Input

```typescript
const styles = StyleSheet.create({
  input: {
    ...theme.typography.textStyles.body,
    backgroundColor: theme.colors.background.paper,
    borderWidth: theme.spacing.borderWidth.thin,
    borderColor: theme.colors.border.light,
    borderRadius: theme.spacing.borderRadius.base,
    padding: theme.spacing.padding.input,
  },
});
```

### List Item

```typescript
const styles = StyleSheet.create({
  listItem: {
    padding: theme.spacing.padding.card,
    borderBottomWidth: theme.spacing.borderWidth.hairline,
    borderBottomColor: theme.colors.border.light,
  },
});
```

## 🔍 Helper Functions

```typescript
import { getPerformanceColor, getRankColor } from '@/src/core/theme';

// Performance-based color
const color = getPerformanceColor(5.2);   // Green
const color = getPerformanceColor(-3.1);  // Red

// Rank color
const color = getRankColor('S');  // Gold
const color = getRankColor('A');  // Green
```

## 📱 Screen Layout Template

```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '@/src/core/theme';

export const ScreenTemplate = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Screen Title</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Card Title</Text>
        <Text style={styles.cardText}>Card content...</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
    padding: theme.spacing.padding.screen,
  },
  title: {
    ...theme.typography.textStyles.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.margin.betweenSections,
  },
  card: {
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.padding.card,
    borderRadius: theme.spacing.borderRadius.base,
    ...theme.spacing.shadows.base,
  },
  cardTitle: {
    ...theme.typography.textStyles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.spacing.sm,
  },
  cardText: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
  },
});
```

## 🎨 Complete Color Palette

| Category | Usage | Value |
|----------|-------|-------|
| **Primary** | Main actions, links | `#007AFF` |
| **Secondary** | Headers, accents | `#FF9800` |
| **Success** | Gains, positive | `#4CAF50` |
| **Error** | Losses, errors | `#f44336` |
| **Warning** | Warnings | `#FFC107` |
| **Info** | Information | `#2196F3` |
| **Background** | App background | `#F3F4F6` |
| **Paper** | Cards, modals | `#FFFFFF` |
| **Text Primary** | Main text | `#1F2937` |
| **Text Secondary** | Secondary text | `#6B7280` |
| **Border Light** | Subtle borders | `#E5E7EB` |

## 📏 Spacing Scale

| Size | Value | Usage |
|------|-------|-------|
| `xs` | 4px | Tight spacing |
| `sm` | 8px | Small gaps |
| `md` | 12px | Medium spacing |
| `base` | 16px | ⭐ Default |
| `lg` | 20px | Large spacing |
| `xl` | 24px | Section spacing |
| `2xl` | 32px | Major sections |

## ✏️ Font Sizes

| Size | Value | Usage |
|------|-------|-------|
| `xs` | 10px | Tiny labels |
| `sm` | 12px | Captions |
| `base` | 14px | Small body |
| `md` | 16px | ⭐ Default body |
| `lg` | 18px | Large body |
| `xl` | 20px | Small heading |
| `2xl` | 24px | Medium heading |
| `3xl` | 28px | Large heading |
| `4xl` | 32px | XL heading |

## 💾 Import Cheatsheet

```typescript
// Full theme
import { theme } from '@/src/core/theme';

// Individual systems
import { colors, typography, spacing } from '@/src/core/theme';

// Specific values
import { primary, textStyles, padding } from '@/src/core/theme';

// Helpers
import { getPerformanceColor, getRankColor } from '@/src/core/theme';
```

---

**Pro Tip**: Use TypeScript autocomplete! Type `theme.` and let your IDE show all available options.
