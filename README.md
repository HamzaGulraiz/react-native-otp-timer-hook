# react-native-otp-timer

A powerful, customizable, and performance-optimized OTP (One-Time Password) timer component for React Native applications. Perfect for implementing secure authentication flows with automatic resend functionality and background time tracking.

## Features

- ⏱️ **Accurate Timing**: Precise countdown with background time calculation
- 🔄 **Auto Resend**: Configurable resend attempts with loading states
- 📱 **Background Aware**: Continues timing when app is backgrounded
- 🎨 **Fully Customizable**: Extensive styling and text formatting options
- ⚡ **Performance Optimized**: Built with React.memo and stable references
- 🔧 **TypeScript Support**: Fully typed with comprehensive interfaces
- 🧪 **Testing Friendly**: Debug mode and testing utilities included
- 🎯 **Flexible API**: Use as component or hook only
- 🚀 **Zero Dependencies**: No external dependencies except React Native

## Installation

```bash
npm install react-native-otp-timer
# or
yarn add react-native-otp-timer
```

![demo](https://postimg.cc/bSTz8jCv). ![demo](https://postimg.cc/jLxffqrZ)

## Quick Start

```typescript
import React from 'react';
import { View, Alert } from 'react-native';
import OtpTimer from 'react-native-otp-timer';

const App = () => {
  const handleResend = async (attemptNumber: number) => {
    // Your OTP resend logic here
    console.log(`Resending OTP - attempt ${attemptNumber}`);
    await fetch('/api/resend-otp', { method: 'POST' });
  };

  const handleTimeout = () => {
    Alert.alert('Timeout', 'OTP has expired');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <OtpTimer
        initialTimer={300} // 5 minutes
        resendLimit={3}
        onResend={handleResend}
        onTimeout={handleTimeout}
      />
    </View>
  );
};

export default App;
```

## Advanced Usage

### Fully Customized Implementation

```typescript
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import OtpTimer from 'react-native-otp-timer';

const CustomOtpTimer = () => {
  const handleResend = useCallback(async (count: number) => {
    try {
      const response = await api.resendOtp({ attempt: count });
      showSuccess('OTP sent successfully');
    } catch (error) {
      showError('Failed to send OTP');
      throw error; // Prevent timer reset on failure
    }
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s remaining`;
  }, []);

  return (
    <OtpTimer
      initialTimer={600} // 10 minutes
      resendLimit={5}
      onResend={handleResend}
      onTimeout={() => navigation.goBack()}
      onLimitExceeded={() => showContactSupport()}
      containerStyle={styles.container}
      textStyle={styles.text}
      linkStyle={styles.link}
      formatText={formatTime}
      formatResendText={(attempt, max) => `Resend (${attempt}/${max})`}
      showAttemptCounter={true}
      debug={__DEV__}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    color: '#495057',
  },
  link: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
});
```

### Hook-Only Usage

```typescript
import { useOtpTimer } from 'react-native-otp-timer';

const CustomTimerComponent = () => {
  const { timer, resetTimer, isExpired, pauseTimer, resumeTimer } = useOtpTimer({
    initialTimer: 300,
    onTimeout: () => console.log('Timer expired'),
    onTick: (currentTime) => {
      if (currentTime === 60) {
        showWarning('1 minute remaining!');
      }
    },
    debug: true,
  });

  // Your custom UI implementation
  return (
    <View>
      <Text>Time: {timer}s</Text>
      <Button title="Reset" onPress={resetTimer} />
    </View>
  );
};
```

## API Reference

### OtpTimer Component Props

| Prop                   | Type                                       | Default               | Description                             |
| ---------------------- | ------------------------------------------ | --------------------- | --------------------------------------- |
| `initialTimer`         | `number`                                   | **Required**          | Initial countdown time in seconds       |
| `resendLimit`          | `number`                                   | **Required**          | Maximum number of resend attempts       |
| `onResend`             | `(count: number) => Promise<void>`         | **Required**          | Callback for handling OTP resend        |
| `onTimeout`            | `() => void`                               | `undefined`           | Called when timer reaches zero          |
| `onLimitExceeded`      | `() => void`                               | `undefined`           | Called when resend limit is exceeded    |
| `onTimerStart`         | `(seconds: number) => void`                | `undefined`           | Called when timer starts/resets         |
| `containerStyle`       | `ViewStyle`                                | `undefined`           | Custom container styling                |
| `textStyle`            | `TextStyle`                                | `undefined`           | Custom text styling                     |
| `linkStyle`            | `TextStyle`                                | `undefined`           | Custom link/button styling              |
| `limitExceededStyle`   | `TextStyle`                                | `undefined`           | Custom style for limit exceeded message |
| `formatText`           | `(seconds: number) => string`              | `"MM:SS"`             | Custom timer display formatter          |
| `formatResendText`     | `(attempt: number, max: number) => string` | `"Resend"`            | Custom resend button text               |
| `limitExceededMessage` | `string`                                   | `"Limit exceeded..."` | Custom limit exceeded message           |
| `enabled`              | `boolean`                                  | `true`                | Enable/disable timer functionality      |
| `showAttemptCounter`   | `boolean`                                  | `false`               | Show attempt counter in UI              |
| `debug`                | `boolean`                                  | `false`               | Enable debug logging                    |

### useOtpTimer Hook

#### Parameters

```typescript
interface UseOtpTimerProps {
  initialTimer: number;
  onTimeout: () => void;
  onTick?: (currentTime: number) => void;
  debug?: boolean;
}
```

#### Returns

```typescript
interface UseOtpTimerReturn {
  timer: number; // Current timer value in seconds
  resetTimer: () => void; // Reset timer to initial value
  isActive: boolean; // Whether timer is currently running
  isExpired: boolean; // Whether timer has reached zero
  pauseTimer: () => void; // Pause the timer
  resumeTimer: () => void; // Resume paused timer
}
```

## Performance Best Practices

### 1. Memoize Callbacks

Always use `useCallback` for your event handlers:

```typescript
const handleResend = useCallback(async (count: number) => {
  // Your resend logic
}, []);

