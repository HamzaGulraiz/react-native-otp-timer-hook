// src/hooks/useOtpTimer.ts
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { UseOtpTimerProps, UseOtpTimerReturn } from '../types/types';

/**
 * Custom hook for managing OTP timer functionality
 *
 * This hook provides timer management with app state awareness.
 * It handles background/foreground transitions and maintains accurate
 * timing even when the app is backgrounded.
 *
 * Features:
 * - Automatic background time calculation
 * - App state change handling
 * - Timer pause/resume functionality
 * - Memory leak prevention with proper cleanup
 * - Performance optimized with stable references
 *
 * @param props - Configuration options for the timer
 * @returns Timer state and control functions
 *
 * @example
 * const { timer, resetTimer, isExpired } = useOtpTimer({
 *   initialTimer: 300,
 *   onTimeout: () => console.log('Timer expired'),
 *   debug: __DEV__
 * });
 */
export const useOtpTimer = (props: UseOtpTimerProps): UseOtpTimerReturn => {
  const { initialTimer, onTimeout, onTick, debug = false } = props;

  // Timer state
  const [timer, setTimer] = useState(initialTimer);
  const [isActive, setIsActive] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Refs for managing background time and intervals
  const backgroundTimeSpent = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateSubscriptionRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  // Memoized derived state
  const isExpired = useMemo(() => timer <= 0, [timer]);

  // Stable callback for timeout handling
  const handleTimeoutCallback = useCallback(() => {
    if (debug) {
      console.log('🕐 OTP Timer: Timer expired');
    }
    onTimeout();
  }, [onTimeout, debug]);

  // Stable callback for tick handling
  const handleTickCallback = useCallback(
    (currentTime: number) => {
      if (onTick) {
        onTick(currentTime);
      }
    },
    [onTick]
  );

  /**
   * Handle app state changes (background/foreground transitions)
   *
   * When app goes to background, we record the timestamp.
   * When app comes back to foreground, we calculate the time spent
   * in background and update the timer accordingly.
   */
  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (debug) {
        console.log(`🕐 OTP Timer: App state changed to ${nextAppState}`);
      }

      if (nextAppState === 'active' && backgroundTimeSpent.current) {
        // App came back to foreground
        const timeSpentInBackground = Math.floor(
          (Date.now() - backgroundTimeSpent.current.getTime()) / 1000
        );

        if (debug) {
          console.log(
            `🕐 OTP Timer: Time spent in background: ${timeSpentInBackground}s`
          );
        }

        setTimer((prevTimer) => {
          const newTimer = Math.max(0, prevTimer - timeSpentInBackground);

          if (newTimer <= 0 && prevTimer > 0) {
            // Timer expired while in background
            handleTimeoutCallback();
          }

          return newTimer;
        });

        backgroundTimeSpent.current = null;
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App went to background
        backgroundTimeSpent.current = new Date();

        if (debug) {
          console.log(
            '🕐 OTP Timer: App went to background, recording timestamp'
          );
        }
      }
    },
    [debug, handleTimeoutCallback]
  );

  /**
   * Start the timer interval
   */
  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          // Timer is about to expire
          if (debug) {
            console.log('🕐 OTP Timer: Timer reached zero');
          }
          handleTimeoutCallback();
          return 0;
        }

        const newTimer = prevTimer - 1;
        handleTickCallback(newTimer);
        return newTimer;
      });
    }, 1000);

    setIsActive(true);

    if (debug) {
      console.log('🕐 OTP Timer: Timer started');
    }
  }, [debug, handleTimeoutCallback, handleTickCallback]);

  /**
   * Stop the timer interval
   */
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);

    if (debug) {
      console.log('🕐 OTP Timer: Timer stopped');
    }
  }, [debug]);

  /**
   * Reset timer to initial value and restart
   */
  const resetTimer = useCallback(() => {
    setTimer(initialTimer);
    setIsPaused(false);
    backgroundTimeSpent.current = null;

    if (!isPaused) {
      startTimer();
    }

    if (debug) {
      console.log(`🕐 OTP Timer: Timer reset to ${initialTimer}s`);
    }
  }, [initialTimer, isPaused, startTimer, debug]);

  /**
   * Pause the timer
   */
  const pauseTimer = useCallback(() => {
    stopTimer();
    setIsPaused(true);

    if (debug) {
      console.log('🕐 OTP Timer: Timer paused');
    }
  }, [stopTimer, debug]);

  /**
   * Resume the timer
   */
  const resumeTimer = useCallback(() => {
    if (isPaused && timer > 0) {
      setIsPaused(false);
      startTimer();

      if (debug) {
        console.log('🕐 OTP Timer: Timer resumed');
      }
    }
  }, [isPaused, timer, startTimer, debug]);

  /**
   * Cleanup function to clear intervals and subscriptions
   */
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (appStateSubscriptionRef.current) {
      appStateSubscriptionRef.current.remove();
      appStateSubscriptionRef.current = null;
    }

    backgroundTimeSpent.current = null;
    isInitializedRef.current = false;

    if (debug) {
      console.log('🕐 OTP Timer: Cleanup completed');
    }
  }, [debug]);

  // Initialize timer and app state listener
  useEffect(() => {
    if (isInitializedRef.current) return;

    // Start the timer
    startTimer();

    // Setup app state listener
    appStateSubscriptionRef.current = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    isInitializedRef.current = true;

    if (debug) {
      console.log('🕐 OTP Timer: Hook initialized');
    }

    // Cleanup on unmount
    return cleanup;
  }, []); // Empty dependency array - runs only once

  // Handle timer expiration
  useEffect(() => {
    if (timer <= 0 && isActive) {
      stopTimer();
    }
  }, [timer, isActive, stopTimer]);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      timer,
      resetTimer,
      isActive: isActive && !isPaused,
      isExpired,
      pauseTimer,
      resumeTimer,
    }),
    [timer, resetTimer, isActive, isPaused, isExpired, pauseTimer, resumeTimer]
  );
};
