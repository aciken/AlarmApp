import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, useRef } from 'react';
import { router } from 'expo-router';
import axios from 'axios';
import { useGlobalContext } from '../context/GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CurrentSleep() {
  const { user, setUser, updateUser } = useGlobalContext();
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const currentSleep = user.sleep.find(sleep => sleep.sleepEndTime === null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!currentSleep) {
      router.back();
      return;
    }

    // Initial calculation
    const start = new Date(currentSleep.sleepStartTime);
    const now = new Date();
    const diff = now - start;
    
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    setHours(h.toString().padStart(2, '0'));
    setMinutes(m.toString().padStart(2, '0'));

    // Subtle pulse animation for the emoji
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Timer logic
    const timer = setInterval(() => {
      const start = new Date(currentSleep.sleepStartTime);
      const now = new Date();
      const diff = now - start;
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setHours(h.toString().padStart(2, '0'));
      setMinutes(m.toString().padStart(2, '0'));
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSleep]);

  if (!currentSleep) {
    return null;
  }

  const handleEndSleep = async () => {

    await updateUser({
        sleep: user.sleep.map(sleep => 
            sleep._id === currentSleep._id ? { ...sleep, sleepEndTime: new Date() } : sleep
        )
    });

    const storedUser = await AsyncStorage.getItem('@user');
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    axios.put('https://5d69-109-245-202-17.ngrok-free.app/endsleep', {
      userId: user._id,
      sleepId: currentSleep._id,
      sleepEndTime: new Date()
    })
    .then((res) => {
      if(res.status == 200){
        setUser(res.data);
        AsyncStorage.setItem('@user', JSON.stringify(res.data));
      }
    });
  };

  return (
    <LinearGradient 
      colors={['#0f172a', '#1e293b']} 
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center px-4 pt-2">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <Text className="text-2xl text-gray-400">←</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 justify-center px-6">
          <View className="items-center">
            {/* Animated Moon */}
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <LinearGradient
                colors={['rgba(99, 102, 241, 0.2)', 'rgba(99, 102, 241, 0.1)']}
                className="rounded-full p-8 mb-12"
              >
                <Text className="text-7xl">💤</Text>
              </LinearGradient>
            </Animated.View>

            {/* Time Display */}
            <View className="bg-white/5 rounded-3xl p-6 mb-12 border border-white/10">
              <View className="flex-row items-baseline justify-center">
                <View className="items-center">
                  <Text className="text-white text-6xl font-bold tracking-tight">
                    {hours}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-2">hours</Text>
                </View>
                <Text className="text-gray-500 text-4xl font-extralight mx-3 mb-4">:</Text>
                <View className="items-center">
                  <Text className="text-white text-6xl font-bold tracking-tight">
                    {minutes}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-2">minutes</Text>
                </View>
              </View>
              <LinearGradient
                colors={['#6366f1', '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-4 py-1 rounded-full mt-4 mx-auto"
              >
                <Text className="text-white text-sm font-medium tracking-wide">Deep Sleep</Text>
              </LinearGradient>
            </View>

            {/* Time Info */}
            <View className="bg-white/5 rounded-3xl p-6 mb-16 w-full border border-white/10">
              <View className="flex-row justify-between mb-4">
                <View>
                  <Text className="text-gray-400 text-sm mb-1">Started</Text>
                  <Text className="text-white text-2xl font-semibold">
                    {new Date(currentSleep.sleepStartTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-gray-400 text-sm mb-1">Wake up</Text>
                  <Text className="text-white text-2xl font-semibold">
                    {new Date(user.wakeup.time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </Text>
                </View>
              </View>
              <LinearGradient
                colors={['rgba(99, 102, 241, 0.2)', 'rgba(59, 130, 246, 0.2)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-1 rounded-full"
              />
            </View>

            {/* End Sleep Button */}
            <TouchableOpacity 
              onPress={handleEndSleep}
              className="items-center"
            >
              <LinearGradient
                colors={['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.05)']}
                className="rounded-full p-4 mb-2"
              >
                <Text className="text-3xl">⏰</Text>
              </LinearGradient>
              <Text className="text-red-400/90 text-base font-medium">End Sleep</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
