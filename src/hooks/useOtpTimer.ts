import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

interface UseOtpTimerProps {
  initialTimer: number;
  onTimeout: () => void;
}

export const useOtpTimer = ({ initialTimer, onTimeout }: UseOtpTimerProps) => {
  const [timer, setTimer] = useState(initialTimer);
  const backgroundTimeSpent = useRef<Date | null>(null);

  const checkAppState = useCallback(
    (nextAppState: string) => {
      if (nextAppState === 'active' && backgroundTimeSpent.current) {
        const timeSpentInBackground = Math.floor(
          (new Date().getTime() - backgroundTimeSpent.current.getTime()) / 1000
        );
        if (timeSpentInBackground >= timer) {
          onTimeout();
          setTimer(0);
          backgroundTimeSpent.current = null;
        } else {
          setTimer((prev) => prev - timeSpentInBackground);
        }
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        backgroundTimeSpent.current = new Date();
      }
    },
    [timer, onTimeout]
  );

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener(
      'change',
      checkAppState
    );
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(interval);
      appStateSubscription.remove();
    };
  }, [checkAppState]);

  return { timer, resetTimer: () => setTimer(initialTimer) };
};
