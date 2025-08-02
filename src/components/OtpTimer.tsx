// src/components/OtpTimer.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import type { OtpTimerProps } from '../types/types';
import { useOtpTimer } from '../hooks/useOtpTimer';

/**
 * Memoized component for displaying attempt counter
 */
const AttemptCounter = React.memo<{
  currentAttempt: number;
  maxAttempts: number;
  textStyle?: any;
}>(({ currentAttempt, maxAttempts, textStyle }) => (
  <Text style={[styles.attemptText, textStyle]}>
    Attempt {currentAttempt} of {maxAttempts}
  </Text>
));

/**
 * Memoized component for the resend button
 */
const ResendButton = React.memo<{
  onPress: () => void;
  isLoading: boolean;
  linkStyle?: any;
  text: string;
}>(({ onPress, isLoading, linkStyle, text }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={isLoading}
    style={styles.resendButton}
  >
    {isLoading ? (
      <ActivityIndicator size="small" color={linkStyle?.color || '#007AFF'} />
    ) : (
      <Text style={[styles.link, linkStyle]}>{text}</Text>
    )}
  </TouchableOpacity>
));

/**
 * Memoized component for timer display
 */
const TimerDisplay = React.memo<{
  timer: number;
  formatText?: (seconds: number) => string;
  textStyle?: any;
  linkStyle?: any;
}>(({ timer, formatText, textStyle, linkStyle }) => {
  const formattedTime = useMemo(() => {
    if (formatText) {
      return formatText(timer);
    }
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }, [timer, formatText]);

  return (
    <View style={styles.timerContainer}>
      <Text style={[styles.text, textStyle]}>Resend code in </Text>
      <Text style={[styles.link, linkStyle]}>{formattedTime}</Text>
    </View>
  );
});

/**
 * OTP Timer Component
 *
 * A comprehensive OTP timer component with resend functionality.
 * Handles timer countdown, resend attempts, background/foreground transitions,
 * and provides extensive customization options.
 *
 * Features:
 * - Automatic countdown timer
 * - Background time tracking
 * - Resend attempt limiting
 * - Loading states
 * - Extensive styling options
 * - Custom text formatting
 * - Attempt counter display
 * - Performance optimized with React.memo
 *
 * @param props - Component configuration options
 * @returns JSX.Element
 */
const OtpTimer: React.FC<OtpTimerProps> = ({
  initialTimer,
  resendLimit,
  onResend,
  onTimeout,
  onLimitExceeded,
  onTimerStart,
  containerStyle,
  textStyle,
  linkStyle,
  limitExceededStyle,
  formatText,
  formatResendText,
  limitExceededMessage = "Limit exceeded. Please try again later.",
  enabled = true,
  showAttemptCounter = false,
  debug = false,
}) => {
  // Component state
  const [resendCount, setResendCount] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [hasExceededLimit, setHasExceededLimit] = useState(false);

  // Memoized callbacks to prevent unnecessary re-renders
  const handleTimeout = useCallback(() => {
    if (debug) {
      console.log('🕐 OtpTimer: Timer timeout reached');
    }
    onTimeout?.();
  }, [onTimeout, debug]);

  const handleTimerStart = useCallback((timeInSeconds: number) => {
    if (debug) {
      console.log(`🕐 OtpTimer: Timer started with ${timeInSeconds}s`);
    }
    onTimerStart?.(timeInSeconds);
  }, [onTimerStart, debug]);

  // Timer hook with memoized options
  const timerOptions = useMemo(() => ({
    initialTimer,
    onTimeout: handleTimeout,
    debug,
  }), [initialTimer, handleTimeout, debug]);

  const { timer, resetTimer, isExpired } = useOtpTimer(timerOptions);

  // Handle resend functionality
  const handleResend = useCallback(async () => {
    if (isResending || hasExceededLimit || !enabled) return;

    const newCount = resendCount + 1;

    if (newCount > resendLimit) {
      setHasExceededLimit(true);
      onLimitExceeded?.();

      if (debug) {
        console.log('🕐 OtpTimer: Resend limit exceeded');
      }
      return;
    }

    setIsResending(true);

    try {
      if (debug) {
        console.log(`🕐 OtpTimer: Attempting resend #${newCount}`);
      }

      await onResend(newCount);
      setResendCount(newCount);
      resetTimer();
      handleTimerStart(initialTimer);

      if (debug) {
        console.log(`🕐 OtpTimer: Resend #${newCount} successful`);
      }
    } catch (error) {
      if (debug) {
        console.error('🕐 OtpTimer: Resend failed:', error);
      }
      // Don't increment count on failure
    } finally {
      setIsResending(false);
    }
  }, [
    isResending,
    hasExceededLimit,
    enabled,
    resendCount,
    resendLimit,
    onResend,
    resetTimer,
    handleTimerStart,
    initialTimer,
    onLimitExceeded,
    debug,
  ]);

  // Memoized resend button text
  const resendButtonText = useMemo(() => {
    if (formatResendText) {
      return formatResendText(resendCount + 1, resendLimit);
    }
    return 'Resend';
  }, [formatResendText, resendCount, resendLimit]);

  // Memoized render conditions
  const shouldShowTimer = enabled && timer > 0 && !hasExceededLimit;
  const shouldShowResend = enabled && isExpired && !hasExceededLimit;
  const shouldShowLimitExceeded = hasExceededLimit;

  if (!enabled) {
    return (
      <View style={[styles.container, containerStyle]}>
        <ResendButton
          onPress={handleResend}
          isLoading={isResending}
          linkStyle={linkStyle}
          text={resendButtonText}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Attempt Counter */}
      {showAttemptCounter && resendCount > 0 && (
        <AttemptCounter
          currentAttempt={resendCount}
          maxAttempts={resendLimit}
          textStyle={textStyle}
        />
      )}

      {/* Limit Exceeded Message */}
      {shouldShowLimitExceeded && (
        <Text style={[styles.text, limitExceededStyle]}>
          {limitExceededMessage}
        </Text>
      )}

      {/* Timer Display */}
      {shouldShowTimer && (
        <TimerDisplay
          timer={timer}
          formatText={formatText}
          textStyle={textStyle}
          linkStyle={linkStyle}
        />
      )}

      {/* Resend Button */}
      {shouldShowResend && (
        <View style={styles.resendContainer}>
          <Text style={[styles.text, textStyle]}>I didn't receive the code. </Text>
          <ResendButton
            onPress={handleResend}
            isLoading={isResending}
            linkStyle={linkStyle}
            text={resendButtonText}
          />
        </View>
      )}

      {/* Debug Information */}
      {debug && __DEV__ && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Timer: {timer}s | Attempts: {resendCount}/{resendLimit} |
            Expired: {isExpired ? 'Yes' : 'No'} |
            Limited: {hasExceededLimit ? 'Yes' : 'No'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  resendButton: {
    padding: 4,
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  link: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  attemptText: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  debugContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  debugText: {
    fontSize: 10,
    color: '#666666',
    fontFamily: 'monospace',
  },
});

export default React.memo(OtpTimer);