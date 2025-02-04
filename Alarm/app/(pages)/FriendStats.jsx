import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FriendStats() {
  const { friendId } = useLocalSearchParams();
  const [friendData, setFriendData] = useState(null);

  useEffect(() => {
    axios.post('https://3f3b-109-245-206-230.ngrok-free.app/getUser', {
      id: friendId
    }).then((res) => {
      setFriendData(res.data);
    }).catch(err => {
      console.log(err);
    });
  }, [friendId]);

  if (!friendData) {
    return (
      <LinearGradient colors={['#0f172a', '#1e293b']} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1">
          <View className="px-4 pt-2 pb-4 flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center"
            >
              <Text className="text-2xl text-gray-400">←</Text>
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
            <Text className="text-2xl text-gray-400">←</Text>
          </TouchableOpacity>
          <Text className="text-lg font-medium text-white ml-2">{friendData.name}'s Stats</Text>
        </View>

        <ScrollView className="flex-1 px-4">
          {/* Profile Card */}
          <View className="bg-gray-900/50 rounded-2xl p-4 mb-6 border border-gray-800/50">
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
                <View className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-0.5">
                  <View className="bg-gray-800 rounded-full px-1.5">
                    <Text className="text-gray-400 text-xs font-medium">{level}</Text>
                  </View>
                </View>
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-xl font-semibold text-white">{friendData.name}</Text>
                <View className="flex-row items-center mt-1">
                  <View className="flex-1 h-1 bg-gray-800 rounded-full mr-3">
                    <View 
                      className="h-1 bg-sky-500 rounded-full"
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

          {/* Stats Cards */}
          <View className="flex-row mb-4">
            <View className="flex-1 bg-gray-900/50 rounded-2xl p-4 mr-2 border border-gray-800/50">
              <Text className="text-sky-400 text-2xl font-bold mb-1">🔥 {friendData.streak || 0}</Text>
              <Text className="text-gray-400">Day Streak</Text>
            </View>
            <View className="flex-1 bg-gray-900/50 rounded-2xl p-4 ml-2 border border-gray-800/50">
              <Text className="text-sky-400 text-2xl font-bold mb-1">{friendData.lastSleep || '0h'}</Text>
              <Text className="text-gray-400">Last Sleep</Text>
            </View>
          </View>

          {/* Sleep History */}
          <View className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800/50">
            <Text className="text-lg font-semibold text-white mb-4">Sleep History</Text>
            {friendData.sleeps?.slice(0, 7).map((sleep, index) => (
              <View key={index} className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-400">{new Date(sleep.date).toLocaleDateString()}</Text>
                <Text className="text-white font-medium">{sleep.duration}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
} 