const handleTimeout = useCallback(() => {
  // Your timeout logic
}, []);
```

### 2. Stable Props

Avoid creating objects in render:

```typescript
// ❌ Bad - creates new object on every render
<OtpTimer
  containerStyle={{ padding: 16 }}
  onResend={(count) => api.resend(count)}
/>

// ✅ Good - stable references
const containerStyle = { padding: 16 };
const handleResend = useCallback((count) => api.resend(count), []);

<OtpTimer
  containerStyle={containerStyle}
  onResend={handleResend}
/>
```

### 3. Component Memoization

The OtpTimer component is already memoized, but ensure parent components don't cause unnecessary re-renders:

```typescript
const ParentComponent = React.memo(() => {
  // Component implementation
});
```

## Background Behavior

The timer automatically handles app state changes:

- **Background**: Records timestamp when app goes to background
- **Foreground**: Calculates time spent in background and updates timer accordingly
- **Accuracy**: Maintains precise timing regardless of background duration

## Error Handling

The component provides several ways to handle errors:

```typescript
const handleResend = async (count: number) => {
  try {
    await api.resendOtp();
    // Success - timer will reset automatically
  } catch (error) {
    showError('Failed to send OTP');
    throw error; // Re-throw to prevent timer reset
  }
};
```

## Testing

### Debug Mode

Enable debug mode for development:

```typescript
<OtpTimer
  debug={__DEV__}
  // ... other props
/>
```

### Testing Configuration

Use shorter timers and higher limits for testing:

```typescript
const TIMER_CONFIG = __DEV__
  ? { initialTimer: 10, resendLimit: 10 }
  : { initialTimer: 300, resendLimit: 3 };

<OtpTimer
  {...TIMER_CONFIG}
  // ... other props
/>
```

## Migration Guide

### From Basic Timer Libraries

If you're migrating from a basic countdown timer:

1. Replace timer prop with `initialTimer`
2. Add required `onResend` callback
3. Update styling props (most are compatible)
4. Add error handling to resend function

### Performance Considerations

- Callbacks are automatically memoized internally
- Component uses React.memo for render optimization
- Background timing prevents unnecessary re-renders
- All intervals and listeners are properly cleaned up

## Examples

Check out the [examples](./examples) directory for complete implementation examples including:

- Basic usage
- Custom styling
- Redux integration
- Error handling
- Testing setups

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

Made with ❤️ for the React Native community

## Author

👤 **Hamza Gulraiz**

## 📬 Support me

<p>
  <a href="mailto:devhamzagulraiz@gmail.com">
    <img alt="Email" src="https://img.shields.io/badge/email-D14836?style=for-the-badge&logo=gmail&logoColor=white"/>
  </a>
  <a href="https://www.linkedin.com/in/hamza-gulraiz-b1a105251/" target="_blank">
    <img alt="LinkedIn" src="https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white"/>
  </a>
  <a href="https://github.com/HamzaGulraiz" target="_blank">
    <img alt="GitHub" src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white"/>
  </a>
  <a href="https://stackoverflow.com/users/23890926/hamza-gulraiz" target="_blank">
    <img alt="StackOverflow" src="https://img.shields.io/badge/stack%20overflow-FE7A16?style=for-the-badge&logo=stack-overflow&logoColor=white"/>
  </a>
  <a href="https://www.npmjs.com/~dev-hamza" target="_blank">
    <img alt="npm" src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white"/>
  </a>
  <a href="https://www.instagram.com/hamza_gulraiz" target="_blank">
    <img alt="Instagram" src="https://img.shields.io/badge/instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white"/>
  </a>
  <a href="https://www.facebook.com/drago.power" target="_blank">
    <img alt="Facebook" src="https://img.shields.io/badge/facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white"/>
  </a>
</p>

---

```

```
