import { View, Text, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGlobalContext } from '../context/GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import BottomPopup from '../components/BottomPopup';
import axios from 'axios';
import { Feather } from '@expo/vector-icons';

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
      axios.post('https://3f3b-109-245-206-230.ngrok-free.app/getUser', {
        id: friend
      }).then((res) => {
        setFriendData(res.data);
      }).catch(err => {
        console.log(err);
      });
    }, [friend]);

    if (!friendData) return null;

    // Calculate last sleep duration and time
    const getLastSleepInfo = () => {
      if (!friendData.sleep || friendData.sleep.length === 0) {
        return { duration: null, timeAgo: null };
      }

      const lastSleep = friendData.sleep[friendData.sleep.length - 1];
      if (!lastSleep.sleepStartTime || !lastSleep.sleepEndTime) {
        return { duration: null, timeAgo: null };
      }

      const startTime = new Date(lastSleep.sleepStartTime);
      const endTime = new Date(lastSleep.sleepEndTime);
      const duration = endTime - startTime;
      
      // Calculate duration in hours and minutes
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      
      // Calculate how long ago
      const now = new Date();
      const hoursAgo = Math.floor((now - endTime) / (1000 * 60 * 60));
      
      let timeAgo;
      if (hoursAgo < 1) {
        timeAgo = 'Just now';
      } else if (hoursAgo < 24) {
        timeAgo = `${hoursAgo}h ago`;
      } else {
        const daysAgo = Math.floor(hoursAgo / 24);
        timeAgo = `${daysAgo}d ago`;
      }

      return {
        duration: `${hours}h ${minutes}m`,
        timeAgo
      };
    };

    const sleepInfo = getLastSleepInfo();

    return (
      <TouchableOpacity 
        onPress={() => router.push({
          pathname: "/FriendStats",
          params: { friendId: friend }
        })}
        className="bg-gray-900/50 rounded-2xl p-4 mb-4 border border-gray-800/50"
      >
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
            <View className="flex-row items-center justify-between mt-1">
              <View className="flex-row items-center">
                <View className="flex-row items-center">
                  <Text className="text-sky-400 font-medium">
                    <Text style={{ fontSize: 14 }}>🔥</Text> {friendData.streak || 0} days
                  </Text>
                </View>
                <Text className="text-gray-600 mx-2">•</Text>
                {sleepInfo.duration ? (
                  <View className="flex-row items-center">
                    <View className="w-4 h-4 rounded-full bg-slate-700/50 items-center justify-center mr-1">
                      <Feather name="moon" size={12} color="#94a3b8" />
                    </View>
                    <Text className="text-gray-400">{sleepInfo.duration}</Text>
                    <Text className="text-gray-600 mx-1">•</Text>
                    <Text className="text-gray-500">{sleepInfo.timeAgo}</Text>
                  </View>
                ) : (
                  <Text className="text-gray-500">No recent sleep</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
          {/* Profile Section */}
          <View className="mx-4 mt-8">
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

          {/* Friends Section */}
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

            {/* Friends List */}
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
