import { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useOtpTimer, OtpTimer } from 'react-native-otp-timer-hook';

const App = () => {
  //🧠 Hook Usage
  const { timer, resetTimer } = useOtpTimer({
    initialTimer: 60,
    onTimeout: () => console.log('Timer expired!'),
  });

  useEffect(() => {
    console.log('Current timer:', timer);
    if (timer === 0) {
      console.log('Timer has reached zero, you can now resend the OTP.');
      resetTimer(); // Reset the timer if needed
    }
  }, [timer, resetTimer]);
  return (
    <View>
      <Text>🧩 Component Usage</Text>
      <OtpTimer
        initialTimer={60}
        resendLimit={3}
        onResend={async (count: number) => {
          console.log('Resend #', count);
        }}
        onTimeout={() => console.log('Timed out!')}
        textStyle={styles.text}
        linkStyle={styles.link}
      />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: 'black',
  },
  link: {
    fontSize: 16,
    color: 'blue',
    textDecorationLine: 'underline',
  },
});
