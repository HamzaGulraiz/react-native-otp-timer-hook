import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';
import { useOtpTimer } from '../hooks/useOtpTimer';

interface OtpTimerProps {
  initialTimer: number;
  resendLimit: number;
  onResend: (count: number) => Promise<void>;
  onTimeout?: () => void;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  linkStyle?: TextStyle;
  formatText?: (secondsLeft: number) => string;
}

const OtpTimer: React.FC<OtpTimerProps> = ({
  initialTimer,
  resendLimit,
  onResend,
  onTimeout,
  containerStyle,
  textStyle,
  linkStyle,
  formatText,
}) => {
  const [resendCount, setResendCount] = useState(1);
  const { timer, resetTimer } = useOtpTimer({
    initialTimer,
    onTimeout: () => onTimeout?.(),
  });

  const handleResend = async () => {
    if (resendCount < resendLimit) {
      await onResend(resendCount + 1);
      resetTimer();
      setResendCount((prev) => prev + 1);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {resendCount >= resendLimit ? (
        <Text style={textStyle}>Limit exceeded. Please try again later.</Text>
      ) : timer === 0 ? (
        <View style={styles.viewContainer}>
          <Text style={textStyle}>I didn’t receive the code. </Text>
          <TouchableOpacity onPress={handleResend}>
            <Text style={linkStyle}>Resend</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.viewContainer}>
          <Text style={textStyle}>Resend code in </Text>
          <Text style={linkStyle}>
            {formatText
              ? formatText(timer)
              : `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`}
          </Text>
        </View>
      )}
    </View>
  );
};

export default OtpTimer;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  viewContainer: { flexDirection: 'row', alignItems: 'center' },
  text: {
    color: 'black',
  },
  link: {
    color: 'blue',
  },
});
