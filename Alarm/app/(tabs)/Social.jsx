import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function Social() {
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
    <View className="bg-white/80 rounded-2xl p-4 mb-4">
      <View className="flex-row items-center">
        <Image
          source={{ uri: friend.avatar }}
          className="w-12 h-12 rounded-full"
        />
        <View className="flex-1 ml-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-gray-800">
              {friend.name}
            </Text>
            <View className="bg-yellow-100 px-3 py-1 rounded-full">
              <Text className="text-yellow-600 font-medium">
                Lvl {friend.level}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center mt-1">
            <View className="flex-row items-center">
              <Text className="text-sky-500 font-medium">🔥 {friend.streak} days</Text>
              <Text className="text-gray-400 mx-2">•</Text>
              <Text className="text-gray-500">{friend.lastSleep} sleep</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient 
      colors={['#f8fafc', '#e0f2fe']} 
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Profile Stats */}
          <View className="mx-4 mt-6 bg-white/80 rounded-3xl p-6 shadow-sm">
            <View className="items-center">
              <View className="bg-sky-50 rounded-full p-1 mb-4">
                <View className="bg-sky-100 rounded-full p-4">
                  <Text className="text-4xl">😴</Text>
                </View>
              </View>
              <Text className="text-2xl font-bold text-gray-800 mb-1">
                Sleep Master
              </Text>
              <Text className="text-gray-500 mb-4">
                Level 28 • 2,450 XP
              </Text>
              <View className="w-full h-2 bg-gray-100 rounded-full">
                <View 
                  className="h-2 bg-sky-400 rounded-full"
                  style={{ width: '75%' }}
                />
              </View>
              <Text className="text-sm text-gray-500 mt-2">
                550 XP to next level
              </Text>
            </View>
          </View>

          {/* Recent Achievements */}
          <View className="px-4 mt-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Recent Achievements
            </Text>
            <View className="space-y-4">
              {achievements.map((achievement, index) => (
                <View key={index} className="bg-white/80 rounded-2xl p-4">
                  <View className="flex-row items-start">
                    <Text className="text-2xl mr-3">{achievement.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-800">
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
              <Text className="text-lg font-semibold text-gray-800">
                Friends
              </Text>
              <TouchableOpacity>
                <Text className="text-sky-500 font-medium">See All</Text>
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
