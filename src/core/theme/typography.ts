/**
 * Typography System for Bull-11 App
 * Centralized font sizes, weights, and text styles
 * Following iOS and React Native typography guidelines
 */

/**
 * Font Families
 * System fonts for iOS and Android
 */
export const fontFamily = {
  /**
   * Regular weight font
   * iOS: San Francisco (system default)
   * Android: Roboto (system default)
   */
  regular: 'System',

  /**
   * Medium weight font
   * Used for slight emphasis without full bold
   */
  medium: 'System',

  /**
   * Bold weight font
   * Used for headings and emphasis
   */
  bold: 'System',

  /**
   * Monospace font
   * Used for code, numbers, or fixed-width text
   */
  mono: Platform.select({
    ios: 'Courier',
    android: 'monospace',
    default: 'monospace',
  }),
} as const;

// Import Platform for font family selection
import { Platform } from 'react-native';

/**
 * Font Weights
 * Standard font weight values for React Native
 */
export const fontWeight = {
  light: '300' as const,      // Light text
  regular: '400' as const,    // Normal text (default)
  medium: '500' as const,     // Slightly emphasized text
  semibold: '600' as const,   // Medium emphasis
  bold: '700' as const,       // Strong emphasis
  heavy: '800' as const,      // Very strong emphasis
} as const;

/**
 * Font Sizes
 * Standard font sizes in pixels
 * Based on iOS Human Interface Guidelines and Material Design
 */
export const fontSize = {
  // Extra small sizes
  xs: 10,         // Tiny labels, badges
  sm: 12,         // Small labels, captions

  // Body sizes
  base: 14,       // Small body text
  md: 16,         // Standard body text (default)
  lg: 18,         // Large body text

  // Heading sizes
  xl: 20,         // Small headings
  '2xl': 24,      // Medium headings
  '3xl': 28,      // Large headings
  '4xl': 32,      // Extra large headings

  // Display sizes
  '5xl': 40,      // Small display text
  '6xl': 48,      // Medium display text
  '7xl': 60,      // Large display text
  '8xl': 72,      // Extra large display text (hero scores)
} as const;

/**
 * Line Heights
 * Standard line heights for different font sizes
 * Provides better readability and vertical rhythm
 */
export const lineHeight = {
  xs: 14,         // For 10px text
  sm: 16,         // For 12px text
  base: 20,       // For 14px text
  md: 24,         // For 16px text
  lg: 28,         // For 18px text
  xl: 32,         // For 20px text
  '2xl': 36,      // For 24px text
  '3xl': 40,      // For 28px text
  '4xl': 48,      // For 32px text
  '5xl': 56,      // For 40px text
  '6xl': 64,      // For 48px text
  '7xl': 80,      // For 60px text
  '8xl': 96,      // For 72px text
} as const;

/**
 * Letter Spacing
 * Standard letter spacing values
 * Positive values expand, negative values tighten
 */
export const letterSpacing = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.6,
} as const;

/**
 * Predefined Text Styles
 * Common text style combinations for consistent typography
 * Use these instead of defining styles inline
 */
export const textStyles = {
  // Display styles (hero text, large numbers)
  displayHero: {
    fontSize: fontSize['8xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight['8xl'],
    letterSpacing: letterSpacing.tight,
  },
  displayLarge: {
    fontSize: fontSize['6xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight['6xl'],
    letterSpacing: letterSpacing.tight,
  },
  displayMedium: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight['5xl'],
  },

  // Heading styles
  h1: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight['4xl'],
  },
  h2: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight['3xl'],
  },
  h3: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight['2xl'],
  },
  h4: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.xl,
  },
  h5: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.lg,
  },
  h6: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.md,
  },

  // Body styles
  bodyLarge: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.lg,
  },
  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.md,
  },
  bodySmall: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.base,
  },

  // Caption and label styles
  caption: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.sm,
  },
  captionBold: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.sm,
    letterSpacing: letterSpacing.wide,
  },
  overline: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.xs,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase' as const,
  },

  // Button styles
  buttonLarge: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.lg,
    letterSpacing: letterSpacing.wide,
  },
  button: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.md,
    letterSpacing: letterSpacing.wide,
  },
  buttonSmall: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.base,
  },

  // Special styles
  code: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
  },
  link: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.md,
    textDecorationLine: 'underline' as const,
  },
} as const;

/**
 * Complete Typography System
 * Export all typography values as a single object
 */
export const typography = {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  textStyles,
} as const;

/**
 * Type definitions
 */
export type Typography = typeof typography;
export type FontFamily = typeof fontFamily;
export type FontWeight = typeof fontWeight;
export type FontSize = typeof fontSize;
export type LineHeight = typeof lineHeight;
export type LetterSpacing = typeof letterSpacing;
export type TextStyles = typeof textStyles;

/**
 * Usage Examples:
 *
 * // Direct usage
 * <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>Hello</Text>
 *
 * // Using predefined styles
 * <Text style={textStyles.h1}>Heading</Text>
 * <Text style={textStyles.body}>Body text</Text>
 *
 * // Combining with custom styles
 * <Text style={[textStyles.body, { color: colors.text.primary }]}>Text</Text>
 *
 * // In StyleSheet
 * const styles = StyleSheet.create({
 *   title: {
 *     ...textStyles.h2,
 *     color: colors.text.primary,
 *   },
 *   description: textStyles.bodySmall,
 * });
 */
