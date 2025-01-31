import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useGlobalContext } from '../context/GlobalProvider';

export default function SleepDetails() {
  const { user } = useGlobalContext();
  const { sleepId } = useLocalSearchParams();

  const sleep = user.sleep.find(s => s._id === sleepId);
  if (!sleep) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const calculateDuration = (start, end) => {
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  };

  const { hours, minutes } = calculateDuration(sleep.sleepStartTime, sleep.sleepEndTime);

  const getQualityColor = (hours) => {
    if (hours >= 8) return 'bg-emerald-500/20 text-emerald-400';
    if (hours >= 7) return 'bg-sky-500/20 text-sky-400';
    if (hours >= 6) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
  };

  const getQualityText = (hours) => {
    if (hours >= 8) return 'Excellent';
    if (hours >= 7) return 'Good';
    if (hours >= 6) return 'Fair';
    return 'Poor';
  };

  const qualityColor = getQualityColor(hours);

  return (
    <LinearGradient 
      colors={['#0f172a', '#1e293b']} 
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <View className="px-4 pt-2 pb-6">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center"
            >
              <Text className="text-2xl text-gray-400">←</Text>
            </TouchableOpacity>
            <Text className="text-white text-lg font-medium ml-2">Sleep Details</Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-4">
          {/* Date Card */}
          <View className="items-center mb-6">
            <Text className="text-gray-400 text-lg">
              {formatDate(sleep.sleepStartTime)}
            </Text>
          </View>

          {/* Duration Card */}
          <LinearGradient
            colors={['rgba(56, 189, 248, 0.1)', 'rgba(59, 130, 246, 0.05)']}
            className="rounded-2xl p-6 border border-sky-500/20 mb-6"
          >
            <View className="items-center">
              <Text className="text-5xl font-bold text-white mb-2">
                {hours}h {minutes}m
              </Text>
              <View className={`px-4 py-1.5 rounded-full ${qualityColor.split(' ')[0]}`}>
                <Text className={`text-sm font-medium ${qualityColor.split(' ')[1]}`}>
                  {getQualityText(hours)}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Time Details */}
          <View className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-gray-400 text-sm mb-1">Started</Text>
                <Text className="text-xl text-white font-medium">
                  {formatTime(sleep.sleepStartTime)}
                </Text>
              </View>
              <View className="h-8 w-[1px] bg-gray-800" />
              <View>
                <Text className="text-gray-400 text-sm mb-1">Ended</Text>
                <Text className="text-xl text-white font-medium">
                  {formatTime(sleep.sleepEndTime)}
                </Text>
              </View>
            </View>
            
            <LinearGradient
              colors={['rgba(99, 102, 241, 0.2)', 'rgba(59, 130, 246, 0.2)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-1.5 rounded-full"
              style={{ width: `${Math.min((hours / 9) * 100, 100)}%` }}
            />
          </View>

          {/* Sleep Stats */}
          <View className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <Text className="text-sky-400 text-sm font-medium mb-4">SLEEP STATS</Text>
            <View className="space-y-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-400">Sleep Goal</Text>
                <Text className="text-white font-medium">8 hours</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-400">Goal Progress</Text>
                <Text className="text-white font-medium">
                  {Math.round((hours / 8) * 100)}%
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-400">Sleep Quality</Text>
                <Text className={qualityColor.split(' ')[1] + " font-medium"}>
                  {getQualityText(hours)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
} 