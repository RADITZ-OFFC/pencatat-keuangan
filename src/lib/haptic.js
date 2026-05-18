/**
 * Haptic feedback utility using navigator.vibrate
 * Silently fails on unsupported devices
 */

export const haptic = {
  /** Light tap — button press, selection */
  light: () => navigator.vibrate?.(10),

  /** Medium — confirm, save */
  medium: () => navigator.vibrate?.(25),

  /** Heavy — delete, error */
  heavy: () => navigator.vibrate?.(50),

  /** Success pattern */
  success: () => navigator.vibrate?.([15, 30, 15]),

  /** Error pattern */
  error: () => navigator.vibrate?.([50, 30, 50]),

  /** Swipe delete */
  swipeDelete: () => navigator.vibrate?.([30, 20, 60]),

  /** Undo */
  undo: () => navigator.vibrate?.(30),
}
