import { View, Text, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef } from 'react';

export default function Tasks() {
  const [selectedDay, setSelectedDay] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const days = [
    { 
      label: 'M', 
      active: true,
      sleepTime: '7h 15m',
      targetTime: '8h',
      wokeUpOnTime: true,
      bedTime: '23:00'
    },
    { 
      label: 'T', 
      active: true,
      sleepTime: '6h 45m',
      targetTime: '8h',
      wokeUpOnTime: false,
      bedTime: '23:30'
    },
    { 
      label: 'W', 
      active: true,
      sleepTime: '8h 00m',
      targetTime: '8h',
      wokeUpOnTime: true,
      bedTime: '22:45'
    },
    { 
      label: 'T', 
      active: true,
      sleepTime: '7h 30m',
      targetTime: '8h',
      wokeUpOnTime: true,
      bedTime: '23:15'
    },
    { 
      label: 'F', 
      active: true,
      sleepTime: '6h 15m',
      targetTime: '8h',
      wokeUpOnTime: false,
      bedTime: '00:30'
    },
    { 
      label: 'S', 
      active: true,
      sleepTime: '8h 45m',
      targetTime: '8h',
      wokeUpOnTime: true,
      bedTime: '22:30'
    },
    { 
      label: 'S', 
      active: false,
      sleepTime: '-',
      targetTime: '8h',
      wokeUpOnTime: null,
      bedTime: '-'
    }
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

  const sleepMetrics = [
    { 
      label: 'Bedtime',
      value: days[selectedDay].bedTime,
      description: 'When you went to sleep',
      icon: '🌙'
    },
    { 
      label: 'Wake up',
      value: days[selectedDay].wokeUpOnTime ? 'On time' : 'Snoozed',
      description: 'Alarm response',
      icon: '⏰'
    },
    { 
      label: 'Duration',
      value: days[selectedDay].sleepTime,
      description: `Target: ${days[selectedDay].targetTime}`,
      icon: '⭐️'
    }
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
            {/* Days Selection */}
            <View className="flex-row justify-between px-1 mb-6">
              {days.map((day, index) => (
                <DayButton 
                  key={index}
                  index={index}
                  label={day.label}
                  active={day.active}
                />
              ))}
            </View>

            {/* Sleep Time */}
            <View className="items-center mb-8">
              <View className="bg-sky-50 px-8 py-3 rounded-2xl">
                <Text className="text-xl font-bold text-sky-900">
                  {days[selectedDay].sleepTime}
                  {days[selectedDay].sleepTime !== '-' && (
                    <Text className="text-sky-400 font-medium">
                      {' '}/ {days[selectedDay].targetTime}
                    </Text>
                  )}
                </Text>
              </View>
            </View>

            {/* Daily Stats */}
            <View className="space-y-4">
              {sleepMetrics.map((metric, index) => (
                <View key={index}>
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">{metric.icon}</Text>
                      <View>
                        <Text className="text-base font-medium text-gray-800">
                          {metric.label}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {metric.description}
                        </Text>
                      </View>
                    </View>
                    <Text className={`text-lg font-bold ${
                      metric.label === 'Wake up' 
                        ? metric.value === 'On time' 
                          ? 'text-emerald-500'
                          : 'text-amber-500'
                        : 'text-gray-800'
                    }`}>
                      {metric.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

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
