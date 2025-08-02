// examples/OtpTimerExamples.tsx
import { useCallback, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Text, TouchableOpacity } from 'react-native';
import OtpTimer from '../src/components/OtpTimer';
import { useOtpTimer } from 'react-native-otp-timer-hook';


// Example 1: Basic Usage
const BasicExample = () => {
  const handleResend = useCallback(async (count: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`OTP resent - attempt ${count}`);
  }, []);

  const handleTimeout = useCallback(() => {
    Alert.alert('Timeout', 'OTP has expired, please request a new one');
  }, []);

  return (
    <OtpTimer
      initialTimer={120} // 2 minutes
      resendLimit={3}
      onResend={handleResend}
      onTimeout={handleTimeout}
    />
  );
};

// Example 2: Fully Customized
const CustomizedExample = () => {
  const [, setOtpExpired] = useState(false);

  const handleResend = useCallback(async (count: number) => {
    try {
      // Simulate API call with error handling
      const response = await fetch('/api/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attempt: count }),
      });

      if (!response.ok) throw new Error('Failed to resend');

      setOtpExpired(false);
      Alert.alert('Success', 'OTP sent successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
      throw error; // Re-throw to prevent timer reset
    }
  }, []);

  const handleTimeout = useCallback(() => {
    setOtpExpired(true);
    Alert.alert('Expired', 'Your OTP has expired');
  }, []);

  const handleLimitExceeded = useCallback(() => {
    Alert.alert(
      'Limit Exceeded',
      'Too many attempts. Please contact support or try again later.'
    );
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }, []);

  const formatResendText = useCallback((attempt: number, max: number) => {
    return `Resend OTP (${attempt}/${max})`;
  }, []);

  return (
    <OtpTimer
      initialTimer={300} // 5 minutes
      resendLimit={5}
      onResend={handleResend}
      onTimeout={handleTimeout}
      onLimitExceeded={handleLimitExceeded}
      containerStyle={styles.customContainer}
      textStyle={styles.customText}
      linkStyle={styles.customLink}
      limitExceededStyle={styles.errorText}
      formatText={formatTime}
      formatResendText={formatResendText}
      limitExceededMessage="Maximum attempts reached. Please wait 24 hours before trying again."
      showAttemptCounter={true}
      debug={__DEV__}
    />
  );
};

// Example 3: With Redux Integration
const ReduxExample = () => {
  // Assuming you have Redux setup
  // const dispatch = useDispatch();
  // const { otpStatus, user } = useSelector(state => state.auth);

  const handleResend = useCallback(async (count: number) => {
    // dispatch(resendOtpRequest({ userId: user.id, attempt: count }));
    // Return promise from your async thunk
    console.log('Redux OTP resend', count);
  }, []);

  return (
    <OtpTimer
      initialTimer={180}
      resendLimit={3}
      onResend={handleResend}
      onTimeout={() => {
        // dispatch(otpExpired());
        console.log('OTP expired - handled by Redux');
      }}
    />
  );
};

// Example 4: Conditional Rendering
const ConditionalExample = () => {
  const [showTimer, setShowTimer] = useState(true);
  const [isVerified] = useState(false);

  const handleResend = useCallback(async (count: number) => {
    console.log(`Resending OTP - attempt ${count}`);
    // Simulate resend logic
    await new Promise(resolve => setTimeout(resolve, 1500));
  }, []);

  if (isVerified) {
    return <Text style={styles.successText}>✅ Phone number verified!</Text>;
  }

  return (
    <View>
      {showTimer && (
        <OtpTimer
          initialTimer={60}
          resendLimit={3}
          onResend={handleResend}
          onTimeout={() => setShowTimer(false)}
          enabled={!isVerified}
        />
      )}
    </View>
  );
};

// Example 5: Hook Usage Only
const HookOnlyExample = () => {
  const { timer, resetTimer, isExpired, pauseTimer, resumeTimer } = useOtpTimer({
    initialTimer: 300,
    onTimeout: () => console.log('Custom timer expired'),
    onTick: (currentTime: number) => {
      if (currentTime === 60) {
        console.log('One minute remaining!');
      }
    },
    debug: true,
  });

  return (
    <View style={styles.hookExample}>
      <Text>Custom Timer Implementation</Text>
      <Text>Time remaining: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</Text>
      <Text>Status: {isExpired ? 'Expired' : 'Active'}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={resetTimer} style={styles.button}>
          <Text>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={pauseTimer} style={styles.button}>
          <Text>Pause</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={resumeTimer} style={styles.button}>
          <Text>Resume</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Example 6: Testing Component
const TestingExample = () => {
  const [testMode, setTestMode] = useState(__DEV__);

  const handleResend = useCallback(async (count: number) => {
    if (testMode) {
      // Fast testing - no actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`TEST: OTP resent - attempt ${count}`);
    } else {
      // Real API call
      const response = await fetch('/api/resend-otp');
      console.log('Real OTP resent', response);
    }
  }, [testMode]);

  return (
    <View>
      <OtpTimer
        initialTimer={testMode ? 10 : 300} // 10s for testing, 5min for production
        resendLimit={testMode ? 10 : 3}     // More attempts for testing
        onResend={handleResend}
        debug={testMode}
        showAttemptCounter={testMode}
      />

      {__DEV__ && (
        <TouchableOpacity
          onPress={() => setTestMode(!testMode)}
          style={styles.testButton}
        >
          <Text>Toggle Test Mode: {testMode ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Main Examples Container
const OtpTimerExamples = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Basic Example</Text>
      <BasicExample />

      <Text style={styles.sectionTitle}>Fully Customized</Text>
      <CustomizedExample />

      <Text style={styles.sectionTitle}>Redux Integration</Text>
      <ReduxExample />

      <Text style={styles.sectionTitle}>Conditional Rendering</Text>
      <ConditionalExample />

      <Text style={styles.sectionTitle}>Hook Only Usage</Text>
      <HookOnlyExample />

      <Text style={styles.sectionTitle}>Testing Mode</Text>
      <TestingExample />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#333',
  },
  customContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  customLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#34C759',
    fontWeight: '600',
    textAlign: 'center',
    padding: 15,
  },
  hookExample: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    minWidth: 60,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#FF9500',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
});

export default OtpTimerExamples;