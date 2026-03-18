/**
 * Bull-11 App Theme System
 * Centralized theme configuration
 *
 * This is the main entry point for the theme system.
 * Import this file to access all theme values.
 *
 * @example
 * import { theme } from '@/src/core/theme';
 *
 * // Access colors
 * const primaryColor = theme.colors.primary.main;
 *
 * // Access typography
 * const headingStyle = theme.typography.textStyles.h1;
 *
 * // Access spacing
 * const cardPadding = theme.spacing.padding.card;
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacingSystem } from './spacing';

/**
 * Main Theme Object
 * Contains all theme values organized by category
 */
export const theme = {
  /**
   * Color Palette
   * Access: theme.colors.primary.main, theme.colors.text.primary, etc.
   */
  colors,

  /**
   * Typography System
   * Access: theme.typography.textStyles.h1, theme.typography.fontSize.lg, etc.
   */
  typography,

  /**
   * Spacing System
   * Access: theme.spacing.padding.card, theme.spacing.borderRadius.base, etc.
   */
  spacing: spacingSystem,
} as const;

/**
 * Type definitions for TypeScript autocompletion
 */
export type Theme = typeof theme;

/**
 * Re-export individual systems for direct imports
 * Allows: import { colors, typography, spacing } from '@/src/core/theme';
 */
export { colors } from './colors';
export { typography } from './typography';
export { spacingSystem as spacing } from './spacing';

/**
 * Re-export individual components for convenience
 */
export {
  // From colors
  primary,
  secondary,
  success,
  error,
  warning,
  info,
  neutral,
  background,
  text,
  border,
  gaming,
  admin,
} from './colors';

export {
  // From typography
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  textStyles,
} from './typography';

export {
  // From spacing
  spacing as spacingScale,
  padding,
  margin,
  gap,
  borderRadius,
  borderWidth,
  iconSize,
  shadows,
  zIndex,
} from './spacing';

/**
 * Common color getters for convenience
 */
export const getSuccessColor = (percentage: number): string => {
  if (percentage >= 5) return colors.success.dark;
  if (percentage >= 2) return colors.success.medium;
  if (percentage > 0) return colors.success.light;
  return colors.neutral.gray500;
};

export const getErrorColor = (percentage: number): string => {
  const absPercentage = Math.abs(percentage);
  if (absPercentage >= 5) return colors.error.dark;
  if (absPercentage >= 2) return colors.error.medium;
  if (absPercentage > 0) return colors.error.light;
  return colors.neutral.gray500;
};

export const getPerformanceColor = (percentage: number): string => {
  if (percentage > 0) return getSuccessColor(percentage);
  if (percentage < 0) return getErrorColor(percentage);
  return colors.neutral.gray500;
};

export const getRankColor = (rank: string): string => {
  switch (rank) {
    case 'S':
      return colors.gaming.rankS;
    case 'A':
      return colors.gaming.rankA;
    case 'B':
      return colors.gaming.rankB;
    case 'C':
      return colors.gaming.rankC;
    case 'D':
      return colors.gaming.rankD;
    default:
      return colors.neutral.gray500;
  }
};

