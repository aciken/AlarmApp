import { View, Text, TouchableOpacity, Animated, ScrollView, Vibration, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef, useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalProvider';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

const DAYS = 7; // Number of days to show

const calculateSleepScore = (sleepData) => {
  if (!sleepData) return 0;
  
  const duration = new Date(sleepData.sleepEndTime) - new Date(sleepData.sleepStartTime);
  const hours = duration / (1000 * 60 * 60);
  
  // Base score on duration (ideal: 7-9 hours)
  let score = 100;
  if (hours < 7) score -= (7 - hours) * 15;
  if (hours > 9) score -= (hours - 9) * 10;
  
  // Adjust for sleep time (ideal: 22:00-23:00)
  const bedTime = new Date(sleepData.sleepStartTime).getHours();
  if (bedTime < 22 || bedTime > 23) {
    score -= Math.abs(bedTime - 22.5) * 5;
  }
  
  return Math.max(Math.min(Math.round(score), 100), 0);
};

export default function Tasks() {
  const router = useRouter();
  const { user, setUser } = useGlobalContext();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;
  
  // Generate last 7 days
  const getDays = () => {
    const days = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const sleepData = user.sleep?.find(s => {
        if (!s.sleepEndTime) return false;
        const endDate = new Date(s.sleepEndTime);
        return endDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date: date,
        sleepData: sleepData,
        score: sleepData ? calculateSleepScore(sleepData) : null
      });
    }
    return days;
  };

  const days = getDays();
  const selectedDayData = days.find(d => d.date.toISOString().split('T')[0] === selectedDate);

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

  // Remove or comment out this useEffect that uses setDates
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

      // Remove this line since setDates is not defined
      // setDates(datesArray);
      // setSelectedDay(20); // Remove this line too
    };

    generateDates();
  }, [user.sleep]);

  const handleDayPress = (index) => {
    setSelectedDate(days[index].date.toISOString().split('T')[0]);
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
        if (!sleep.sleepEndTime || !sleep.sleepStartTime) return count;
        
        const start = new Date(sleep.sleepStartTime);
        const end = new Date(sleep.sleepEndTime);
        const durationMs = end - start;
        const durationHours = durationMs / (1000 * 60 * 60);
        
        return durationHours >= 8 ? count + 1 : count;
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

  const handleCollectReward = (index) => {
    setShowCelebration(true);

    setChallenges(prev => prev.map((challenge, i) => {
      if (i === index) {
        return { ...challenge, completed: false };
      }
      return challenge;
    }));
    
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
      axios.put('https://3f3b-109-245-206-230.ngrok-free.app/nextChallenge', 
        {
          index: index,
          challenge: challenges[index].name,
          level: challenges[index].level + 1,
          userId: user._id
        }) 
        .then(res => {
          console.log(res.data);
          setChallenges(res.data.challenge.map(challenge => {
            const details = getChallengeDetails(challenge.name, challenge.level);
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
          }));
          setUser(res.data);
          AsyncStorage.setItem('@user', JSON.stringify(res.data));
        })
        .catch(err => {
          console.log(err);
        })
      })
    
  };

  const CelebrationOverlay = () => (
    <View className="absolute inset-0" pointerEvents="box-none" style={{ transform: [{ translateY: '50%' }] }}>
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
      <View className="absolute inset-0 flex-1 items-center justify-center">
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

  const calculateSleepStats = () => {
    if (!user.sleep || user.sleep.length === 0) return null;

    // Average Sleep Time (last 7 days)
    const lastWeekSleep = user.sleep
      .slice(-7)
      .filter(s => s.sleepStartTime && s.sleepEndTime)
      .map(s => new Date(s.sleepEndTime) - new Date(s.sleepStartTime));
    
    const averageSleepMs = lastWeekSleep.length > 0 
      ? lastWeekSleep.reduce((a, b) => a + b, 0) / lastWeekSleep.length
      : 0;
    const averageHours = Math.floor(averageSleepMs / 3600000);
    const averageMinutes = Math.floor((averageSleepMs % 3600000) / 60000);

    // Sleep Debt (assuming 8h target)
    const targetSleep = 8 * 3600000;
    const sleepDebtMs = lastWeekSleep.reduce((acc, duration) => 
      acc + Math.max(targetSleep - duration, 0), 0);
    const sleepDebtHours = Math.floor(sleepDebtMs / 3600000);

    // Best Streak (consecutive days meeting 8h sleep)
    let currentStreak = 0;
    let bestStreak = 0;
    user.sleep.forEach(sleep => {
      if (sleep.sleepStartTime && sleep.sleepEndTime) {
        const duration = new Date(sleep.sleepEndTime) - new Date(sleep.sleepStartTime);
        if (duration >= targetSleep) {
          currentStreak++;
          bestStreak = Math.max(bestStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }
    });

    // Total Sleep Time
    const totalSleepMs = user.sleep.reduce((acc, sleep) => {
      if (sleep.sleepStartTime && sleep.sleepEndTime) {
        return acc + (new Date(sleep.sleepEndTime) - new Date(sleep.sleepStartTime));
      }
      return acc;
    }, 0);
    const totalSleepHours = Math.floor(totalSleepMs / 3600000);

    // Sleep Consistency (percentage of days with bedtime within 1 hour of average)
    const bedTimes = user.sleep
      .filter(s => s.sleepStartTime)
      .map(s => new Date(s.sleepStartTime).getHours());
    const averageBedtime = bedTimes.length > 0 
      ? bedTimes.reduce((a, b) => a + b, 0) / bedTimes.length
      : 0;
    const consistentDays = bedTimes.filter(t => Math.abs(t - averageBedtime) <= 1).length;
    const consistencyPercentage = bedTimes.length > 0
      ? Math.round((consistentDays / bedTimes.length) * 100)
      : 0;

    return {
      averageSleep: `${averageHours}h ${averageMinutes}m`,
      sleepDebt: `${sleepDebtHours}h`,
      bestStreak,
      totalSleep: `${totalSleepHours}h`,
      consistencyPercentage,
      averageBedtime: averageBedtime ? 
        `${Math.floor(averageBedtime)}:${Math.round((averageBedtime % 1) * 60)}` 
        : '00:00'
    };
  };

  // Get the calculated stats
  const sleepStats = calculateSleepStats() || {};

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Header */}
          <View className="px-6 pt-6 pb-4">
            <Text className="text-2xl font-bold text-white">Sleep Analytics </Text>
            <Text className="text-gray-400 mt-1">Track your sleep patterns and progress</Text>
          </View>

          {/* Day Selector - Improved Design */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="px-4 mb-6"
          >
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedDate(day.date.toISOString().split('T')[0])}
                className="mr-3"
              >
                <LinearGradient
                  colors={selectedDate === day.date.toISOString().split('T')[0] 
                    ? ['#0ea5e9', '#0284c7']
                    : ['rgba(30, 41, 59, 0.5)', 'rgba(15, 23, 42, 0.5)']}
                  className={`rounded-2xl p-4 w-24 h-[104px] justify-between ${
                    selectedDate === day.date.toISOString().split('T')[0] 
                      ? 'border-2 border-sky-400/30'
                      : 'border border-slate-700/50'
                  }`}
                  style={{
                    shadowColor: selectedDate === day.date.toISOString().split('T')[0] ? '#0ea5e9' : '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 5
                  }}
                >
                  <View>
                    <Text className={`text-sm mb-1 ${
                      selectedDate === day.date.toISOString().split('T')[0] 
                        ? 'text-sky-200'
                        : 'text-gray-400'
                    }`}>
                      {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </Text>
                    <Text className={`text-2xl font-bold ${
                      selectedDate === day.date.toISOString().split('T')[0] 
                        ? 'text-white' 
                        : 'text-gray-300'
                    }`}>
                      {day.date.getDate()}
                    </Text>
                  </View>
                  
                  <View className={`rounded-full px-2.5 py-1 ${
                    selectedDate === day.date.toISOString().split('T')[0]
                      ? 'bg-sky-400/20'
                      : 'bg-slate-700/30'
                  }`}>
                    <Text className="text-xs font-semibold" 
                          style={{ 
                            color: day.score ? (
                              day.score > 80 ? '#4ade80' : 
                              day.score > 60 ? '#fbbf24' : '#ef4444'
                            ) : '#94a3b8'
                          }}>
                      {day.score ? `${day.score}%` : '--'}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Daily Sleep Score Card */}
          {selectedDayData && (
            <View className="px-4 mb-6">
              <View className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50">
                <LinearGradient
                  colors={['rgba(14, 165, 233, 0.1)', 'transparent']}
                  className="p-6 rounded-3xl"
                >
                  {/* Score Circle */}
                  <View className="items-center mb-6">
                    <View className="w-32 h-32 rounded-full border-8 border-sky-500/20 items-center justify-center">
                      <View className="items-center">
                        {selectedDayData.sleepData ? (
                          <>
                            <Text className="text-4xl font-bold text-white mb-1">
                              {selectedDayData.score}
                            </Text>
                            <Text className="text-sky-300 text-sm font-medium">
                              {selectedDayData.score > 80 ? 'Excellent' : 
                               selectedDayData.score > 60 ? 'Good' : 'Poor'}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text className="text-4xl font-bold text-gray-500">--</Text>
                            <Text className="text-gray-400 text-sm font-medium mt-1">No Sleep Data</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Sleep Metrics */}
                  <View className="mt-6">
                    {/* Main Stats Row */}
                    <View className="flex-row mb-4">
                      <View className="flex-1 mr-2">
                        <View className="bg-slate-800/60 rounded-2xl p-4">
                          <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 rounded-lg bg-sky-500/10 items-center justify-center">
                              <Feather name="clock" size={16} color="#0ea5e9" />
                            </View>
                            <Text className="text-sky-400 text-sm font-medium ml-2">Total Sleep</Text>
                          </View>
                          <Text className="text-white text-2xl font-semibold">
                            {selectedDayData.sleepData ? 
                              `${Math.floor((new Date(selectedDayData.sleepData.sleepEndTime) - 
                              new Date(selectedDayData.sleepData.sleepStartTime)) / (1000 * 60 * 60))}h ${
                              Math.floor(((new Date(selectedDayData.sleepData.sleepEndTime) - 
                              new Date(selectedDayData.sleepData.sleepStartTime)) % (1000 * 60 * 60)) / (1000 * 60))}m`
                              : "--"
                            }
                          </Text>
                          <Text className="text-gray-400 text-sm mt-1">
                            {selectedDayData.sleepData ? 'Duration' : 'No data available'}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-1 ml-2">
                        <View className="bg-slate-800/60 rounded-2xl p-4">
                          <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 rounded-lg bg-emerald-500/10 items-center justify-center">
                              <Feather name="target" size={16} color="#10b981" />
                            </View>
                            <Text className="text-emerald-400 text-sm font-medium ml-2">Sleep Goal</Text>
                          </View>
                          <Text className="text-white text-2xl font-semibold">
                            {selectedDayData.sleepData ? 
                              Math.floor((new Date(selectedDayData.sleepData.sleepEndTime) - 
                              new Date(selectedDayData.sleepData.sleepStartTime)) / (1000 * 60 * 60)) >= 8
                              ? 'Achieved'
                              : 'Missed'
                              : "--"
                            }
                          </Text>
                          <Text className="text-gray-400 text-sm mt-1">
                            {selectedDayData.sleepData ? '8 hours target' : 'No data available'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Time Details */}
                    <View className="bg-slate-800/60 rounded-2xl">
                      <View className="p-4 border-b border-slate-700/50">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-lg bg-slate-700/50 items-center justify-center">
                              <Feather name="moon" size={16} color="#94a3b8" />
                            </View>
                            <View className="ml-3">
                              <Text className="text-gray-400 text-sm">Bedtime</Text>
                              <Text className="text-white text-base font-medium mt-0.5">
                                {selectedDayData.sleepData ? 
                                  new Date(selectedDayData.sleepData.sleepStartTime)
                                    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                  : "--"
                                }
                              </Text>
                            </View>
                          </View>
                          <View className="bg-slate-700/30 px-3 py-1 rounded-full">
                            <Text className="text-gray-400 text-sm">
                              {selectedDayData.sleepData ? "Yesterday" : "--"}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View className="p-4">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-lg bg-slate-700/50 items-center justify-center">
                              <Feather name="sun" size={16} color="#94a3b8" />
                            </View>
                            <View className="ml-3">
                              <Text className="text-gray-400 text-sm">Wake Time</Text>
                              <Text className="text-white text-base font-medium mt-0.5">
                                {selectedDayData.sleepData ? 
                                  new Date(selectedDayData.sleepData.sleepEndTime)
                                    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                  : "--"
                                }
                              </Text>
                            </View>
                          </View>
                          <View className={`px-3 py-1 rounded-full ${
                            selectedDayData.sleepData ? 'bg-emerald-500/10' : 'bg-slate-700/30'
                          }`}>
                            <Text className={
                              selectedDayData.sleepData ? 'text-emerald-400' : 'text-gray-400'
                            }>
                              {selectedDayData.sleepData ? "On Schedule" : "--"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </View>
          )}

          {/* Weekly Overview */}
          <View className="px-4 mb-6">
            <Text className="text-xl font-bold text-white mb-4">Weekly Overview </Text>
            <View className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50">
              <LinearGradient
                colors={['rgba(14, 165, 233, 0.1)', 'transparent']}
                className="p-6 rounded-3xl"
              >
                <WeeklyStat 
                  icon="bar-chart-2"
                  label="Average Score"
                  value={`${Math.round(days.reduce((acc, day) => 
                    acc + (day.score || 0), 0) / days.filter(d => d.score !== null).length)}%`}
                  color="#0ea5e9"
                />
                <WeeklyStat 
                  icon="clock"
                  label="Avg Duration"
                  value={`${Math.round(days.reduce((acc, day) => 
                    acc + (day.sleepData ? (new Date(day.sleepData.sleepEndTime) - 
                    new Date(day.sleepData.sleepStartTime)) / (1000 * 60 * 60) : 0), 0) / 
                    days.filter(d => d.sleepData).length * 10) / 10}h`}
                  color="#4ade80"
                />
                <WeeklyStat 
                  icon="check"
                  label="Consistency"
                  value={`${Math.round(days.filter(d => d.sleepData).length / DAYS * 100)}%`}
                  color="#fbbf24"
                />
              </LinearGradient>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      {showCelebration && <CelebrationOverlay />}
    </LinearGradient>
  );
}

const SleepMetric = ({ icon, label, value, gradient }) => (
  <View className="flex-row items-center justify-between py-3 px-4">
    <View className="flex-row items-center">
      <LinearGradient
        colors={gradient}
        className="w-10 h-10 rounded-full items-center justify-center"
      >
        <Feather name={icon} size={18} color="white" />
      </LinearGradient>
      <View className="ml-3">
        <Text className="text-gray-400 text-sm">{label}</Text>
        <Text className="text-white text-base font-medium mt-0.5">{value}</Text>
      </View>
    </View>
    <View className="bg-gray-800/50 rounded-full p-1.5">
      <Feather 
        name="chevron-right" 
        size={16} 
        color={gradient[0]} 
      />
    </View>
  </View>
);

const WeeklyStat = ({ icon, label, value, color }) => (
  <View className="flex-row items-center justify-between mb-5 last:mb-0">
    <View className="flex-row items-center">
      <View className="w-10 h-10 rounded-full bg-slate-700/50 items-center justify-center">
        <Feather name={icon} size={20} color={color} />
      </View>
      <Text className="text-gray-300 text-base ml-3">{label}</Text>
    </View>
    <Text className="text-xl font-bold" style={{ color }}>{value}</Text>
  </View>
);
