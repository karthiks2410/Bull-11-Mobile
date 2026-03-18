# Theme System - Usage Examples

Real-world examples showing how to use the Bull-11 theme system in different scenarios.

## 📋 Table of Contents

1. [Basic Component Styling](#basic-component-styling)
2. [Text Components](#text-components)
3. [Cards and Containers](#cards-and-containers)
4. [Buttons](#buttons)
5. [Lists](#lists)
6. [Forms and Inputs](#forms-and-inputs)
7. [Gaming UI Elements](#gaming-ui-elements)
8. [Performance Displays](#performance-displays)
9. [Modal/Overlay](#modaloverlay)
10. [Responsive Spacing](#responsive-spacing)

---

## Basic Component Styling

### Simple Screen Layout

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/src/core/theme';

export const SimpleScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Get started with Bull-11</Text>
    </View>
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
    marginBottom: theme.spacing.margin.textBottom,
  },
  subtitle: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
  },
});
```

---

## Text Components

### Heading Hierarchy

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/src/core/theme';

export const HeadingExample = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Heading 1 (32px Bold)</Text>
      <Text style={styles.h2}>Heading 2 (28px Bold)</Text>
      <Text style={styles.h3}>Heading 3 (24px Semibold)</Text>
      <Text style={styles.h4}>Heading 4 (20px Semibold)</Text>
      <Text style={styles.body}>Body text (16px Regular)</Text>
      <Text style={styles.caption}>Caption text (12px Regular)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.padding.screen,
  },
  h1: {
    ...theme.typography.textStyles.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.spacing.md,
  },
  h2: {
    ...theme.typography.textStyles.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.spacing.md,
  },
  h3: {
    ...theme.typography.textStyles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.spacing.md,
  },
  h4: {
    ...theme.typography.textStyles.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.spacing.md,
  },
  body: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.spacing.md,
  },
  caption: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.disabled,
  },
});
```

---

## Cards and Containers

### Standard Card Component

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/src/core/theme';

interface CardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, description, children }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {children}
    </View>
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
  title: {
    ...theme.typography.textStyles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.spacing.sm,
  },
  description: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
  },
});
```

### Elevated Card with Header

```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.spacing.borderRadius.lg,
    overflow: 'hidden',
    ...theme.spacing.shadows.md,
  },
  header: {
    backgroundColor: theme.colors.secondary.main,
    padding: theme.spacing.padding.card,
  },
  headerText: {
    ...theme.typography.textStyles.h4,
    color: theme.colors.secondary.contrast,
  },
  content: {
    padding: theme.spacing.padding.card,
  },
});
```

---

## Buttons

### Primary Button

```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '@/src/core/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading,
  disabled,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.primary.contrast} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.spacing.borderRadius.sm,
    paddingVertical: theme.spacing.spacing.md,
    paddingHorizontal: theme.spacing.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...theme.spacing.shadows.sm,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.background.disabled,
  },
  buttonText: {
    ...theme.typography.textStyles.button,
    color: theme.colors.primary.contrast,
  },
});
```

### Button Variants

```typescript
const styles = StyleSheet.create({
  // Primary button (filled)
  primaryButton: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.spacing.borderRadius.sm,
    paddingVertical: theme.spacing.spacing.md,
    paddingHorizontal: theme.spacing.spacing.xl,
  },

  // Secondary button (outlined)
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: theme.spacing.borderWidth.medium,
    borderColor: theme.colors.primary.main,
    borderRadius: theme.spacing.borderRadius.sm,
    paddingVertical: theme.spacing.spacing.md,
    paddingHorizontal: theme.spacing.spacing.xl,
  },

  // Danger button
  dangerButton: {
    backgroundColor: theme.colors.error.main,
    borderRadius: theme.spacing.borderRadius.sm,
    paddingVertical: theme.spacing.spacing.md,
    paddingHorizontal: theme.spacing.spacing.xl,
  },

  // Success button
  successButton: {
    backgroundColor: theme.colors.success.main,
    borderRadius: theme.spacing.borderRadius.sm,
    paddingVertical: theme.spacing.spacing.md,
    paddingHorizontal: theme.spacing.spacing.xl,
  },
});
```

---

## Lists

### List Item Component

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@/src/core/theme';

interface ListItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  onPress,
  rightElement,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.listItem} onPress={onPress}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightElement && <View style={styles.right}>{rightElement}</View>}
    </Container>
  );
};

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.padding.card,
    borderBottomWidth: theme.spacing.borderWidth.hairline,
    borderBottomColor: theme.colors.border.light,
  },
  content: {
    flex: 1,
  },
  title: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.spacing.xs,
  },
  subtitle: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.secondary,
  },
  right: {
    marginLeft: theme.spacing.spacing.md,
  },
});
```

---

## Forms and Inputs

### Text Input Component

```typescript
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { theme } from '@/src/core/theme';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.hint}
        secureTextEntry={secureTextEntry}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.margin.betweenElements,
  },
  label: {
    ...theme.typography.textStyles.label,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.spacing.sm,
  },
  input: {
    ...theme.typography.textStyles.body,
    backgroundColor: theme.colors.background.paper,
    borderWidth: theme.spacing.borderWidth.thin,
    borderColor: theme.colors.border.light,
    borderRadius: theme.spacing.borderRadius.base,
    padding: theme.spacing.padding.input,
    color: theme.colors.text.primary,
  },
  inputError: {
    borderColor: theme.colors.error.main,
  },
  error: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.error.main,
    marginTop: theme.spacing.spacing.xs,
  },
});
```

