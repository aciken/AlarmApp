import { View, Text, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGlobalContext } from '../context/GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import BottomPopup from '../components/BottomPopup';
import axios from 'axios';


const calculateLevel = (xp) => {
  const levels = [
    { level: 1, min: 0, max: 99 },
    { level: 2, min: 100, max: 199 },
    { level: 3, min: 200, max: 299 },
    { level: 4, min: 300, max: 499 },
    { level: 5, min: 500, max: 749 },
    { level: 6, min: 750, max: 999 },
    { level: 7, min: 1000, max: 1499 },
    { level: 8, min: 1500, max: 1999 },
    { level: 9, min: 2000, max: 2899 },
    { level: 10, min: 2900, max: 3699 },
    { level: 11, min: 3700, max: Infinity }
  ];

  const currentLevel = levels.find(l => xp >= l.min && xp <= l.max);
  const nextLevel = levels[currentLevel.level] || null;

  return {
    current: currentLevel.level,
    currentMin: currentLevel.min,
    currentMax: currentLevel.max,
    nextMin: nextLevel?.min || null,
    progress: nextLevel ? 
      ((xp - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100 
      : 100
  };
};

const getSleepTitle = (level) => {
  const titles = [
    { level: 1, title: "Sleep Novice", emoji: "🌱" },
    { level: 2, title: "Sleep Student", emoji: "📚" },
    { level: 3, title: "Sleep Apprentice", emoji: "⭐" },
    { level: 4, title: "Sleep Guardian", emoji: "🛡️" },
    { level: 5, title: "Sleep Knight", emoji: "⚔️" },
    { level: 6, title: "Sleep Warrior", emoji: "🔥" },
    { level: 7, title: "Sleep Veteran", emoji: "🌟" },
    { level: 8, title: "Sleep Expert", emoji: "💫" },
    { level: 9, title: "Sleep Master", emoji: "👑" },
    { level: 10, title: "Sleep Champion", emoji: "🏆" },
    { level: 11, title: "Sleep Legend", emoji: "⚡" }
  ];

  return titles.find(t => t.level === level) || titles[0];
};

export default function Social() {
  const { setUser, setIsLogged, user } = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFriends, setShowAddFriends] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user.name || '');

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      setUser(null);
      setIsLogged(false);
      router.replace('/');
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  // Calculate level info
  const levelInfo = calculateLevel(user.xp || 0);
  const xpToNext = levelInfo.nextMin ? levelInfo.nextMin - user.xp : 0;

  // Get title and emoji based on level
  const { title, emoji } = getSleepTitle(levelInfo.current);

  // Generate random ID if not exists
  const socialId = user.socialId || Math.floor(100000 + Math.random() * 900000).toString();

  const handleNameSave = async () => {
    if (newName.trim()) {
      await updateUser({ name: newName.trim() });
      setIsEditingName(false);
    }
  };



  const FriendCard = ({ friend }) => {
    const [friendData, setFriendData] = useState(null);

    useEffect(() => {
      axios.post('https://6eea-109-245-206-230.ngrok-free.app/getUser', {
        id: friend
      }).then((res) => {
        setFriendData(res.data);
      }).catch(err => {
        console.log(err);
      });
    }, [friend]);

    if (!friendData) return null;

    return (
      <View className="bg-gray-900/50 rounded-2xl p-4 mb-4 border border-gray-800/50">
        <View className="flex-row items-center">
          {friendData.avatar ? (
            <Image
              source={{ uri: friendData.avatar }}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-gray-800 items-center justify-center">
              <Text className="text-gray-400 text-lg">
                {friendData.name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <View className="flex-1 ml-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-gray-200">
                {friendData.name}
              </Text>
              <View className="bg-yellow-500/20 px-3 py-1 rounded-full">
                <Text className="text-yellow-400 font-medium">
                  Lvl {Math.floor(friendData.xp / 100) + 1}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center mt-1">
              <View className="flex-row items-center">
                <Text className="text-sky-400 font-medium">🔥 {friendData.streak || 0} days</Text>
                <Text className="text-gray-600 mx-2">•</Text>
                <Text className="text-gray-500">{friendData.lastSleep || '0h 0m'} sleep</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  

  return (
    <LinearGradient 
      colors={['#0f172a', '#1e293b']} 
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Profile Stats */}
          <View className="mx-4 mt-6 bg-gray-900/50 rounded-3xl p-6 shadow-sm border border-gray-800/50">
            <View className="items-center">
              <View className="bg-gray-800/50 rounded-full p-1.5 mb-4">
                <View className="bg-gray-800 rounded-full p-5">
                  <Text className="text-5xl">{emoji}</Text>
                </View>
              </View>
              <Text className="text-2xl font-bold text-gray-200 mb-2">
                {title}
              </Text>
              <View className="flex-row items-center mb-4">
                <View className="bg-sky-500/20 px-3 py-1 rounded-full">
                  <Text className="text-sky-400 font-medium">Level {levelInfo.current}</Text>
                </View>
                <Text className="text-gray-500 mx-2">•</Text>
                <Text className="text-gray-500">{user.xp || 0} XP</Text>
              </View>
              <View className="w-full">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-400 text-sm">Progress</Text>
                  <Text className="text-gray-400 text-sm">
                    {levelInfo.nextMin ? `${xpToNext} XP to level ${levelInfo.current + 1}` : 'Max Level'}
                  </Text>
                </View>
                <View className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <View 
                    className="h-2 bg-sky-500 rounded-full"
                    style={{ width: `${levelInfo.progress}%` }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Profile Section */}
          <View className="mx-4 mt-8">
            <Text className="text-lg font-semibold text-gray-200 mb-4">Profile</Text>
            <View className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800/50">
              {/* Profile Picture */}
              <View className="items-center mb-6">
                <View className="relative">
                  <View className="w-24 h-24 rounded-full bg-gray-800 items-center justify-center">
                    <Text className="text-gray-400 text-4xl font-medium">
                      {(user.name?.[0] || '?').toUpperCase()}
                    </Text>
                  </View>
                  <View className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-1">
                    <View className="bg-gray-800 rounded-full p-1.5">
                      <Text className="text-sky-400 text-lg">📷</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Name */}
              <View className="mb-6">
                <Text className="text-gray-400 text-sm mb-2 font-medium">NAME</Text>
                {isEditingName ? (
                  <View className="flex-row items-center">
                    <TextInput
                      value={newName}
                      onChangeText={setNewName}
                      className="flex-1 bg-gray-800/50 rounded-xl px-4 py-2.5 text-white text-base"
                      placeholderTextColor="#64748b"
                      placeholder="Enter your name"
                    />
                    <TouchableOpacity 
                      onPress={handleNameSave}
                      className="ml-2 bg-sky-500 px-4 py-2.5 rounded-xl"
                    >
                      <Text className="text-white font-medium">Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="flex-row justify-between items-center bg-gray-800/30 rounded-xl px-4 py-2.5">
                    <Text className="text-white text-base font-medium">
                      {user.name || 'Set your name'}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => setIsEditingName(true)}
                      className="bg-sky-500/20 px-3 py-1 rounded-full"
                    >
                      <Text className="text-sky-400 font-medium">Edit</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Social ID */}
              <View>
                <Text className="text-gray-400 text-sm mb-2 font-medium">SOCIAL ID</Text>
                <View className="flex-row justify-between items-center bg-gray-800/30 rounded-xl px-4 py-2.5">
                  <Text className="text-white text-base font-medium">
                    #{socialId}
                  </Text>
                  <TouchableOpacity 
                    className="bg-gray-700/50 px-3 py-1 rounded-full"
                  >
                    <Text className="text-gray-300 font-medium">Copy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Friends */}
          <View className="px-4 mt-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-200">
                Friends
              </Text>
              <TouchableOpacity 
                onPress={() => router.push('/AddFriends')}
                className="bg-sky-500/20 px-4 py-1.5 rounded-full"
              >
                <Text className="text-sky-400 font-medium">Add Friends</Text>
              </TouchableOpacity>
            </View>

            {/* Existing Friends List */}
            {user.friends?.list?.length > 0 ? (
              user.friends.list.map((friend, index) => (
                <FriendCard key={index} friend={friend} />
              ))
            ) : (
              <View className="items-center py-8 bg-gray-900/30 mx-2 rounded-2xl border border-gray-800/30">
                <Text className="text-gray-400 text-lg mb-2">No friends yet</Text>
                <Text className="text-gray-500 text-sm">Add friends to compare sleep stats and motivate each other!</Text>
                <TouchableOpacity 
                  onPress={() => router.push('/AddFriends')}
                  className="mt-4 bg-sky-500/20 px-6 py-2 rounded-full"
                >
                  <Text className="text-sky-400 font-medium">Find Friends</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>


    </LinearGradient>
  );
}
