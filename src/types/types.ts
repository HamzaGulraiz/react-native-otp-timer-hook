// src/types.ts
import type { TextStyle, ViewStyle } from 'react-native';

/**
 * Props for the OtpTimer component
 *
 * This interface defines all the configuration options for the OTP timer component,
 * including timing, styling, callbacks, and customization options.
 */
export interface OtpTimerProps {
  /**
   * Initial countdown timer value in seconds
   *
   * @example
   * // 5 minutes timer
   * initialTimer: 300
   *
   * // 2 minutes timer
   * initialTimer: 120
   *
   * @default 300 (5 minutes)
   */
  initialTimer: number;

  /**
   * Maximum number of times the user can request a resend
   *
   * After reaching this limit, the resend option will be disabled
   * and a limit exceeded message will be shown.
   *
   * @example
   * // Allow 3 resend attempts
   * resendLimit: 3
   *
   * @default 3
   */
  resendLimit: number;

  /**
   * Callback function triggered when user requests OTP resend
   *
   * This function should handle the actual OTP resend logic (API call, etc.)
   * The count parameter indicates which resend attempt this is (1-based).
   *
   * @param count - The resend attempt number (1 for first resend, 2 for second, etc.)
   * @returns Promise that resolves when resend operation is complete
   *
   * @example
   * const handleResend = async (count: number) => {
   *   try {
   *     await api.resendOtp({ phone, attempt: count });
   *     showSuccess('OTP sent successfully');
   *   } catch (error) {
   *     showError('Failed to send OTP');
   *   }
   * };
   */
  onResend: (count: number) => Promise<void>;

  /**
   * Optional callback triggered when timer reaches zero
   *
   * Use this to handle timer expiration (e.g., show expired message,
   * disable OTP input, navigate back, etc.)
   *
   * @example
   * const handleTimeout = () => {
   *   setOtpExpired(true);
   *   showWarning('OTP has expired');
   * };
   */
  onTimeout?: () => void;

  /**
   * Optional callback triggered when resend limit is exceeded
   *
   * Use this to handle limit exceeded scenarios (e.g., show error,
   * disable further attempts, redirect to support, etc.)
   *
   * @example
   * const handleLimitExceeded = () => {
   *   showError('Too many attempts. Please contact support.');
   *   navigation.goBack();
   * };
   */
  onLimitExceeded?: () => void;

  /**
   * Optional callback triggered when timer starts/resets
   *
   * Use this to track timer events for analytics or UI updates.
   *
   * @param timeInSeconds - The timer value when it starts/resets
   */
  onTimerStart?: (timeInSeconds: number) => void;

  /**
   * Custom container style for the timer component
   *
   * @example
   * containerStyle={{
   *   backgroundColor: '#f5f5f5',
   *   padding: 16,
   *   borderRadius: 8
   * }}
   */
  containerStyle?: ViewStyle;

  /**
   * Custom text style for regular text elements
   *
   * Applied to timer text and informational messages.
   *
   * @example
   * textStyle={{
   *   fontSize: 16,
   *   color: '#333333',
   *   fontWeight: '500'
   * }}
   */
  textStyle?: TextStyle;

  /**
   * Custom style for clickable/link elements
   *
   * Applied to the "Resend" button and timer countdown display.
   *
   * @example
   * linkStyle={{
   *   color: '#007AFF',
   *   fontWeight: '600',
   *   textDecorationLine: 'underline'
   * }}
   */
  linkStyle?: TextStyle;

  /**
   * Custom text style for the limit exceeded message
   *
   * @example
   * limitExceededStyle={{
   *   color: '#FF3B30',
   *   fontWeight: '600'
   * }}
   */
  limitExceededStyle?: TextStyle;

  /**
   * Custom formatter for the timer display
   *
   * Allows you to customize how the remaining time is displayed.
   * Receives the remaining seconds and should return a formatted string.
   *
   * @param secondsLeft - Remaining seconds on the timer
   * @returns Formatted time string
   *
   * @example
   * // Show only seconds
   * formatText: (seconds) => `${seconds}s`
   *
   * // Show with custom format
   * formatText: (seconds) => {
   *   const mins = Math.floor(seconds / 60);
   *   const secs = seconds % 60;
   *   return `${mins}m ${secs}s remaining`;
   * }
   *
   * @default (seconds) => "MM:SS" format
   */
  formatText?: (secondsLeft: number) => string;

  /**
   * Custom formatter for the resend button text
   *
   * @param attemptNumber - Current resend attempt number
   * @param maxAttempts - Maximum allowed attempts
   * @returns Formatted resend button text
   *
   * @example
   * formatResendText: (attempt, max) => `Resend (${attempt}/${max})`
   */
  formatResendText?: (attemptNumber: number, maxAttempts: number) => string;

  /**
   * Custom message when limit is exceeded
   *
   * @default "Limit exceeded. Please try again later."
   */
  limitExceededMessage?: string;

  /**
   * Enable/disable the timer functionality
   *
   * When false, timer won't count down and resend will be immediately available.
   * Useful for testing or specific UX flows.
   *
   * @default true
   */
  enabled?: boolean;

  /**
   * Show attempt counter in the UI
   *
   * When true, displays current attempt number (e.g., "Attempt 2 of 3")
   *
   * @default false
   */
  showAttemptCounter?: boolean;

  /**
   * Enable debug logging
   *
   * When true, logs timer events to console for debugging purposes.
   * Should be disabled in production.
   *
   * @default false
   */
  debug?: boolean;
}

/**
 * Props for the useOtpTimer hook
 *
 * This interface defines the minimal configuration needed for the timer hook.
 * The hook handles the core timer logic and app state management.
 */
export interface UseOtpTimerProps {
  /**
   * Initial countdown timer value in seconds
   *
   * @example
   * initialTimer: 300 // 5 minutes
   */
  initialTimer: number;

  /**
   * Callback function triggered when timer reaches zero
   *
   * This is called both when the timer naturally counts down to zero,
   * and when the app is backgrounded long enough for the timer to expire.
   *
   * @example
   * const handleTimeout = () => {
   *   console.log('Timer expired');
   *   setIsExpired(true);
   * };
   */
  onTimeout: () => void;

  /**
   * Optional callback triggered when timer value changes
   *
   * Useful for tracking timer progress or updating external state.
   *
   * @param currentTime - Current timer value in seconds
   */
  onTick?: (currentTime: number) => void;

  /**
   * Enable debug logging for the hook
   *
   * @default false
   */
  debug?: boolean;
}

/**
 * Return type for the useOtpTimer hook
 */
export interface UseOtpTimerReturn {
  /**
   * Current timer value in seconds
   */
  timer: number;

  /**
   * Function to reset the timer to its initial value
   */
  resetTimer: () => void;

  /**
   * Whether the timer is currently active/counting down
   */
  isActive: boolean;

  /**
   * Whether the timer has expired (reached zero)
   */
  isExpired: boolean;

  /**
   * Manually pause the timer
   */
  pauseTimer: () => void;

  /**
   * Resume a paused timer
   */
  resumeTimer: () => void;
}

/**
 * Configuration options for timer behavior
 */
export interface TimerConfig {
  /**
   * Interval for timer updates in milliseconds
   * @default 1000 (1 second)
   */
  updateInterval?: number;

  /**
   * Whether to continue timer when app is backgrounded
   * @default false
   */
  continueInBackground?: boolean;

  /**
   * Whether to auto-reset when component remounts
   * @default false
   */
  autoResetOnMount?: boolean;
}