---

## Gaming UI Elements

### Rank Badge

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, getRankColor } from '@/src/core/theme';

interface RankBadgeProps {
  rank: 'S' | 'A' | 'B' | 'C' | 'D';
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rank }) => {
  const rankColor = getRankColor(rank);

  return (
    <View style={[styles.badge, { backgroundColor: rankColor }]}>
      <Text style={styles.rankText}>{rank}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    width: 40,
    height: 40,
    borderRadius: theme.spacing.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.spacing.shadows.sm,
  },
  rankText: {
    ...theme.typography.textStyles.h3,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
```

### Performance Indicator

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, getPerformanceColor } from '@/src/core/theme';

interface PerformanceIndicatorProps {
  percentage: number;
  showArrow?: boolean;
}

export const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({
  percentage,
  showArrow = true,
}) => {
  const color = getPerformanceColor(percentage);
  const arrow = percentage > 0 ? '▲' : percentage < 0 ? '▼' : '▬';

  return (
    <View style={styles.container}>
      {showArrow && <Text style={[styles.arrow, { color }]}>{arrow}</Text>}
      <Text style={[styles.percentage, { color }]}>
        {percentage > 0 ? '+' : ''}{percentage.toFixed(2)}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.gap.xs,
  },
  arrow: {
    ...theme.typography.textStyles.body,
    fontWeight: theme.typography.fontWeight.bold,
  },
  percentage: {
    ...theme.typography.textStyles.body,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
```

---

## Performance Displays

### Stock Performance Card

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, getPerformanceColor } from '@/src/core/theme';

interface StockPerformanceProps {
  symbol: string;
  currentPrice: number;
  change: number;
  percentageChange: number;
}

export const StockPerformance: React.FC<StockPerformanceProps> = ({
  symbol,
  currentPrice,
  change,
  percentageChange,
}) => {
  const performanceColor = getPerformanceColor(percentageChange);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.symbol}>{symbol}</Text>
        <Text style={[styles.percentage, { color: performanceColor }]}>
          {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(2)}%
        </Text>
      </View>
      <Text style={styles.price}>₹{currentPrice.toFixed(2)}</Text>
      <Text style={[styles.change, { color: performanceColor }]}>
        {change > 0 ? '+' : ''}₹{change.toFixed(2)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.padding.card,
    borderRadius: theme.spacing.borderRadius.base,
    ...theme.spacing.shadows.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.spacing.sm,
  },
  symbol: {
    ...theme.typography.textStyles.h4,
    color: theme.colors.text.primary,
  },
  percentage: {
    ...theme.typography.textStyles.body,
    fontWeight: theme.typography.fontWeight.bold,
  },
  price: {
    ...theme.typography.textStyles.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.spacing.xs,
  },
  change: {
    ...theme.typography.textStyles.body,
  },
});
```

---

## Modal/Overlay

### Modal Component

```typescript
import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/src/core/theme';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.padding.screen,
  },
  modal: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.spacing.borderRadius.lg,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    ...theme.spacing.shadows.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.padding.modalHeader,
    borderBottomWidth: theme.spacing.borderWidth.hairline,
    borderBottomColor: theme.colors.border.light,
  },
  title: {
    ...theme.typography.textStyles.h3,
    color: theme.colors.text.primary,
  },
  closeButton: {
    ...theme.typography.textStyles.h3,
    color: theme.colors.text.secondary,
  },
  content: {
    padding: theme.spacing.padding.modal,
  },
});
```

---

## Responsive Spacing

### Using Spacing Scale

```typescript
const styles = StyleSheet.create({
  // Compact layout (mobile)
  compactCard: {
    padding: theme.spacing.spacing.sm,    // 8px
    gap: theme.spacing.gap.xs,            // 4px
  },

  // Standard layout
  standardCard: {
    padding: theme.spacing.spacing.base,  // 16px
    gap: theme.spacing.gap.md,            // 12px
  },

  // Spacious layout (tablet)
  spaciousCard: {
    padding: theme.spacing.spacing.xl,    // 24px
    gap: theme.spacing.gap.lg,            // 20px
  },
});
```

---

## Tips and Best Practices

### 1. Combine Styles Efficiently

```typescript
// ✅ Good: Combine theme styles with custom styles
<Text style={[theme.typography.textStyles.body, { textAlign: 'center' }]}>

// ❌ Avoid: Recreating entire style object
<Text style={{ fontSize: 16, fontWeight: '400', textAlign: 'center' }}>
```

### 2. Use Semantic Values

```typescript
// ✅ Good: Semantic meaning
color: theme.colors.text.secondary
backgroundColor: theme.colors.success.main

// ❌ Avoid: Non-semantic usage
color: theme.colors.success.main  // for regular text
```

### 3. Consistent Spacing

```typescript
// ✅ Good: Use spacing scale
padding: theme.spacing.spacing.base  // 16px
margin: theme.spacing.spacing.md     // 12px

// ❌ Avoid: Random values
padding: 17
margin: 13
```

---

Need more examples? Check the theme files directly:
- `/src/core/theme/colors.ts`
- `/src/core/theme/typography.ts`
- `/src/core/theme/spacing.ts`
- `/src/core/theme/index.ts`
