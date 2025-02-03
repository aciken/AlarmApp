import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useGlobalContext } from '../context/GlobalProvider';

export default function AllSleeps() {
  const { user } = useGlobalContext();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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

  // Filter last month's sleeps
  const lastMonthSleeps = user.sleep
    .filter(sleep => sleep.sleepEndTime)
    .sort((a, b) => new Date(b.sleepStartTime) - new Date(a.sleepStartTime));

  const averageHours = (lastMonthSleeps.reduce((acc, sleep) => {
    const { hours } = calculateDuration(sleep.sleepStartTime, sleep.sleepEndTime);
    return acc + hours;
  }, 0) / lastMonthSleeps.length || 0).toFixed(1);

  const goodNights = lastMonthSleeps.filter(sleep => {
    const { hours } = calculateDuration(sleep.sleepStartTime, sleep.sleepEndTime);
    return hours >= 7;
  }).length;

  return (
    <LinearGradient 
      colors={['#0f172a', '#1e293b']} 
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        {/* Elegant Header */}
        <View className="px-4 pt-2 pb-6">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center"
            >
              <Text className="text-2xl text-gray-400">↓</Text>
            </TouchableOpacity>
            <Text className="text-white text-lg font-medium ml-2">Sleep History</Text>
          </View>
        </View>

        {/* Monthly Overview Card - More compact */}
        <View className="px-4">
          <LinearGradient
            colors={['rgba(56, 189, 248, 0.1)', 'rgba(59, 130, 246, 0.05)']}
            className="rounded-2xl p-4 border border-sky-500/20"
          >
            <Text className="text-sky-400 text-sm font-medium mb-3">MONTHLY OVERVIEW</Text>
            
            <View className="flex-row justify-between mb-4">
              <View>
                <Text className="text-3xl font-bold text-white mb-0.5">{averageHours}h</Text>
                <Text className="text-gray-400 text-xs">Average Sleep</Text>
              </View>
              <View className="items-end">
                <Text className="text-3xl font-bold text-white mb-0.5">{goodNights}</Text>
                <Text className="text-gray-400 text-xs">Good Nights</Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="items-center flex-1">
                <Text className="text-xl font-bold text-white mb-0.5">{lastMonthSleeps.length}</Text>
                <Text className="text-gray-400 text-xs">Total Sleeps</Text>
              </View>
              <View className="h-6 w-[1px] bg-sky-500/20" />
              <View className="items-center flex-1">
                <Text className="text-xl font-bold text-white mb-0.5">
                  {Math.round((goodNights / lastMonthSleeps.length) * 100)}%
                </Text>
                <Text className="text-gray-400 text-xs">Success Rate</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Sleep Records - Closer to overview */}
        <ScrollView 
          className="flex-1 px-4 mt-6"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-sky-400 text-sm font-medium mb-4">SLEEP RECORDS</Text>
          
          {lastMonthSleeps.map((sleep, index) => {
            const { hours, minutes } = calculateDuration(sleep.sleepStartTime, sleep.sleepEndTime);
            const qualityColor = getQualityColor(hours);

            return (
              <TouchableOpacity 
                key={index} 
                className="mb-4"
                onPress={() => router.push({
                  pathname: '/SleepDetails',
                  params: { sleepId: sleep._id }
                })}
              >
                <Text className="text-gray-400 text-sm mb-2">
                  {formatDate(sleep.sleepStartTime)}
                </Text>
                
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                  className="rounded-2xl p-5 border border-white/10"
                >
                  <View className="flex-row justify-between items-center mb-4">
                    <View>
                      <Text className="text-3xl font-bold text-white">
                        {hours}h {minutes}m
                      </Text>
                      <View className={`px-3 py-1 rounded-full mt-2 self-start ${qualityColor.split(' ')[0]}`}>
                        <Text className={`text-sm ${qualityColor.split(' ')[1]}`}>
                          {getQualityText(hours)}
                        </Text>
                      </View>
                    </View>
                    
                    <View className="items-end">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-gray-400 mr-2">Started</Text>
                        <Text className="text-white font-medium">
                          {formatTime(sleep.sleepStartTime)}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-gray-400 mr-2">Ended</Text>
                        <Text className="text-white font-medium">
                          {formatTime(sleep.sleepEndTime)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <LinearGradient
                    colors={['rgba(99, 102, 241, 0.2)', 'rgba(59, 130, 246, 0.2)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="h-1 rounded-full"
                    style={{ width: `${Math.min((hours / 9) * 100, 100)}%` }}
                  />
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
