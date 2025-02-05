import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';

export default function FriendStats() {
  const { friendId } = useLocalSearchParams();
  const [friendData, setFriendData] = useState(null);

  useEffect(() => {
    axios.post('https://ff79-109-245-206-230.ngrok-free.app/getUser', {
      id: friendId
    }).then((res) => {
      setFriendData(res.data);
    }).catch(err => {
      console.log(err);
    });
  }, [friendId]);

  const calculateSleepStats = () => {
    if (!friendData?.sleep || friendData.sleep.length === 0) return null;

    // Get last 7 days of sleep data
    const lastWeekSleep = friendData.sleep
      .filter(s => s.sleepStartTime && s.sleepEndTime)
      .slice(-7);

    // Calculate average sleep duration
    const avgDuration = lastWeekSleep.reduce((acc, sleep) => {
      const duration = new Date(sleep.sleepEndTime) - new Date(sleep.sleepStartTime);
      return acc + duration;
    }, 0) / lastWeekSleep.length;

    const avgHours = Math.floor(avgDuration / (1000 * 60 * 60));
    const avgMinutes = Math.floor((avgDuration % (1000 * 60 * 60)) / (1000 * 60));

    // Calculate sleep consistency
    const consistency = Math.round((lastWeekSleep.length / 7) * 100);

    return {
      averageSleep: `${avgHours}h ${avgMinutes}m`,
      consistency: `${consistency}%`,
      totalNights: lastWeekSleep.length
    };
  };

  const getLastSleepInfo = () => {
    if (!friendData?.sleep || friendData.sleep.length === 0) return null;

    const lastSleep = friendData.sleep[friendData.sleep.length - 1];
    if (!lastSleep.sleepStartTime || !lastSleep.sleepEndTime) return null;

    const startTime = new Date(lastSleep.sleepStartTime);
    const endTime = new Date(lastSleep.sleepEndTime);
    const duration = endTime - startTime;
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    return {
      duration: `${hours}h ${minutes}m`,
      bedtime: startTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      wakeTime: endTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const sleepStats = calculateSleepStats();
  const lastSleep = getLastSleepInfo();

  if (!friendData) {
    return (
      <LinearGradient colors={['#0f172a', '#1e293b']} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1">
          <View className="px-4 pt-2 pb-4 flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center"
            >
              <Feather name="arrow-left" size={24} color="#94a3b8" />
            </TouchableOpacity>
            <Text className="text-lg font-medium text-white ml-2">Loading...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const level = Math.floor(friendData.xp / 100) + 1;
  const progress = (friendData.xp % 100);

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-4 pt-2 pb-4 flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <Feather name="arrow-left" size={24} color="#94a3b8" />
          </TouchableOpacity>
          <Text className="text-lg font-medium text-white ml-2">{friendData.name}'s Stats</Text>
        </View>

        <ScrollView className="flex-1 px-4">
          {/* Profile Card */}
          <View className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 mb-6 border border-slate-700/50">
            <View className="flex-row items-center">
              <View className="relative">
                {friendData.avatar ? (
                  <Image
                    source={{ uri: friendData.avatar }}
                    className="w-16 h-16 rounded-full bg-gray-800"
                  />
                ) : (
                  <View className="w-16 h-16 rounded-full bg-gray-800 items-center justify-center">
                    <Text className="text-gray-400 text-2xl font-medium">
                      {friendData.name?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
                <View className="absolute -bottom-1 -right-1 bg-slate-800 rounded-full p-1">
                  <LinearGradient
                    colors={['#0ea5e9', '#0284c7']}
                    className="rounded-full px-2 py-0.5"
                  >
                    <Text className="text-white text-xs font-medium">{level}</Text>
                  </LinearGradient>
                </View>
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-xl font-semibold text-white">{friendData.name}</Text>
                <View className="flex-row items-center mt-2">
                  <View className="flex-1 h-2 bg-slate-700/50 rounded-full mr-3">
                    <View 
                      className="h-2 bg-sky-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </View>
                  <Text className="text-gray-400 text-xs">
                    {friendData.xp % 100} / 100 XP
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <View className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 rounded-lg bg-sky-500/10 items-center justify-center">
                    <Feather name="zap" size={18} color="#0ea5e9" />
                  </View>
                  <Text className="text-sky-400 text-sm font-medium ml-2">Streak</Text>
                </View>
                <Text className="text-white text-2xl font-semibold">{friendData.streak || 0}</Text>
                <Text className="text-gray-400 text-sm mt-1">days</Text>
              </View>
            </View>
            <View className="flex-1 ml-2">
              <View className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 rounded-lg bg-emerald-500/10 items-center justify-center">
                    <Feather name="clock" size={18} color="#10b981" />
                  </View>
                  <Text className="text-emerald-400 text-sm font-medium ml-2">Avg Sleep</Text>
                </View>
                <Text className="text-white text-2xl font-semibold">{sleepStats?.averageSleep || '--'}</Text>
                <Text className="text-gray-400 text-sm mt-1">last 7 days</Text>
              </View>
            </View>
          </View>

          {/* Last Sleep Card */}
          {lastSleep && (
            <View className="bg-slate-800/40 backdrop-blur-xl rounded-2xl mb-4 border border-slate-700/50">
              <View className="p-4 border-b border-slate-700/50">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-lg bg-slate-700/50 items-center justify-center">
                      <Feather name="moon" size={18} color="#94a3b8" />
                    </View>
                    <View className="ml-3">
                      <Text className="text-gray-400 text-sm">Bedtime</Text>
                      <Text className="text-white text-base font-medium mt-0.5">
                        {lastSleep.bedtime}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className="p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-lg bg-slate-700/50 items-center justify-center">
                      <Feather name="sun" size={18} color="#94a3b8" />
                    </View>
                    <View className="ml-3">
                      <Text className="text-gray-400 text-sm">Wake Time</Text>
                      <Text className="text-white text-base font-medium mt-0.5">
                        {lastSleep.wakeTime}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-emerald-500/10 px-3 py-1 rounded-full">
                    <Text className="text-emerald-400 font-medium">{lastSleep.duration}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Weekly Stats */}
          <View className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
            <Text className="text-lg font-semibold text-white mb-4">Weekly Overview</Text>
            <View className="space-y-4">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-lg bg-sky-500/10 items-center justify-center">
                    <Feather name="check-circle" size={18} color="#0ea5e9" />
                  </View>
                  <Text className="text-gray-300 ml-3">Consistency</Text>
                </View>
                <Text className="text-sky-400 font-semibold">{sleepStats?.consistency || '0%'}</Text>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-lg bg-slate-700/50 items-center justify-center">
                    <Feather name="moon" size={18} color="#94a3b8" />
                  </View>
                  <Text className="text-gray-300 ml-3">Nights Tracked</Text>
                </View>
                <Text className="text-white font-semibold">{sleepStats?.totalNights || 0} / 7</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
} 