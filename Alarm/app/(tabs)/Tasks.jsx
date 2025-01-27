import { View, Text, TouchableOpacity, Animated, ScrollView, Vibration, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef, useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalProvider';

export default function Tasks() {
  const { user } = useGlobalContext();
  const [selectedDay, setSelectedDay] = useState(null);
  const [dates, setDates] = useState([]);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef(null);

  const calculateSleepForDate = (date) => {
    if (!user.sleep || user.sleep.length === 0) return null;

    // Find sleep sessions that ended on this date
    const sleepSession = user.sleep.find(sleep => {
      if (!sleep.sleepEndTime) return false;
      const endDate = new Date(sleep.sleepEndTime);
      return endDate.toDateString() === date.toDateString();
    });

    if (!sleepSession) return null;

    // Calculate duration
    const start = new Date(sleepSession.sleepStartTime);
    const end = new Date(sleepSession.sleepEndTime);
    const durationMs = end - start;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      sleepTime: `${hours}h ${minutes}m`,
      targetTime: '8h',
      wokeUpOnTime: true, // You can add logic for this based on user.wakeup.time
      bedTime: start.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    };
  };

  useEffect(() => {
    // Generate last 21 days
    const generateDates = () => {
      const datesArray = [];
      const today = new Date();

      // Add past 21 days (including today)
      for (let i = 20; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const sleepData = calculateSleepForDate(date);
        const isToday = i === 0;
        
        datesArray.push({
          date,
          label: date.getDate(),
          weekday: isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' }),
          isToday,
          sleepTime: sleepData?.sleepTime ?? '-',
          targetTime: sleepData?.targetTime ?? '8h',
          wokeUpOnTime: sleepData?.wokeUpOnTime ?? null,
          bedTime: sleepData?.bedTime ?? '-'
        });
      }

      setDates(datesArray);
      setSelectedDay(20); // Select today (last index)
    };

    generateDates();
  }, [user.sleep]);

  // Scroll to today when component mounts
  useEffect(() => {
    if (scrollViewRef.current) {
      // Wait for layout to complete
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, []);

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

  const DayButton = ({ date, index }) => {
    const isSelected = index === selectedDay;
    
    return (
      <TouchableOpacity
        onPress={() => handleDayPress(index)}
        className={`w-16 h-20 rounded-xl items-center justify-center mx-1 
          ${date.isToday 
            ? isSelected
              ? 'bg-sky-500/20 border-2 border-sky-500/50 shadow-lg shadow-sky-500/20' 
              : 'bg-sky-500/10 border-2 border-sky-500/30'
            : isSelected
              ? 'bg-sky-500/20 border border-sky-500/30'
              : 'border border-gray-800 bg-gray-900/60'}
        `}
      >
        <Text 
          className={`text-xs mb-1
            ${date.isToday 
              ? isSelected
                ? 'text-sky-400 font-semibold'
                : 'text-sky-400 font-medium'
              : isSelected 
                ? 'text-sky-400 font-medium'
                : 'text-gray-500'
            }
          `}
        >
          {date.weekday}
        </Text>
        <Text 
          className={`text-xl
            ${date.isToday 
              ? isSelected
                ? 'text-white font-bold'
                : 'text-white font-semibold'
              : isSelected
                ? 'text-white font-semibold'
                : 'text-gray-400 font-medium'
            }
          `}
        >
          {date.label}
        </Text>
        {date.isToday && (
          <View className={`absolute bottom-2 flex-row space-x-1 ${isSelected ? 'opacity-100' : 'opacity-70'}`}>
            <View className={`w-1 h-1 rounded-full ${isSelected ? 'bg-sky-500' : 'bg-sky-500/80'}`} />
            <View className={`w-1 h-1 rounded-full ${isSelected ? 'bg-sky-500/70' : 'bg-sky-500/50'}`} />
            <View className={`w-1 h-1 rounded-full ${isSelected ? 'bg-sky-500/50' : 'bg-sky-500/30'}`} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getChallengeDetails = (name, level) => {
    const challenges = {
      'Early Bird': {
        title: 'Early Bird',
        description: 'Wake up before 7 AM', 
        icon: '🌅',
        tier: level === 1 ? 'BRONZE' : 
              level === 2 ? 'SILVER' : 
              level === 3 ? 'GOLD' : 'DIAMOND',
        xp: level === 1 ? 25 : 
            level === 2 ? 50 : 
            level === 3 ? 100 :
            level === 4 ? 150 : 
            level === 5 ? 200 : 250,
        total: level === 1 ? 1 : 
               level === 2 ? 3 : 
               level === 3 ? 5 :
               level === 4 ? 7 : 
               level === 5 ? 14 : 30
      },
      'Consistent Schedule': {
        title: 'Consistent Schedule',
        description: level === 1 ? 'Maintain same sleep schedule for 2 days in a row' :
                    level === 2 ? 'Maintain same sleep schedule for 4 days in a row' :
                    level === 3 ? 'Maintain same sleep schedule for 6 days in a row' :
                    level === 4 ? 'Maintain same sleep schedule for 8 days in a row' :
                    level === 5 ? 'Maintain same sleep schedule for 14 days in a row' :
                    'Maintain same sleep schedule for 30 days in a row',
        icon: '⏰',
        tier: level === 1 ? 'BRONZE' : 
              level === 2 ? 'SILVER' : 
              level === 3 ? 'GOLD' : 'DIAMOND',
        xp: level === 1 ? 25 : 
            level === 2 ? 50 : 
            level === 3 ? 100 :
            level === 4 ? 150 : 
            level === 5 ? 200 : 250,
        total: level === 1 ? 2 : 
               level === 2 ? 4 : 
               level === 3 ? 6 :
               level === 4 ? 8 : 
               level === 5 ? 14 : 30
      },
      'No Snooze Master': {
        title: 'No Snooze Master',
        description: level === 1 ? 'Wake up without snoozing' :
                    level === 2 ? 'Wake up without snoozing for 3 days' :
                    level === 3 ? 'Wake up without snoozing for 5 days' :
                    level === 4 ? 'Wake up without snoozing for 7 days' :
                    level === 5 ? 'Wake up without snoozing for 14 days' :
                    'Wake up without snoozing for 30 days',

        icon: '🎯',
        tier: level === 1 ? 'BRONZE' : 
              level === 2 ? 'SILVER' : 
              level === 3 ? 'GOLD' : 'DIAMOND',
        xp: level === 1 ? 25 : 
            level === 2 ? 50 : 
            level === 3 ? 100 :
            level === 4 ? 150 : 
            level === 5 ? 200 : 250,
        total: level === 1 ? 1 : 
               level === 2 ? 3 : 
               level === 3 ? 5 :
               level === 4 ? 7 : 
               level === 5 ? 14 : 30
      },
      'Sleep Champion': {
        title: 'Sleep Champion',
        description: 'Get 8+ hours of sleep',
        icon: '👑',
        tier: level === 1 ? 'BRONZE' : 
              level === 2 ? 'SILVER' : 
              level === 3 ? 'GOLD' : 'DIAMOND',
        xp: level === 1 ? 25 : 
            level === 2 ? 50 : 
            level === 3 ? 100 :
            level === 4 ? 150 : 
            level === 5 ? 200 : 250,
        total: level === 1 ? 1 : 
               level === 2 ? 3 : 
               level === 3 ? 5 :
               level === 4 ? 7 : 
               level === 5 ? 14 : 30
      }
    };

    return challenges[name] || null;
  };


  const checkChallengeProgress = (name, level) => {
    if(name === 'Early Bird') {
      return user.sleep.reduce((count, sleep) => {
        const sleepTime = new Date(sleep.sleepEndTime);
        return sleepTime.getHours() < 7 ? count + 1 : count;
      }, 0);
    }else if(name === 'Consistent Schedule') {
      // Get only completed sleep sessions
      const completedSessions = user.sleep.filter(sleep => sleep.sleepEndTime);
      
      // Sort by start time, most recent first
      const sortedSessions = completedSessions.sort((a, b) => 
        new Date(b.sleepStartTime) - new Date(a.sleepStartTime)
      );

      if (sortedSessions.length < 2) return 0;

      let streak = 1;
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const FIFTEEN_MINUTES = 15 * 60 * 1000; // 15 minutes in milliseconds

      // Start from most recent and compare with previous
      for (let i = 0; i < sortedSessions.length - 1; i++) {
        const currentStart = new Date(sortedSessions[i].sleepStartTime);
        const prevStart = new Date(sortedSessions[i + 1].sleepStartTime);
        
        // Get time difference in milliseconds
        const timeDiff = Math.abs(currentStart.getTime() - prevStart.getTime());
        
        // Check if sleep started at approximately same time (within 15 minutes) on consecutive days
        if (Math.abs(timeDiff - TWENTY_FOUR_HOURS) <= FIFTEEN_MINUTES) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    }else if (name === 'Sleep Champion'){
      return user.sleep.reduce((count, sleep) => {
        const sleepTime = new Date(sleep.sleepEndTime);
        return sleepTime.getHours() >= 8 ? count + 1 : count;
      }, 0);
    }else return 0;

  };

  const [challenges, setChallenges] = useState(
    user.challenge.map(challenge => {
      const details = getChallengeDetails(challenge.name, challenge.level);
      console.log(`${challenge.name} ${challenge.level}`,checkChallengeProgress(challenge.name, challenge.level));
      return {
        ...details,
        progress: checkChallengeProgress(challenge.name, challenge.level),
        completed: checkChallengeProgress(challenge.name, challenge.level) >= details.total,
        nextTier: challenge.level < 4 ? {
          ...getChallengeDetails(challenge.name, challenge.level + 1),
          tier: challenge.level === 1 ? 'SILVER' : 
                challenge.level === 2 ? 'GOLD' : 'DIAMOND'
        } : null
      };
    })
  );

  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;

  const handleCollectReward = (index) => {
    setShowCelebration(true);
    
    // Reset animations
    celebrationAnim.setValue(0);
    ringAnim.setValue(0);
    xpAnim.setValue(0);

    // Run celebration animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(celebrationAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(200),
          Animated.spring(xpAnim, {
            toValue: 1,
            tension: 40,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.delay(1200),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setChallenges(prev => prev.map((challenge, i) => {
          if (i === index && challenge.nextTier) {
            return {
              ...challenge,
              description: challenge.nextTier.description,
              xp: challenge.nextTier.xp,
              total: challenge.nextTier.total,
              tier: challenge.nextTier.tier,
              progress: 0,
              completed: false,
              nextTier: null
            };
          }
          return challenge;
        }));
        setShowCelebration(false);
      }, 200);
    });
  };

  const CelebrationOverlay = () => (
    <View className="absolute inset-0" pointerEvents="box-none">
      {/* Background */}
      <Animated.View 
        className="absolute inset-0 bg-black"
        style={{
          opacity: celebrationAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.8],
          }),
        }}
      />
      
      {/* Content Container */}
      <View className="flex-1 items-center justify-center">
        <Animated.View
          className="items-center"
          style={{
            opacity: celebrationAnim,
            transform: [
              {
                scale: celebrationAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.9, 1.05, 1],
                }),
              },
            ],
          }}
        >
          {/* Rest of the content stays the same... */}
          <View className="relative mb-6">
            <Animated.View
              className="absolute inset-0 items-center justify-center"
              style={{
                transform: [
                  {
                    scale: ringAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.8, 1.4, 1.2],
                    }),
                  },
                ],
                opacity: ringAnim.interpolate({
                  inputRange: [0, 0.2, 1],
                  outputRange: [0, 1, 0],
                }),
              }}
            >
              <LinearGradient
                colors={['rgba(56, 189, 248, 0.3)', 'rgba(56, 189, 248, 0)']}
                className="w-24 h-24 rounded-full"
              />
            </Animated.View>
            
            <View className="bg-sky-500/10 rounded-full p-6 border border-sky-500/20">
              <Text className="text-5xl">✨</Text>
            </View>
          </View>

          <Animated.View
            className="items-center"
            style={{
              opacity: xpAnim,
              transform: [
                {
                  translateY: xpAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <Text className="text-white text-2xl font-bold mb-3">
              Challenge Complete
            </Text>
            <View className="bg-sky-500/10 px-6 py-2 rounded-full border border-sky-500/20">
              <Text className="text-sky-400 text-xl font-semibold">+25 XP</Text>
            </View>
          </Animated.View>
        </Animated.View>
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
          {/* Sleep Stats Card */}
          <Animated.View 
            className="mx-4 mt-6 bg-gray-900/50 rounded-3xl p-6 shadow-sm border border-gray-800/50"
            style={{ transform: [{ scale: scaleAnim }] }}
          >
            {/* Days Selection */}
            <ScrollView 
              ref={scrollViewRef}
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="mb-6 -mx-1"
            >
              {dates.map((date, index) => (
                <DayButton 
                  key={index}
                  index={index}
                  date={date}
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
                <View 
                  key={index} 
                  className={`bg-gray-900/50 rounded-2xl p-4 border
                    ${challenge.tier === 'DIAMOND' ? 'border-sky-400/30' :
                      challenge.tier === 'GOLD' ? 'border-yellow-500/30' :
                      challenge.tier === 'SILVER' ? 'border-gray-300/30' :
                      'border-orange-700/30'}
                  `}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-xl mr-2">{challenge.icon}</Text>
                        <Text className="text-base font-semibold text-gray-300">
                          {challenge.title}
                        </Text>
                      </View>
                      <Text className="text-sm text-gray-500">
                        {challenge.description}
                      </Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full
                      ${challenge.tier === 'DIAMOND' ? 'bg-sky-500/20' :
                        challenge.tier === 'GOLD' ? 'bg-yellow-500/20' :
                        challenge.tier === 'SILVER' ? 'bg-gray-300/20' :
                        'bg-orange-700/20'}
                    `}>
                      <Text className={`font-medium
                        ${challenge.tier === 'DIAMOND' ? 'text-sky-400' :
                          challenge.tier === 'GOLD' ? 'text-yellow-400' :
                          challenge.tier === 'SILVER' ? 'text-gray-300' :
                          'text-orange-400'}
                      `}>
                        +{challenge.xp} XP
                      </Text>
                    </View>
                  </View>
                  <View className="mt-3">
                    <View className="w-full h-2 bg-gray-800 rounded-full">
                      <View 
                        className={`h-2 rounded-full
                          ${challenge.tier === 'DIAMOND' ? 'bg-sky-500' :
                            challenge.tier === 'GOLD' ? 'bg-yellow-500' :
                            challenge.tier === 'SILVER' ? 'bg-gray-300' :
                            'bg-orange-500'}
                        `}
                        style={{ 
                          width: `${(challenge.progress / challenge.total) * 100}%` 
                        }}
                      />
                    </View>
                    <View className="flex-row justify-between items-center mt-2">
                      <Text className="text-sm text-gray-500">
                        {challenge.progress}/{challenge.total}
                      </Text>
                      {challenge.completed && (
                        <TouchableOpacity
                          onPress={() => handleCollectReward(index)}
                          className="bg-sky-500 px-4 py-1.5 rounded-full"
                        >
                          <Text className="text-white font-medium">Collect</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      {showCelebration && <CelebrationOverlay />}
    </LinearGradient>
  );
}
