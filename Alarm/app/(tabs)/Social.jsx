import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGlobalContext } from '../context/GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function Social() {
  const { setUser, setIsLogged } = useGlobalContext();

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
                  <Text className="text-4xl">😴</Text>
                </View>
              </View>
              <Text className="text-2xl font-bold text-gray-200 mb-1">
                Sleep Master
              </Text>
              <Text className="text-gray-500 mb-4">
                Level 28 • 2,450 XP
              </Text>
              <View className="w-full h-2 bg-gray-800 rounded-full">
                <View 
                  className="h-2 bg-sky-500 rounded-full"
                  style={{ width: '75%' }}
                />
              </View>
              <Text className="text-sm text-gray-500 mt-2">
                550 XP to next level
              </Text>
            </View>
          </View>

          {/* Logout Button */}
          <View className="px-4 mt-8">
            <TouchableOpacity 
              onPress={handleLogout}
              className="bg-red-500/80 p-4 rounded-xl"
            >
              <Text className="text-white text-center font-semibold text-lg">
                Logout
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recent Achievements */}
          <View className="px-4 mt-8">
            <Text className="text-lg font-semibold text-gray-200 mb-4">
              Recent Achievements
            </Text>
            <View className="space-y-4">
              {achievements.map((achievement, index) => (
                <View key={index} className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800/50">
                  <View className="flex-row items-start">
                    <Text className="text-2xl mr-3">{achievement.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-200">
                        {achievement.title}
                      </Text>
                      <Text className="text-sm text-gray-500 mt-1">
                        {achievement.description}
                      </Text>
                      <Text className="text-xs text-sky-400 mt-2">
                        {achievement.date}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Friends */}
          <View className="px-4 mt-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-200">
                Friends
              </Text>
              <TouchableOpacity>
                <Text className="text-sky-400 font-medium">See All</Text>
              </TouchableOpacity>
            </View>
            {friends.map((friend, index) => (
              <FriendCard key={index} friend={friend} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
