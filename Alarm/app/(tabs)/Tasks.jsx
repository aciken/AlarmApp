import { View, Text, TouchableOpacity, Animated, ScrollView, Vibration, Dimensions, FlatList, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef, useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalProvider';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAYS_PER_PAGE = 7;
const DAY_WIDTH = SCREEN_WIDTH / DAYS_PER_PAGE;
const SELECTED_BG = '#ffffff';
const SELECTED_TEXT = '#000000';
const UNSELECTED_TEXT = '#9ca3af';

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
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [canScrollToToday, setCanScrollToToday] = useState(false);
  
  const generateDateItems = () => {
    const items = [];
    const today = startOfDay(new Date());
    

    for (let i = 179; i >= 0; i--) {
      const date = subDays(today, i);
      const sleepData = user.sleep?.find(s => {
        if (!s.sleepEndTime) return false;
        const endDate = new Date(s.sleepEndTime);
        const dateStr = format(date, 'yyyy-MM-dd');
        const endDateStr = format(endDate, 'yyyy-MM-dd');
        

        return dateStr === endDateStr;
      });

      if (sleepData) {
        console.log('Found sleep data for date:', format(date, 'yyyy-MM-dd')); // Debug log
      }
      
      items.push({
        date,
        key: date.toISOString(),
        sleepData,
        score: sleepData ? calculateSleepScore(sleepData) : null,
        isSelected: format(date, 'yyyy-MM-dd') === format(new Date(selectedDate), 'yyyy-MM-dd')
      });
    }
    return items;
  };

  const days = generateDateItems();
  const selectedDayData = days.find(d => 
    format(d.date, 'yyyy-MM-dd') === format(new Date(selectedDate), 'yyyy-MM-dd')
  );

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

  // Update the useEffect for scrolling to today
  useEffect(() => {
    if (flatListRef.current) {
      const scrollIndex = 179; // Last item (today) in the array
      setTimeout(() => {
        flatListRef.current.scrollToIndex({
          index: scrollIndex,
          animated: false,
          viewPosition: 0.5
        });
      }, 100);
    }
  }, []);

  // Add error handler for FlatList
  const onScrollToIndexFailed = (info) => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
        viewPosition: 0.5
      });
    });
  };

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
      axios.put('https://ff79-109-245-206-230.ngrok-free.app/nextChallenge', 
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

  const formatHeaderDate = (date) => {
    return format(date, 'EEEE, d MMMM yyyy');
  };

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    // If we've scrolled left from the end position
    setCanScrollToToday(offsetX < (180 * DAY_WIDTH - SCREEN_WIDTH));
  };

  const scrollToToday = () => {
    flatListRef.current?.scrollToIndex({
      index: 179,
      animated: true,
      viewPosition: 0.5
    });
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Header */}
          <View className="pt-8 pb-4">
            <View className="flex-row items-center justify-between px-6">
              <View className="flex-1">
                <Text className="text-white text-xl font-medium">
                  {format(new Date(selectedDate), 'EEEE, d MMMM yyyy')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={canScrollToToday ? scrollToToday : null}
                className={`ml-4 rounded-xl px-3 py-1.5 border ${
                  canScrollToToday 
                    ? 'bg-white border-white' 
                    : 'bg-gray-800/20 border-gray-800/30'
                }`}
                disabled={!canScrollToToday}
              >
                <Text className={`text-base font-medium ${
                  canScrollToToday ? 'text-black' : 'text-gray-600'
                }`}>
                  →
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Day Selector */}
          <View className="py-2 mb-4">
            <FlatList
              ref={flatListRef}
              horizontal
              data={generateDateItems()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => setSelectedDate(format(item.date, 'yyyy-MM-dd'))}
                  style={{ width: DAY_WIDTH }}
                  className="items-center justify-center"
                >
                  <View className="relative">
                    <View 
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        item.isSelected 
                          ? 'bg-white' 
                          : 'bg-transparent'
                      }`}
                    >
                      <Text 
                        className={`text-lg font-normal ${
                          item.isSelected 
                            ? 'text-black' 
                            : 'text-gray-400'
                        }`}
                      >
                        {format(item.date, 'd')}
                      </Text>
                      {item.sleepData && (
                        <View className="absolute -bottom-1">
                          <View className="w-1 h-1 rounded-full bg-sky-400" />
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.key}
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              snapToInterval={SCREEN_WIDTH}
              decelerationRate="fast"
              pagingEnabled
              onScrollToIndexFailed={onScrollToIndexFailed}
              getItemLayout={(data, index) => ({
                length: DAY_WIDTH,
                offset: DAY_WIDTH * index,
                index,
              })}
            />
          </View>

          {/* Daily Stats */}
          <View className="px-4 space-y-6">
            {selectedDayData?.sleepData ? (
              <>
                {/* Sleep Score */}
                <View className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6">
                  <View className="items-center">
                    <Text className="text-gray-400 text-sm mb-4">Sleep Score</Text>
                    <View className="w-36 h-36 rounded-full border-8 border-sky-500/20 items-center justify-center mb-2">
                      <Text className="text-5xl font-bold text-white">
                        {selectedDayData.score}
                      </Text>
                      <Text className="text-sky-400 text-sm">out of 100</Text>
                    </View>
                    <Text className={`text-lg ${
                      selectedDayData.score > 80 ? 'text-emerald-400' :
                      selectedDayData.score > 60 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {selectedDayData.score > 80 ? 'Excellent Sleep' :
                       selectedDayData.score > 60 ? 'Good Sleep' : 'Poor Sleep'}
                    </Text>
                  </View>
                </View>

                {/* Sleep Times */}
                <View className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50">
                  <View className="p-4 border-b border-slate-700/50">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-xl bg-slate-700/50 items-center justify-center">
                          <Feather name="moon" size={20} color="#94a3b8" />
                        </View>
                        <View className="ml-3">
                          <Text className="text-gray-400 text-sm">Bedtime</Text>
                          <Text className="text-white text-lg font-medium mt-0.5">
                            {format(new Date(selectedDayData.sleepData.sleepStartTime), 'HH:mm')}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="p-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-xl bg-slate-700/50 items-center justify-center">
                          <Feather name="sun" size={20} color="#94a3b8" />
                        </View>
                        <View className="ml-3">
                          <Text className="text-gray-400 text-sm">Wake Time</Text>
                          <Text className="text-white text-lg font-medium mt-0.5">
                            {format(new Date(selectedDayData.sleepData.sleepEndTime), 'HH:mm')}
                          </Text>
                        </View>
                      </View>
                      <View className="bg-emerald-500/10 px-3 py-1 rounded-full">
                        <Text className="text-emerald-400">
                          {Math.round((new Date(selectedDayData.sleepData.sleepEndTime) - 
                            new Date(selectedDayData.sleepData.sleepStartTime)) / (1000 * 60 * 60))}h
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Sleep Analysis */}
                <View className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-4">
                  <Text className="text-gray-400 mb-4 px-2">Sleep Analysis</Text>
                  <View className="space-y-4">
                    <View className="flex-row items-center justify-between px-2">
                      <Text className="text-gray-300">Duration Target</Text>
                      <View className="flex-row items-center">
                        <View className="w-32 h-1.5 bg-slate-700/50 rounded-full overflow-hidden mr-3">
                          <View 
                            className="h-full bg-sky-500 rounded-full"
                            style={{ 
                              width: `${Math.min(
                                (new Date(selectedDayData.sleepData.sleepEndTime) - 
                                new Date(selectedDayData.sleepData.sleepStartTime)) / 
                                (1000 * 60 * 60 * 8) * 100, 
                                100
                              )}%` 
                            }}
                          />
                        </View>
                        <Text className="text-sky-400 font-medium">
                          {Math.round(
                            (new Date(selectedDayData.sleepData.sleepEndTime) - 
                            new Date(selectedDayData.sleepData.sleepStartTime)) / 
                            (1000 * 60 * 60 * 8) * 100
                          )}%
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between px-2">
                      <Text className="text-gray-300">Bedtime Target</Text>
                      <View className="flex-row items-center">
                        <View className="w-32 h-1.5 bg-slate-700/50 rounded-full overflow-hidden mr-3">
                          <View 
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ 
                              width: `${Math.max(100 - Math.abs(22 - new Date(selectedDayData.sleepData.sleepStartTime).getHours()) * 20, 0)}%` 
                            }}
                          />
                        </View>
                        <Text className="text-emerald-400 font-medium">
                          {Math.max(100 - Math.abs(22 - new Date(selectedDayData.sleepData.sleepStartTime).getHours()) * 20, 0)}%
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <>
                {/* Main Empty State */}
                <View className="bg-slate-800/40 backdrop-blur-xl rounded-[32px] border border-slate-700/50 p-8">
                  <View className="items-center space-y-6">
                    {/* Animated Icon Container */}
                    <View className="w-32 h-32 bg-gradient-to-br from-sky-500/20 to-purple-500/20 rounded-full items-center justify-center">
                      <View className="w-24 h-24 bg-slate-800/50 rounded-full items-center justify-center border-2 border-sky-500/30">
                        <Text className="text-5xl">🌜</Text>
                      </View>
                    </View>

                    {/* Text Content */}
                    <View className="items-center space-y-3">
                      <Text className="text-white text-2xl font-bold text-center">
                        {format(new Date(selectedDate), 'yyyy-MM-dd') > format(new Date(), 'yyyy-MM-dd') 
                          ? "Future Sleep Data" 
                          : "No Sleep Recorded"}
                      </Text>
                      <Text className="text-gray-400 text-center text-base leading-6">
                        {format(new Date(selectedDate), 'yyyy-MM-dd') > format(new Date(), 'yyyy-MM-dd')
                          ? "This day hasn't happened yet. Check back tomorrow!"
                          : "Looks like you didn't track sleep this day. Your next sleep session will be recorded automatically."}
                      </Text>
                    </View>

                    {/* Progress Visualization */}
                    <View className="w-full h-2 bg-slate-700/30 rounded-full overflow-hidden">
                      <View className="h-full bg-gradient-to-r from-sky-500 to-purple-500 w-1/3 rounded-full" />
                    </View>
                  </View>
                </View>

                {/* Tips Card */}
                <View className="bg-slate-800/40 backdrop-blur-xl rounded-[32px] border border-slate-700/50 p-6">
                  <View className="flex-row items-start">
                    {/* Icon */}
                    <View className="bg-sky-500/10 w-12 h-12 rounded-xl items-center justify-center mr-4">
                      <Text className="text-2xl">💤</Text>
                    </View>
                    
                    {/* Content */}
                    <View className="flex-1">
                      <Text className="text-sky-400 text-sm font-medium mb-1">Sleep Tracking Tips</Text>
                      <Text className="text-gray-400 text-sm leading-6">
                        To start tracking sleep automatically, set up your first wake-up alarm in the Alarm tab.
                        Consistent tracking helps improve sleep quality over time!
                      </Text>
                      
                      {format(new Date(selectedDate), 'yyyy-MM-dd') <= format(new Date(), 'yyyy-MM-dd') && (
                        <TouchableOpacity 
                          className="bg-sky-500/10 border border-sky-500/20 rounded-xl px-4 py-2 mt-4"
                          onPress={() => router.push('/WakeSetup')}
                        >
                          <Text className="text-sky-400 text-sm font-medium text-center">
                            Set Up First Alarm
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>

                {/* Fun Fact Card */}
                <View className="bg-slate-800/40 backdrop-blur-xl rounded-[32px] border border-slate-700/50 p-6">
                  <View className="flex-row items-start">
                    <View className="bg-purple-500/10 w-12 h-12 rounded-xl items-center justify-center mr-4">
                      <Text className="text-2xl">🌟</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-purple-400 text-sm font-medium mb-1">Did You Know?</Text>
                      <Text className="text-gray-400 text-sm leading-6">
                        Adults need 7-9 hours of sleep nightly. Consistent bedtimes can improve sleep quality by 40%!
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
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
