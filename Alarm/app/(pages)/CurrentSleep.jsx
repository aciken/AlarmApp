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

    axios.put('https://4c00-109-245-202-17.ngrok-free.app/endsleep', {
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
        {/* Minimal Header */}
        <View className="flex-row items-center px-4 pt-2">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <Text className="text-2xl text-gray-400">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-lg font-medium ml-2">Sleep Session</Text>
        </View>

        <View className="flex-1 px-6">
          {/* Main Content */}
          <View className="flex-1 justify-center -mt-12">
            {/* Animated Moon */}
            <Animated.View 
              style={{ transform: [{ scale: pulseAnim }] }}
              className="items-center mb-8"
            >
              <LinearGradient
                colors={['rgba(99, 102, 241, 0.2)', 'rgba(99, 102, 241, 0.1)']}
                className="rounded-full p-8"
              >
                <Text className="text-7xl">💤</Text>
              </LinearGradient>
            </Animated.View>

            {/* Sleep Duration */}
            <View className="items-center mb-8">
              <Text className="text-gray-400 text-base mb-3">Sleep Duration</Text>
              <Text className="text-white text-7xl font-bold tracking-tight">
                {hours}
                <Text className="text-gray-500 text-5xl font-light">:</Text>
                {minutes}
              </Text>
            </View>

            {/* Sleep Info Card */}
            <View className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <View className="flex-row justify-between items-center mb-6">
                <View>
                  <Text className="text-gray-400 text-sm">Started</Text>
                  <Text className="text-white text-xl font-medium mt-1">
                    {new Date(currentSleep.sleepStartTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </Text>
                </View>
                <View className="h-8 w-[1px] bg-gray-700" />
                <View>
                  <Text className="text-gray-400 text-sm">Wake up</Text>
                  <Text className="text-white text-xl font-medium mt-1">
                    {user?.wakeup?.time ? 
                      new Date(user.wakeup.time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      }) : '--:--'
                    }
                  </Text>
                </View>
              </View>

              {/* Sleep Progress */}
              <View className="space-y-2">
                <View className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <LinearGradient
                    colors={['#6366f1', '#3b82f6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(Math.round((parseInt(hours) / 8) * 100), 100)}%` }}
                  />
                </View>
                <Text className="text-gray-500 text-xs text-center">
                  {Math.round((parseInt(hours) / 8) * 100)}% of target sleep
                </Text>
              </View>
            </View>
          </View>

          {/* End Sleep Button - Fixed at bottom */}
          <View className="pb-8">
            <TouchableOpacity 
              onPress={handleEndSleep}
              className="w-full"
            >
              <LinearGradient
                colors={['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.05)']}
                className="w-full py-4 rounded-xl border border-red-500/20"
              >
                <Text className="text-red-400 text-center font-medium text-lg">
                  End Sleep Session
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