/**
 * =============================================================================
 * USAGE GUIDE
 * =============================================================================
 *
 * This theme system provides a centralized location for all design tokens
 * used throughout the Bull-11 app. Use these values instead of hardcoding
 * colors, sizes, and spacing to ensure consistency.
 *
 * -----------------------------------------------------------------------------
 * BASIC USAGE
 * -----------------------------------------------------------------------------
 *
 * Import the theme:
 *   import { theme } from '@/src/core/theme';
 *
 * Use in components:
 *   <Text style={{ color: theme.colors.text.primary }}>Hello</Text>
 *   <View style={{ padding: theme.spacing.padding.card }}>Content</View>
 *
 * -----------------------------------------------------------------------------
 * WITH STYLESHEET
 * -----------------------------------------------------------------------------
 *
 * import { StyleSheet } from 'react-native';
 * import { theme } from '@/src/core/theme';
 *
 * const styles = StyleSheet.create({
 *   container: {
 *     backgroundColor: theme.colors.background.default,
 *     padding: theme.spacing.padding.screen,
 *   },
 *   title: {
 *     ...theme.typography.textStyles.h1,
 *     color: theme.colors.text.primary,
 *     marginBottom: theme.spacing.margin.headingBottom,
 *   },
 *   card: {
 *     backgroundColor: theme.colors.background.paper,
 *     padding: theme.spacing.padding.card,
 *     borderRadius: theme.spacing.borderRadius.base,
 *     ...theme.spacing.shadows.base,
 *   },
 * });
 *
 * -----------------------------------------------------------------------------
 * DIRECT IMPORTS (for specific needs)
 * -----------------------------------------------------------------------------
 *
 * Import specific systems:
 *   import { colors, typography, spacing } from '@/src/core/theme';
 *
 * Import specific values:
 *   import { primary, textStyles, padding } from '@/src/core/theme';
 *
 * Use directly:
 *   <Text style={{ fontSize: fontSize.lg, color: primary.main }}>Text</Text>
 *
 * -----------------------------------------------------------------------------
 * COLOR USAGE EXAMPLES
 * -----------------------------------------------------------------------------
 *
 * Primary colors (buttons, links):
 *   color: theme.colors.primary.main
 *   backgroundColor: theme.colors.primary.main
 *
 * Text colors:
 *   color: theme.colors.text.primary      // Main text
 *   color: theme.colors.text.secondary    // Secondary text
 *   color: theme.colors.text.disabled     // Disabled text
 *
 * Success/Error states:
 *   color: theme.colors.success.main      // Green for gains
 *   color: theme.colors.error.main        // Red for losses
 *
 * Backgrounds:
 *   backgroundColor: theme.colors.background.default  // Screen background
 *   backgroundColor: theme.colors.background.paper    // Card background
 *
 * Gaming colors:
 *   color: theme.colors.gaming.rankS      // Gold rank
 *   color: theme.colors.gaming.stock1     // Blue stock visualization
 *
 * -----------------------------------------------------------------------------
 * TYPOGRAPHY USAGE EXAMPLES
 * -----------------------------------------------------------------------------
 *
 * Using predefined text styles (recommended):
 *   <Text style={theme.typography.textStyles.h1}>Heading</Text>
 *   <Text style={theme.typography.textStyles.body}>Body text</Text>
 *   <Text style={theme.typography.textStyles.caption}>Caption</Text>
 *
 * Combining styles:
 *   <Text style={[
 *     theme.typography.textStyles.body,
 *     { color: theme.colors.text.primary }
 *   ]}>Text</Text>
 *
 * Custom typography:
 *   fontSize: theme.typography.fontSize.lg
 *   fontWeight: theme.typography.fontWeight.bold
 *   lineHeight: theme.typography.lineHeight.lg
 *
 * -----------------------------------------------------------------------------
 * SPACING USAGE EXAMPLES
 * -----------------------------------------------------------------------------
 *
 * Padding:
 *   padding: theme.spacing.padding.screen        // Screen padding
 *   padding: theme.spacing.padding.card          // Card padding
 *   paddingVertical: theme.spacing.spacing.md    // Custom padding
 *
 * Margin:
 *   marginBottom: theme.spacing.margin.betweenSections
 *   marginHorizontal: theme.spacing.spacing.base
 *
 * Border radius:
 *   borderRadius: theme.spacing.borderRadius.base    // 8px
 *   borderRadius: theme.spacing.borderRadius.full    // Pill shape
 *
 * Shadows:
 *   ...theme.spacing.shadows.base        // Standard card shadow
 *   ...theme.spacing.shadows.md          // Elevated shadow
 *
 * -----------------------------------------------------------------------------
 * HELPER FUNCTIONS
 * -----------------------------------------------------------------------------
 *
 * Get color based on performance:
 *   import { getPerformanceColor } from '@/src/core/theme';
 *   const color = getPerformanceColor(5.2);  // Returns green
 *
 * Get rank color:
 *   import { getRankColor } from '@/src/core/theme';
 *   const color = getRankColor('S');  // Returns gold
 *
 * -----------------------------------------------------------------------------
 * BEST PRACTICES
 * -----------------------------------------------------------------------------
 *
 * 1. Always use theme values instead of hardcoded colors/sizes
 *    ❌ Bad:  color: '#007AFF'
 *    ✅ Good: color: theme.colors.primary.main
 *
 * 2. Use semantic naming
 *    ❌ Bad:  color: theme.colors.primary.main (for error text)
 *    ✅ Good: color: theme.colors.error.main
 *
 * 3. Use predefined text styles for consistency
 *    ❌ Bad:  fontSize: 24, fontWeight: 'bold'
 *    ✅ Good: ...theme.typography.textStyles.h2
 *
 * 4. Use spacing scale for consistent spacing
 *    ❌ Bad:  padding: 17
 *    ✅ Good: padding: theme.spacing.spacing.base (16px)
 *
 * 5. Combine styles for customization
 *    ✅ <Text style={[theme.typography.textStyles.body, customStyle]}>
 *
 * 6. Use semantic padding/margin values
 *    ✅ padding: theme.spacing.padding.card
 *    ✅ marginBottom: theme.spacing.margin.betweenSections
 *
 * -----------------------------------------------------------------------------
 * MIGRATION GUIDE
 * -----------------------------------------------------------------------------
 *
 * To migrate existing screens to use the theme system:
 *
 * 1. Import the theme at the top of your file:
 *    import { theme } from '@/src/core/theme';
 *
 * 2. Replace hardcoded colors:
 *    Before: color: '#007AFF'
 *    After:  color: theme.colors.primary.main
 *
 * 3. Replace hardcoded sizes:
 *    Before: fontSize: 16, fontWeight: 'bold'
 *    After:  ...theme.typography.textStyles.body
 *
 * 4. Replace hardcoded spacing:
 *    Before: padding: 16
 *    After:  padding: theme.spacing.padding.card
 *
 * 5. Test visual consistency across screens
 *
 * -----------------------------------------------------------------------------
 * TYPESCRIPT SUPPORT
 * -----------------------------------------------------------------------------
 *
 * The theme system is fully typed. You'll get autocompletion for:
 * - theme.colors.[category].[variant]
 * - theme.typography.[category].[value]
 * - theme.spacing.[category].[value]
 *
 * Example type usage:
 *   import type { Theme } from '@/src/core/theme';
 *
 *   const getColor = (theme: Theme) => theme.colors.primary.main;
 *
 * =============================================================================
 */
