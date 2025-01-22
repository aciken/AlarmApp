import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { useGlobalContext } from '../context/GlobalProvider';

const { width } = Dimensions.get('window');

export default function Alarm() {
  const { user, updateUser } = useGlobalContext();
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for the alarm icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Timer for how long alarm has been ringing
    const startTime = new Date();
    const timer = setInterval(() => {
      const now = new Date();
      const diff = now - startTime;
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSnooze = () => {
    // Add 10 minutes to current time
    const snoozeTime = new Date(new Date().getTime() + 10 * 60000);
    updateUser({
      wakeup: {
        ...user.wakeup,
        time: snoozeTime
      }
    });
    router.back();
  };

  const handleStopAlarm = () => {
    // Reset alarm
    updateUser({
      wakeup: {
        ...user.wakeup,
        time: null
      }
    });
    router.back();
  };

  const handleSlideComplete = () => {
    handleStopAlarm();
  };

  const onSlide = Animated.event(
    [{ nativeEvent: { translationX: slideAnim } }],
    { useNativeDriver: true }
  );

  return (
    <LinearGradient 
      colors={['#312e81', '#1e1b4b']}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-center items-center">
          {/* Time */}
          <Text className="text-white text-7xl font-bold mb-4">
            {new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })}
          </Text>
          <Text className="text-indigo-200 text-xl mb-12">Time to Wake Up!</Text>

          {/* Animated Alarm Icon */}
          <Animated.View 
            style={{ 
              transform: [{ scale: pulseAnim }],
              marginBottom: 48
            }}
          >
            <LinearGradient
              colors={['rgba(99, 102, 241, 0.3)', 'rgba(99, 102, 241, 0.1)']}
              className="rounded-full p-8"
            >
              <Text className="text-8xl">⏰</Text>
            </LinearGradient>
          </Animated.View>

          {/* Alarm Duration */}
          <Text className="text-indigo-300 text-base mb-16">
            Alarm ringing for {elapsedTime}
          </Text>

          {/* Actions */}
          <View className="w-full px-6 space-y-4">
            {/* Snooze Button */}
            <TouchableOpacity
              onPress={handleSnooze}
              className="w-full bg-indigo-500/20 py-4 rounded-2xl border border-indigo-500/30"
            >
              <Text className="text-white text-lg font-semibold text-center">
                Snooze (10 min)
              </Text>
            </TouchableOpacity>

            {/* Slide to Stop */}
            <View className="bg-red-500/10 rounded-2xl border border-red-500/30 overflow-hidden">
              <Animated.View
                style={{
                  transform: [{
                    translateX: slideAnim.interpolate({
                      inputRange: [0, width - 100],
                      outputRange: [0, width - 100],
                      extrapolate: 'clamp',
                    }),
                  }],
                }}
              >
                <TouchableOpacity
                  onPress={handleStopAlarm}
                  className="bg-red-500/20 p-4 rounded-2xl"
                >
                  <Text className="text-red-300 text-lg font-semibold text-center">
                    Slide to Stop
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
