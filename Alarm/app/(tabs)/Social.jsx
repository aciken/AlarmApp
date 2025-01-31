import { View, Text, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGlobalContext } from '../context/GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import BottomPopup from '../components/BottomPopup';

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

  const friends = [
    {
      name: 'Sarah M.',
      streak: 15,
      lastSleep: '8h 12m',
      level: 24,
      avatar: 'https://i.pravatar.cc/100?img=47'
    },
    {
      name: 'Mike R.',
      streak: 7,
      lastSleep: '7h 45m',
      level: 18,
      avatar: 'https://i.pravatar.cc/100?img=68'
    },
    {
      name: 'Emma W.',
      streak: 21,
      lastSleep: '8h 30m',
      level: 32,
      avatar: 'https://i.pravatar.cc/100?img=45'
    }
  ];

  const achievements = [
    {
      title: 'Perfect Week',
      description: 'Maintained sleep schedule for 7 days',
      date: '2 days ago',
      icon: '🌟'
    },
    {
      title: 'Early Riser',
      description: 'Woke up before 7 AM for 5 consecutive days',
      date: '4 days ago',
      icon: '🌅'
    }
  ];

  const pendingRequests = [
    {
      name: 'John D.',
      level: 15,
      avatar: 'https://i.pravatar.cc/100?img=52'
    },
    {
      name: 'Alice K.',
      level: 8,
      avatar: 'https://i.pravatar.cc/100?img=44'
    }
  ];

  const suggestedFriends = [
    {
      name: 'David L.',
      level: 19,
      avatar: 'https://i.pravatar.cc/100?img=53',
      mutualFriends: 3
    },
    {
      name: 'Sophie R.',
      level: 12,
      avatar: 'https://i.pravatar.cc/100?img=41',
      mutualFriends: 2
    }
  ];

  const FriendCard = ({ friend }) => (
    <View className="bg-gray-900/50 rounded-2xl p-4 mb-4 border border-gray-800/50">
      <View className="flex-row items-center">
        <Image
          source={{ uri: friend.avatar }}
          className="w-12 h-12 rounded-full"
        />
        <View className="flex-1 ml-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-gray-200">
              {friend.name}
            </Text>
            <View className="bg-yellow-500/20 px-3 py-1 rounded-full">
              <Text className="text-yellow-400 font-medium">
                Lvl {friend.level}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center mt-1">
            <View className="flex-row items-center">
              <Text className="text-sky-400 font-medium">🔥 {friend.streak} days</Text>
              <Text className="text-gray-600 mx-2">•</Text>
              <Text className="text-gray-500">{friend.lastSleep} sleep</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const AddFriendsContent = () => (
    <View className="flex-1 px-4">
      <Text className="text-lg font-semibold text-white mb-6">Add Friends</Text>
      
      {/* Search Bar */}
      <View className="bg-gray-800/50 rounded-xl p-3 mb-6 border border-gray-700/50">
        <TextInput
          placeholder="Search by username..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="text-white text-base"
        />
      </View>

      {/* Friend Requests */}
      {pendingRequests.length > 0 && (
        <View className="mb-6">
          <Text className="text-sky-400 text-sm font-medium mb-3">
            PENDING REQUESTS
          </Text>
          {pendingRequests.map((request, index) => (
            <View key={index} className="bg-gray-900/50 rounded-xl p-4 mb-3 border border-gray-800/50">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Image
                    source={{ uri: request.avatar }}
                    className="w-10 h-10 rounded-full"
                  />
                  <View className="ml-3 flex-1">
                    <Text className="text-white font-medium">{request.name}</Text>
                    <Text className="text-gray-400 text-sm">Level {request.level}</Text>
                  </View>
                </View>
                <View className="flex-row">
                  <TouchableOpacity className="bg-sky-500 px-4 py-1.5 rounded-full mr-2">
                    <Text className="text-white font-medium">Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="bg-gray-800 px-4 py-1.5 rounded-full">
                    <Text className="text-gray-400 font-medium">Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Suggested Friends */}
      <View>
        <Text className="text-sky-400 text-sm font-medium mb-3">
          SUGGESTED FRIENDS
        </Text>
        {suggestedFriends.map((friend, index) => (
          <View key={index} className="bg-gray-900/50 rounded-xl p-4 mb-3 border border-gray-800/50">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Image
                  source={{ uri: friend.avatar }}
                  className="w-10 h-10 rounded-full"
                />
                <View className="ml-3 flex-1">
                  <Text className="text-white font-medium">{friend.name}</Text>
                  <Text className="text-gray-400 text-sm">
                    {friend.mutualFriends} mutual friends • Level {friend.level}
                  </Text>
                </View>
              </View>
              <TouchableOpacity className="bg-sky-500/20 px-4 py-1.5 rounded-full">
                <Text className="text-sky-400 font-medium">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

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
              <View className="bg-gray-800/50 rounded-full p-1 mb-4">
                <View className="bg-gray-800 rounded-full p-4">
                  <Text className="text-4xl">{emoji}</Text>
                </View>
              </View>
              <Text className="text-2xl font-bold text-gray-200 mb-1">
                {title}
              </Text>
              <Text className="text-gray-500 mb-4">
                Level {levelInfo.current} • {user.xp || 0} XP
              </Text>
              <View className="w-full h-2 bg-gray-800 rounded-full">
                <View 
                  className="h-2 bg-sky-500 rounded-full"
                  style={{ width: `${levelInfo.progress}%` }}
                />
              </View>
              {levelInfo.nextMin && (
                <Text className="text-sm text-gray-500 mt-2">
                  {xpToNext} XP to level {levelInfo.current + 1}
                </Text>
              )}
            </View>
          </View>

          {/* Profile Section */}
          <View className="mx-4 mt-8">
            <Text className="text-lg font-semibold text-gray-200 mb-4">Profile</Text>
            <View className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800/50">
              {/* Profile Picture */}
              <View className="items-center mb-6">
                <View className="w-24 h-24 rounded-full bg-gray-800 items-center justify-center">
                  <Text className="text-gray-400 text-4xl">
                    {(user.name?.[0] || '?').toUpperCase()}
                  </Text>
                </View>
                <Text className="text-sky-400 text-sm mt-2">Change Photo</Text>
              </View>

              {/* Name */}
              <View className="mb-6">
                <Text className="text-gray-400 text-sm mb-2">Name</Text>
                {isEditingName ? (
                  <View className="flex-row items-center">
                    <TextInput
                      value={newName}
                      onChangeText={setNewName}
                      className="flex-1 bg-gray-800/50 rounded-xl px-4 py-2 text-white text-lg"
                      placeholderTextColor="#64748b"
                      placeholder="Enter your name"
                    />
                    <TouchableOpacity 
                      onPress={handleNameSave}
                      className="ml-2 bg-sky-500 px-4 py-2 rounded-xl"
                    >
                      <Text className="text-white font-medium">Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-white text-lg">
                      {user.name || 'Set your name'}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => setIsEditingName(true)}
                      className="bg-sky-500/20 px-3 py-1 rounded-full"
                    >
                      <Text className="text-sky-400">Edit</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Social ID */}
              <View>
                <Text className="text-gray-400 text-sm mb-2">Social ID</Text>
                <View className="flex-row justify-between items-center bg-gray-800/50 rounded-xl px-4 py-3">
                  <Text className="text-white text-lg font-medium">
                    #{socialId}
                  </Text>
                  <TouchableOpacity 
                    className="bg-gray-700/50 px-3 py-1 rounded-full"
                  >
                    <Text className="text-gray-300">Copy</Text>
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
                onPress={() => setShowAddFriends(true)}
                className="bg-sky-500/20 px-4 py-1.5 rounded-full"
              >
                <Text className="text-sky-400 font-medium">Add Friends</Text>
              </TouchableOpacity>
            </View>

            {/* Existing Friends List */}
            {friends.map((friend, index) => (
              <FriendCard key={index} friend={friend} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Add Friends Bottom Sheet */}
      <BottomPopup
        visible={showAddFriends}
        onClose={() => setShowAddFriends(false)}
        height={0.8}
      >
        <AddFriendsContent />
      </BottomPopup>
    </LinearGradient>
  );
}
