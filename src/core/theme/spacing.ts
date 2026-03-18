/**
 * Spacing System for Bull-11 App
 * Centralized spacing values for padding, margin, and gaps
 * Based on 4px grid system for consistent spacing
 */

/**
 * Base Spacing Unit
 * All spacing values are multiples of this base unit (4px)
 */
const BASE_UNIT = 4;

/**
 * Spacing Scale
 * Consistent spacing values following 4px grid system
 * Use these for padding, margin, gap, and other spacing needs
 */
export const spacing = {
  xs: BASE_UNIT,          // 4px  - Tiny spacing
  sm: BASE_UNIT * 2,      // 8px  - Small spacing
  md: BASE_UNIT * 3,      // 12px - Medium spacing
  base: BASE_UNIT * 4,    // 16px - Base spacing (default)
  lg: BASE_UNIT * 5,      // 20px - Large spacing
  xl: BASE_UNIT * 6,      // 24px - Extra large spacing
  '2xl': BASE_UNIT * 8,   // 32px - 2x extra large
  '3xl': BASE_UNIT * 10,  // 40px - 3x extra large
  '4xl': BASE_UNIT * 12,  // 48px - 4x extra large
  '5xl': BASE_UNIT * 16,  // 64px - 5x extra large
  '6xl': BASE_UNIT * 20,  // 80px - 6x extra large
} as const;

/**
 * Common Padding Values
 * Semantic padding presets for common use cases
 */
export const padding = {
  // Screen/container padding
  screen: spacing.base,           // 16px - Standard screen padding
  screenHorizontal: spacing.base, // 16px - Horizontal screen padding
  screenVertical: spacing.base,   // 16px - Vertical screen padding

  // Card padding
  card: spacing.base,             // 16px - Standard card padding
  cardSmall: spacing.md,          // 12px - Small card padding
  cardLarge: spacing.xl,          // 24px - Large card padding

  // Section padding
  section: spacing.xl,            // 24px - Section padding
  sectionSmall: spacing.base,     // 16px - Small section padding
  sectionLarge: spacing['2xl'],   // 32px - Large section padding

  // Element padding
  button: spacing.md,             // 12px - Button padding
  buttonLarge: spacing.base,      // 16px - Large button padding
  input: spacing.md,              // 12px - Input padding
  inputLarge: spacing.base,       // 16px - Large input padding

  // Modal padding
  modal: spacing.xl,              // 24px - Modal content padding
  modalHeader: spacing.base,      // 16px - Modal header padding
} as const;

/**
 * Common Margin Values
 * Semantic margin presets for common use cases
 */
export const margin = {
  // Vertical margins
  betweenElements: spacing.md,    // 12px - Between UI elements
  betweenSections: spacing.xl,    // 24px - Between sections
  betweenCards: spacing.base,     // 16px - Between cards in list

  // Horizontal margins
  screenEdge: spacing.base,       // 16px - From screen edge
  cardEdge: spacing.base,         // 16px - Card margins

  // Text margins
  textBottom: spacing.sm,         // 8px  - Below text
  headingBottom: spacing.md,      // 12px - Below headings
  paragraphBottom: spacing.base,  // 16px - Below paragraphs
} as const;

/**
 * Gap Values
 * For use with flexbox gap property
 */
export const gap = {
  xs: spacing.xs,      // 4px
  sm: spacing.sm,      // 8px
  md: spacing.md,      // 12px
  base: spacing.base,  // 16px
  lg: spacing.lg,      // 20px
  xl: spacing.xl,      // 24px
} as const;

/**
 * Border Radius Values
 * Standard border radius for rounded corners
 */
export const borderRadius = {
  none: 0,          // No rounding
  sm: 4,           // 4px  - Small rounding (buttons, badges)
  base: 8,         // 8px  - Standard rounding (cards, inputs)
  md: 12,          // 12px - Medium rounding
  lg: 16,          // 16px - Large rounding
  xl: 20,          // 20px - Extra large rounding
  '2xl': 24,       // 24px - 2x extra large
  '3xl': 32,       // 32px - 3x extra large
  full: 9999,      // Fully rounded (pills, circular buttons)
} as const;

/**
 * Border Width Values
 * Standard border widths
 */
export const borderWidth = {
  none: 0,         // No border
  hairline: 0.5,   // Hairline border
  thin: 1,         // Thin border (default)
  medium: 2,       // Medium border
  thick: 3,        // Thick border
  heavy: 4,        // Heavy border
} as const;

/**
 * Icon Sizes
 * Standard icon sizes matching design system
 */
export const iconSize = {
  xs: 12,          // Extra small icons
  sm: 16,          // Small icons
  base: 20,        // Standard icons
  md: 24,          // Medium icons (default)
  lg: 32,          // Large icons
  xl: 40,          // Extra large icons
  '2xl': 48,       // 2x extra large
  '3xl': 64,       // 3x extra large
} as const;

/**
 * Shadow/Elevation Presets
 * Standard shadow values for elevation
 * Based on Material Design elevation system
 */
export const shadows = {
  none: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

/**
 * Z-Index Values
 * Standard z-index for layering elements
 */
export const zIndex = {
  base: 0,           // Base layer
  dropdown: 10,      // Dropdowns
  sticky: 100,       // Sticky elements
  fixed: 200,        // Fixed elements
  modal: 1000,       // Modals
  popover: 1100,     // Popovers
  tooltip: 1200,     // Tooltips
  notification: 1300, // Notifications
} as const;

/**
 * Complete Spacing System
 * Export all spacing values as a single object
 */
export const spacingSystem = {
  spacing,
  padding,
  margin,
  gap,
  borderRadius,
  borderWidth,
  iconSize,
  shadows,
  zIndex,
} as const;

/**
 * Type definitions
 */
export type SpacingSystem = typeof spacingSystem;
export type Spacing = typeof spacing;
export type Padding = typeof padding;
export type Margin = typeof margin;
export type Gap = typeof gap;
export type BorderRadius = typeof borderRadius;
export type BorderWidth = typeof borderWidth;
export type IconSize = typeof iconSize;
export type Shadows = typeof shadows;
export type ZIndex = typeof zIndex;

/**
 * Usage Examples:
 *
 * // Direct spacing usage
 * <View style={{ padding: spacing.base, margin: spacing.md }}>
 *
 * // Using semantic padding
 * <View style={{ padding: padding.card }}>
 *
 * // Using border radius
 * <View style={{ borderRadius: borderRadius.base }}>
 *
 * // Using shadows
 * <View style={shadows.md}>
 *
 * // In StyleSheet
 * const styles = StyleSheet.create({
 *   container: {
 *     padding: padding.screen,
 *     gap: gap.md,
 *   },
 *   card: {
 *     padding: padding.card,
 *     borderRadius: borderRadius.base,
 *     ...shadows.base,
 *   },
 *   button: {
 *     paddingVertical: spacing.md,
 *     paddingHorizontal: spacing.xl,
 *     borderRadius: borderRadius.sm,
 *   },
 * });
 */
