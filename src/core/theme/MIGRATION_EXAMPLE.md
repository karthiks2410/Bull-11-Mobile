# Migration Example - Before & After

This document shows a real-world example of migrating a screen from hardcoded values to the theme system.

## 📝 Example: Game Card Component

### ❌ BEFORE - Hardcoded Values

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface GameCardProps {
  title: string;
  totalReturn: number;
  stocks: Array<{ symbol: string; price: number }>;
  onPress: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  title,
  totalReturn,
  stocks,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text
          style={[
            styles.percentage,
            { color: totalReturn > 0 ? '#4CAF50' : '#f44336' }
          ]}
        >
          {totalReturn > 0 ? '+' : ''}{totalReturn.toFixed(2)}%
        </Text>
      </View>

      <View style={styles.stockList}>
        {stocks.map((stock, index) => (
          <View key={index} style={styles.stockItem}>
            <Text style={styles.stockSymbol}>{stock.symbol}</Text>
            <Text style={styles.stockPrice}>₹{stock.price.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.viewDetails}>View Details →</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  percentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stockList: {
    marginBottom: 12,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  stockSymbol: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  stockPrice: {
    fontSize: 16,
    color: '#6B7280',
  },
  viewDetails: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    textAlign: 'right',
  },
});
```

**Problems with this approach:**
- ❌ 13 hardcoded color values
- ❌ 6 hardcoded font sizes
- ❌ 5 hardcoded spacing values
- ❌ Inconsistent with other screens
- ❌ Hard to maintain
- ❌ Difficult to implement dark mode
- ❌ No type safety for design tokens

---

### ✅ AFTER - Using Theme System

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme, getPerformanceColor } from '@/src/core/theme';

interface GameCardProps {
  title: string;
  totalReturn: number;
  stocks: Array<{ symbol: string; price: number }>;
  onPress: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  title,
  totalReturn,
  stocks,
  onPress,
}) => {
  const performanceColor = getPerformanceColor(totalReturn);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.percentage, { color: performanceColor }]}>
          {totalReturn > 0 ? '+' : ''}{totalReturn.toFixed(2)}%
        </Text>
      </View>

      <View style={styles.stockList}>
        {stocks.map((stock, index) => (
          <View key={index} style={styles.stockItem}>
            <Text style={styles.stockSymbol}>{stock.symbol}</Text>
            <Text style={styles.stockPrice}>₹{stock.price.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.viewDetails}>View Details →</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.spacing.borderRadius.base,
    padding: theme.spacing.padding.card,
    marginBottom: theme.spacing.margin.betweenCards,
    ...theme.spacing.shadows.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.spacing.md,
  },
  title: {
    ...theme.typography.textStyles.h4,
    color: theme.colors.text.primary,
  },
  percentage: {
    ...theme.typography.textStyles.bodyLarge,
    fontWeight: theme.typography.fontWeight.bold,
  },
  stockList: {
    marginBottom: theme.spacing.spacing.md,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.spacing.sm,
    borderBottomWidth: theme.spacing.borderWidth.hairline,
    borderBottomColor: theme.colors.border.light,
  },
  stockSymbol: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  stockPrice: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
  },
  viewDetails: {
    ...theme.typography.textStyles.bodySmall,
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'right',
  },
});
```

**Benefits of theme system:**
- ✅ Zero hardcoded values
- ✅ Semantic naming (colors.text.primary vs #1F2937)
- ✅ Consistent with other screens
- ✅ Easy to maintain (change once, update everywhere)
- ✅ Ready for dark mode
- ✅ Type safety with autocomplete
- ✅ Helper function for performance color
- ✅ Follows design system principles

---

## 📊 Side-by-Side Comparison

| Aspect | Before | After |
|--------|--------|-------|
| **Hardcoded Colors** | 13 | 0 |
| **Hardcoded Sizes** | 11 | 0 |
| **Lines of Code** | ~95 | ~85 |
| **Maintainability** | Low | High |
| **Consistency** | None | Guaranteed |
| **Type Safety** | None | Full |
| **Dark Mode Ready** | No | Yes |
| **Design System** | No | Yes |

---

## 🔄 Step-by-Step Migration Process

### Step 1: Import Theme

```diff
+ import { theme, getPerformanceColor } from '@/src/core/theme';
```

### Step 2: Replace Colors

```diff
- backgroundColor: '#FFFFFF',
+ backgroundColor: theme.colors.background.paper,

- color: '#1F2937',
+ color: theme.colors.text.primary,

- borderBottomColor: '#E5E7EB',
+ borderBottomColor: theme.colors.border.light,
```

### Step 3: Replace Typography

```diff
- fontSize: 20,
- fontWeight: '600',
- color: '#1F2937',
+ ...theme.typography.textStyles.h4,
+ color: theme.colors.text.primary,
```

### Step 4: Replace Spacing

```diff
- padding: 16,
+ padding: theme.spacing.padding.card,

- marginBottom: 12,
+ marginBottom: theme.spacing.spacing.md,

- borderRadius: 8,
+ borderRadius: theme.spacing.borderRadius.base,
```

### Step 5: Replace Shadows

```diff
- shadowColor: '#000',
- shadowOffset: { width: 0, height: 2 },
- shadowOpacity: 0.1,
- shadowRadius: 4,
- elevation: 2,
+ ...theme.spacing.shadows.base,
```

### Step 6: Use Helper Functions

```diff
- { color: totalReturn > 0 ? '#4CAF50' : '#f44336' }
+ { color: getPerformanceColor(totalReturn) }
```

---

## 🎯 More Examples

### Button Component

#### Before
```typescript
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

#### After
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

---

### Input Field

#### Before
```typescript
const styles = StyleSheet.create({
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
});
```

#### After
```typescript
const styles = StyleSheet.create({
  input: {
    ...theme.typography.textStyles.body,
    backgroundColor: theme.colors.background.paper,
    borderWidth: theme.spacing.borderWidth.thin,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.spacing.borderRadius.base,
    padding: theme.spacing.padding.input,
    color: theme.colors.text.primary,
  },
  label: {
    ...theme.typography.textStyles.label,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.spacing.sm,
  },
});
```

---

### Modal Header

#### Before
```typescript
const styles = StyleSheet.create({
  modalHeader: {
    backgroundColor: '#FF9800',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
```

#### After
```typescript
const styles = StyleSheet.create({
  modalHeader: {
    backgroundColor: theme.colors.secondary.main,
    padding: theme.spacing.padding.modalHeader,
    borderTopLeftRadius: theme.spacing.borderRadius.md,
    borderTopRightRadius: theme.spacing.borderRadius.md,
  },
  modalTitle: {
    ...theme.typography.textStyles.h4,
    color: theme.colors.secondary.contrast,
  },
});
```

---

## 💡 Pro Tips

### 1. Use Semantic Names

```typescript
// ❌ Bad - Not semantic
backgroundColor: theme.colors.success.main  // for a card background

// ✅ Good - Semantic meaning
backgroundColor: theme.colors.background.paper
```

### 2. Combine Styles When Needed

```typescript
// ✅ Combine theme styles with custom overrides
<Text style={[
  theme.typography.textStyles.body,
  { textAlign: 'center', textTransform: 'uppercase' }
]}>
  Custom Text
</Text>
```

### 3. Use Helper Functions

```typescript
// ❌ Bad - Complex conditional logic
color: percentage > 5 ? '#2E7D32' :
       percentage > 2 ? '#4CAF50' :
       percentage > 0 ? '#66BB6A' : '#6B7280'

// ✅ Good - Use helper function
color: getPerformanceColor(percentage)
```

### 4. Leverage TypeScript Autocomplete

```typescript
// Just type "theme." and let autocomplete guide you
theme. // → colors, typography, spacing
theme.colors. // → primary, secondary, success, etc.
theme.typography.textStyles. // → h1, h2, body, etc.
```

---

## 📈 Migration Checklist

When migrating a screen, follow this checklist:

- [ ] Import theme at the top
- [ ] Replace all color values with `theme.colors.*`
- [ ] Replace font sizes/weights with `theme.typography.textStyles.*`
- [ ] Replace padding/margin with `theme.spacing.*`
- [ ] Replace border radius with `theme.spacing.borderRadius.*`
- [ ] Replace shadows with `theme.spacing.shadows.*`
- [ ] Use helper functions for dynamic colors
- [ ] Test visual consistency
- [ ] Remove any remaining hardcoded values
- [ ] Update any inline styles to use theme

---

## 🎓 Learning Path

1. **Start Small**: Migrate a simple component first (button, card)
2. **Reference Guide**: Keep QUICK_REFERENCE.md open
3. **Use Examples**: Copy patterns from USAGE_EXAMPLES.md
4. **Leverage Autocomplete**: Let TypeScript guide you
5. **Be Consistent**: If one button uses theme, all buttons should
6. **Ask Questions**: Check documentation when unsure

---

## 📚 Resources

- **Full Documentation**: `/src/core/theme/README.md`
- **Usage Examples**: `/src/core/theme/USAGE_EXAMPLES.md`
- **Quick Reference**: `/src/core/theme/QUICK_REFERENCE.md`
- **Implementation Guide**: `/src/core/theme/IMPLEMENTATION_SUMMARY.md`

---

**Result**: Cleaner, more maintainable code that follows design system principles and is ready for future enhancements like dark mode.
