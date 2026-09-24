/**
 * Design tokens modeled on shadcn/ui's default zinc palette.
 * background/foreground, muted surfaces, borders and primary pairs keep
 * the same roles in light and dark mode. https://ui.shadcn.com
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // zinc-950 foreground on white
    text: '#09090b',
    background: '#ffffff',
    // zinc-100 — cards and subtle surfaces
    backgroundElement: '#f4f4f5',
    // zinc-900 — primary buttons (pair with onPrimary text)
    backgroundSelected: '#18181b',
    // zinc-500
    textSecondary: '#71717a',
    // zinc-200 — hairline borders
    border: '#e4e4e7',
    // zinc-50 — text on primary buttons
    onPrimary: '#fafafa',
    // red-600
    danger: '#dc2626',
    // green-600
    success: '#16a34a',
  },
  dark: {
    // zinc-50 foreground on zinc-950
    text: '#fafafa',
    background: '#09090b',
    // zinc-800 — cards and subtle surfaces
    backgroundElement: '#27272a',
    // zinc-50 — primary buttons invert in dark mode
    backgroundSelected: '#fafafa',
    // zinc-400
    textSecondary: '#a1a1aa',
    // zinc-800
    border: '#27272a',
    // zinc-950 — text on primary buttons
    onPrimary: '#18181b',
    // red-500
    danger: '#ef4444',
    // green-500
    success: '#22c55e',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** shadcn-style corner radii: cards 12px, inputs/buttons 8px. */
export const Radius = {
  sm: 6,
  md: 8,
  lg: 12,
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
