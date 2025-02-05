import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, useRef } from 'react';
import { router } from 'expo-router';
import axios from 'axios';
import { useGlobalContext } from '../context/GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

export default function CurrentSleep() {
  const { user, setUser, updateUser } = useGlobalContext();
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const currentSleep = user.sleep.find(sleep => sleep.sleepEndTime === null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

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

  // New progress animation
  useEffect(() => {
    if (currentSleep) {
      Animated.timing(progressAnim, {
        toValue: Math.min(parseInt(hours) / 8, 1),
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [hours]);

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

    axios.put('https://ff79-109-245-206-230.ngrok-free.app/endsleep', {
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
        {/* Enhanced Header */}
        <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-2 rounded-full bg-slate-800/30"
          >
            <Feather name="chevron-down" size={24} color="#94a3b8" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold">Sleep Session</Text>
          <View className="w-8" />{/* Properly formatted spacer */}
        </View>

        <View className="flex-1 px-6">
          {/* Main Content */}
          <View className="flex-1 justify-center">
            {/* Animated Progress Circle */}
            <View className="items-center mb-12">
              <Animated.View 
                style={{ 
                  transform: [{ scale: pulseAnim }],
                  shadowColor: '#0ea5e9',
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                }}
              >
                <LinearGradient
                  colors={['rgba(14, 165, 233, 0.15)', 'rgba(30, 58, 138, 0.1)']}
                  className="w-64 h-64 rounded-full items-center justify-center p-1"
                >
                  <View className="w-full h-full bg-slate-900/80 rounded-full items-center justify-center">
                    <Text className="text-6xl mb-2">🌙</Text>
                    <Text className="text-white text-4xl font-bold">
                      {hours}<Text className="text-slate-600">:</Text>{minutes}
                    </Text>
                    <Text className="text-slate-400 text-sm mt-2">Sleep Duration</Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Stats Grid */}
            <View className="flex-row mb-6">
              <View className="flex-1 mr-2 bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 rounded-lg bg-emerald-500/10 items-center justify-center mr-2">
                    <Feather name="moon" size={18} color="#10b981" />
                  </View>
                  <Text className="text-emerald-400 text-sm">Started At</Text>
                </View>
                <Text className="text-white text-xl font-medium">
                  {new Date(currentSleep.sleepStartTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}
                </Text>
              </View>

              <View className="flex-1 ml-2 bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 rounded-lg bg-amber-500/10 items-center justify-center mr-2">
                    <Feather name="sunrise" size={18} color="#f59e0b" />
                  </View>
                  <Text className="text-amber-400 text-sm">Wake Up At</Text>
                </View>
                <Text className="text-white text-xl font-medium">
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

            {/* Progress Section */}
            <View className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
              <View className="flex-row justify-between mb-3">
                <Text className="text-slate-400 text-sm">Sleep Progress</Text>
                <Text className="text-slate-400 text-sm">
                  {Math.round((parseInt(hours) / 8) * 100)}% of goal
                </Text>
              </View>
              
              <View className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <Animated.View
                  style={{
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    }),
                    height: '100%',
                  }}
                >
                  <LinearGradient
                    colors={['#0ea5e9', '#3b82f6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="h-full rounded-full"
                  />
                </Animated.View>
              </View>
            </View>
          </View>

          {/* Enhanced End Button */}
          <View className="pb-6">
            <TouchableOpacity 
              onPress={handleEndSleep}
              className="w-full overflow-hidden rounded-xl"
            >
              <LinearGradient
                colors={['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)']}
                className="w-full py-4 rounded-xl border border-red-500/30"
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
