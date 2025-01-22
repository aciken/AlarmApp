import { View, Text, TouchableOpacity, Animated, ScrollView, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef, useEffect } from 'react';

export default function Tasks() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [dates, setDates] = useState([]);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Generate last 7 days and next 7 days
    const generateDates = () => {
      const datesArray = [];
      const today = new Date();

      // Add past 7 days
      for (let i = 7; i >= 1; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        datesArray.push({
          date,
          label: date.getDate(),
          weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
          active: true,
          sleepTime: '7h 30m',
          targetTime: '8h',
          wokeUpOnTime: Math.random() > 0.3,
          bedTime: '23:00'
        });
      }

      // Add today
      datesArray.push({
        date: today,
        label: today.getDate(),
        weekday: 'Today',
        active: true,
        sleepTime: '8h 00m',
        targetTime: '8h',
        wokeUpOnTime: true,
        bedTime: '22:45'
      });

      // Add next 7 days
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        datesArray.push({
          date,
          label: date.getDate(),
          weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
          active: false,
          sleepTime: '-',
          targetTime: '8h',
          wokeUpOnTime: null,
          bedTime: '-'
        });
      }

      setDates(datesArray);
      // Set selected day to today (index 7)
      setSelectedDay(7);
    };

    generateDates();
  }, []);

  const handleDayPress = (index) => {
    // More subtle vibration feedback


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

  const DayButton = ({ date, active, index }) => (
    <TouchableOpacity
      onPress={() => handleDayPress(index)}
      className={`w-14 h-16 rounded-xl items-center justify-center mx-1 ${
        index === selectedDay 
          ? 'bg-sky-500 shadow-sm shadow-sky-500/50' 
          : active 
            ? 'bg-gray-800/80 border border-gray-700' 
            : 'bg-gray-900/60 border border-gray-800'
      }`}
    >
      <Text 
        className={`text-xs ${
          index === selectedDay 
            ? 'text-white/80' 
            : active 
              ? 'text-gray-400' 
              : 'text-gray-600'
        }`}
      >
        {date.weekday}
      </Text>
      <Text 
        className={`font-medium text-base mt-1 ${
          index === selectedDay 
            ? 'text-white' 
            : active 
              ? 'text-gray-300' 
              : 'text-gray-600'
        }`}
      >
        {date.label}
      </Text>
    </TouchableOpacity>
  );

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
      colors={['#0f172a', '#1e293b']} 
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Sleep Stats Card */}
          <Animated.View 
            className="mx-4 mt-6 bg-gray-900/50 rounded-3xl p-6 shadow-sm border border-gray-800/50"
            style={{ transform: [{ scale: scaleAnim }] }}
          >
            {/* Days Selection */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="mb-6 -mx-1"
            >
              {dates.map((date, index) => (
                <DayButton 
                  key={index}
                  index={index}
                  date={date}
                  active={date.active}
                />
              ))}
            </ScrollView>

            {/* Sleep Time and Stats */}
            {dates[selectedDay] && (
              <>
                <View className="items-center mb-8">
                  <View className="bg-gray-800/50 px-8 py-3 rounded-2xl">
                    <Text className="text-xl font-bold text-white">
                      {dates[selectedDay].sleepTime}
                      {dates[selectedDay].sleepTime !== '-' && (
                        <Text className="text-sky-400 font-medium">
                          {' '}/ {dates[selectedDay].targetTime}
                        </Text>
                      )}
                    </Text>
                  </View>
                </View>

                {/* Daily Stats */}
                <View className="space-y-4">
                  {[
                    { 
                      label: 'Bedtime',
                      value: dates[selectedDay].bedTime,
                      description: 'When you went to sleep',
                      icon: '🌙'
                    },
                    { 
                      label: 'Wake up',
                      value: dates[selectedDay].wokeUpOnTime ? 'On time' : 'Snoozed',
                      description: 'Alarm response',
                      icon: '⏰'
                    },
                    { 
                      label: 'Duration',
                      value: dates[selectedDay].sleepTime,
                      description: `Target: ${dates[selectedDay].targetTime}`,
                      icon: '⭐️'
                    }
                  ].map((metric, index) => (
                    <View key={index}>
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                          <Text className="text-2xl mr-3">{metric.icon}</Text>
                          <View>
                            <Text className="text-base font-medium text-gray-300">
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
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                            : 'text-gray-300'
                        }`}>
                          {metric.value}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </Animated.View>

          {/* Challenges Section */}
          <View className="px-4 mt-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-300">
                Challenges
              </Text>
              <View className="flex-row items-center">
                <View className="w-5 h-5 bg-yellow-500/80 rounded-full mr-2" />
                <Text className="text-gray-400 font-medium">1,250 XP</Text>
              </View>
            </View>
            
            <View className="space-y-4">
              {challenges.map((challenge, index) => (
                <View key={index} className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800/50">
                  <View className="flex-row justify-between items-start mb-2">
                    <View>
                      <Text className="text-base font-semibold text-gray-300 mb-1">
                        {challenge.title}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {challenge.description}
                      </Text>
                    </View>
                    <View className="bg-yellow-500/20 px-3 py-1 rounded-full">
                      <Text className="text-yellow-400 font-medium">
                        +{challenge.xp} XP
                      </Text>
                    </View>
                  </View>
                  <View className="mt-3">
                    <View className="w-full h-2 bg-gray-800 rounded-full">
                      <View 
                        className="h-2 bg-sky-500 rounded-full"
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
