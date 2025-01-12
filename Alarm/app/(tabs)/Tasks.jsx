import { View, Text, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef } from 'react';

export default function Tasks() {
  const [selectedDay, setSelectedDay] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const days = [
    { label: 'M', active: true },
    { label: 'T', active: true },
    { label: 'W', active: true },
    { label: 'T', active: true },
    { label: 'F', active: true },
    { label: 'S', active: true },
    { label: 'S', active: false },
  ];

  const handleDayPress = (index) => {
    setSelectedDay(index);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const DayButton = ({ label, active, index }) => (
    <TouchableOpacity
      onPress={() => handleDayPress(index)}
      className={`w-11 h-11 rounded-full items-center justify-center ${
        index === selectedDay 
          ? 'bg-sky-500 shadow-sm shadow-sky-500/50' 
          : active 
            ? 'bg-white border border-sky-100' 
            : 'bg-gray-50 border border-gray-100'
      }`}
    >
      <Text 
        className={`font-medium text-base ${
          index === selectedDay 
            ? 'text-white' 
            : active 
              ? 'text-sky-500' 
              : 'text-gray-300'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const sleepQualityMetrics = [
    { label: 'Deep Sleep', value: '5h 20m', percentage: '80%' },
    { label: 'Light Sleep', value: '1h 14m', percentage: '20%' },
  ];

  const challenges = [
    { 
      title: 'Early Bird',
      description: 'Wake up before 7 AM for 5 days',
      xp: 100,
      progress: 3,
      total: 5
    },
    {
      title: 'Consistent Schedule',
      description: 'Keep the same sleep schedule for a week',
      xp: 150,
      progress: 4,
      total: 7
    }
  ];

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
          {/* Sleep Stats Card */}
          <Animated.View 
            className="mx-4 mt-6 bg-white/80 rounded-3xl p-6 shadow-sm"
            style={{ transform: [{ scale: scaleAnim }] }}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-semibold text-gray-800">
                Sleep last 7 days
              </Text>
              <View className="flex-row items-center space-x-2">
                <Text className="text-sm text-gray-400 font-medium">less</Text>
                <View className="flex-row space-x-1">
                  {[1, 2, 3, 4].map((i) => (
                    <View 
                      key={i} 
                      className={`w-2 h-2 rounded-full ${
                        i <= 2 ? 'bg-sky-400' : 'bg-sky-200'
                      }`}
                    />
                  ))}
                </View>
                <Text className="text-sm text-gray-400 font-medium">more</Text>
              </View>
            </View>

            {/* Sleep Time */}
            <View className="items-center mb-8">
              <View className="bg-sky-50 px-8 py-3 rounded-2xl">
                <Text className="text-xl font-bold text-sky-900">
                  6h 34m <Text className="text-sky-400 font-medium">/ 8h</Text>
                </Text>
              </View>
            </View>

            {/* Days */}
            <View className="flex-row justify-between px-1">
              {days.map((day, index) => (
                <DayButton 
                  key={index}
                  index={index}
                  label={day.label}
                  active={day.active}
                />
              ))}
            </View>
          </Animated.View>

          {/* Sleep Quality Section */}
          <View className="px-4 mt-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Sleep Quality
            </Text>
            <View className="bg-white/80 rounded-2xl p-4">
              {sleepQualityMetrics.map((metric, index) => (
                <View 
                  key={index} 
                  className={`flex-row items-center justify-between ${
                    index < sleepQualityMetrics.length - 1 ? 'mb-4' : ''
                  }`}
                >
                  <View>
                    <Text className="text-gray-600 font-medium mb-1">
                      {metric.label}
                    </Text>
                    <Text className="text-2xl font-bold text-sky-900">
                      {metric.value}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sky-400 font-bold text-lg">
                      {metric.percentage}
                    </Text>
                    <View className="w-20 h-1 bg-gray-100 rounded-full mt-2">
                      <View 
                        className="h-1 bg-sky-400 rounded-full"
                        style={{ width: metric.percentage }}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Challenges Section */}
          <View className="px-4 mt-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-800">
                Challenges
              </Text>
              <View className="flex-row items-center">
                <View className="w-5 h-5 bg-yellow-400 rounded-full mr-2" />
                <Text className="text-gray-600 font-medium">1,250 XP</Text>
              </View>
            </View>
            
            <View className="space-y-4">
              {challenges.map((challenge, index) => (
                <View key={index} className="bg-white/80 rounded-2xl p-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <View>
                      <Text className="text-base font-semibold text-gray-800 mb-1">
                        {challenge.title}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {challenge.description}
                      </Text>
                    </View>
                    <View className="bg-yellow-100 px-3 py-1 rounded-full">
                      <Text className="text-yellow-600 font-medium">
                        +{challenge.xp} XP
                      </Text>
                    </View>
                  </View>
                  <View className="mt-3">
                    <View className="w-full h-2 bg-gray-100 rounded-full">
                      <View 
                        className="h-2 bg-sky-400 rounded-full"
                        style={{ 
                          width: `${(challenge.progress / challenge.total) * 100}%` 
                        }}
                      />
                    </View>
                    <Text className="text-right text-sm text-gray-500 mt-1">
                      {challenge.progress}/{challenge.total}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
