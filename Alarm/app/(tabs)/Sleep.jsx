import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGlobalContext } from '../context/GlobalProvider';
import { useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const calculateLevel = (xp) => {
  const levels = [
    { level: 1, min: 0, max: 99 },
    { level: 2, min: 100, max: 199 },
    { level: 3, min: 200, max: 299 },
    { level: 4, min: 300, max: 499 },
    { level: 5, min: 500, max: 749 },
    { level: 6, min: 750, max: 999 },
    { level: 7, min: 1000, max: 1499 },
    { level: 8, min: 1500, max: 1999 },
    { level: 9, min: 2000, max: 2899 },
    { level: 10, min: 2900, max: 3699 },
    { level: 11, min: 3700, max: Infinity }
  ];

  const currentLevel = levels.find(l => xp >= l.min && xp <= l.max);
  const nextLevel = levels[currentLevel.level] || null;

  return {
    current: currentLevel.level,
    currentMin: currentLevel.min,
    currentMax: currentLevel.max,
    nextMin: nextLevel?.min || null,
    progress: nextLevel ? 
      ((xp - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100 
      : 100
  };
};

const getSleepTitle = (level) => {
  const titles = [
    { level: 1, title: "Sleep Novice", emoji: "🌱" },
    { level: 2, title: "Sleep Student", emoji: "📚" },
    { level: 3, title: "Sleep Apprentice", emoji: "⭐" },
    { level: 4, title: "Sleep Guardian", emoji: "🛡️" },
    { level: 5, title: "Sleep Knight", emoji: "⚔️" },
    { level: 6, title: "Sleep Warrior", emoji: "🔥" },
    { level: 7, title: "Sleep Veteran", emoji: "🌟" },
    { level: 8, title: "Sleep Expert", emoji: "💫" },
    { level: 9, title: "Sleep Master", emoji: "👑" },
    { level: 10, title: "Sleep Champion", emoji: "🏆" },
    { level: 11, title: "Sleep Legend", emoji: "⚡" }
  ];

  return titles.find(t => t.level === level) || titles[0];
};

export default function Sleep() {
  const { user, setUser } = useGlobalContext();
  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;

  // Calculate level info
  const levelInfo = calculateLevel(user.xp || 0);
  const xpToNext = levelInfo.nextMin ? levelInfo.nextMin - user.xp : 0;

  // Get title and emoji based on level
  const { title, emoji } = getSleepTitle(levelInfo.current);

  const getChallengeDetails = (name, level) => {
    const challenges = {
      'Early Bird': {
        title: 'Early Bird',
        description: level === 1 ? 'Wake up before 7 AM for 1 day in a row' :
                    level === 2 ? 'Wake up before 7 AM for 3 days in a row' :
                    level === 3 ? 'Wake up before 7 AM for 5 days in a row' :
                    level === 4 ? 'Wake up before 7 AM for 7 days in a row' :
                    level === 5 ? 'Wake up before 7 AM for 14 days in a row' :
                    'Wake up before 7 AM for 30 days in a row',
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
        description: level === 1 ? 'Go to bed at the same time for 2 days in a row' :
                    level === 2 ? 'Go to bed at the same time for 4 days in a row' :
                    level === 3 ? 'Go to bed at the same time for 6 days in a row' :
                    level === 4 ? 'Go to bed at the same time for 8 days in a row' :
                    level === 5 ? 'Go to bed at the same time for 14 days in a row' :
                    'Go to bed at the same time for 30 days in a row',
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
        description: level === 1 ? 'Get 8+ hours of sleep for 1 day in a row' :
                    level === 2 ? 'Get 8+ hours of sleep for 3 days in a row' :
                    level === 3 ? 'Get 8+ hours of sleep for 5 days in a row' :
                    level === 4 ? 'Get 8+ hours of sleep for 7 days in a row' :
                    level === 5 ? 'Get 8+ hours of sleep for 14 days in a row' :
                    'Get 8+ hours of sleep for 30 days in a row',
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
      const completedSessions = user.sleep.filter(sleep => sleep.sleepEndTime);
      const sortedSessions = completedSessions.sort((a, b) => 
        new Date(b.sleepEndTime) - new Date(a.sleepEndTime)
      );

      let streak = 0;
      for (const sleep of sortedSessions) {
        const wakeTime = new Date(sleep.sleepEndTime);
        if (wakeTime.getHours() < 7) {
          streak++;
        } else {
          break; // Break streak if woke up after 7 AM
        }
      }
      return streak;

    } else if(name === 'Consistent Schedule') {
      const completedSessions = user.sleep.filter(sleep => sleep.sleepEndTime);
      const sortedSessions = completedSessions.sort((a, b) => 
        new Date(b.sleepStartTime) - new Date(a.sleepStartTime)
      );

      if (sortedSessions.length < 2) return 0;

      let streak = 1;
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      const FIFTEEN_MINUTES = 15 * 60 * 1000;

      for (let i = 0; i < sortedSessions.length - 1; i++) {
        const currentStart = new Date(sortedSessions[i].sleepStartTime);
        const prevStart = new Date(sortedSessions[i + 1].sleepStartTime);
        const timeDiff = Math.abs(currentStart.getTime() - prevStart.getTime());
        
        if (Math.abs(timeDiff - TWENTY_FOUR_HOURS) <= FIFTEEN_MINUTES) {
          streak++;
        } else {
          break; // Break streak if schedule differs by more than 15 minutes
        }
      }

      return streak;

    } else if (name === 'Sleep Champion') {
      const completedSessions = user.sleep.filter(sleep => sleep.sleepEndTime);
      const sortedSessions = completedSessions.sort((a, b) => 
        new Date(b.sleepEndTime) - new Date(a.sleepEndTime)
      );

      let streak = 0;
      for (const sleep of sortedSessions) {
        const start = new Date(sleep.sleepStartTime);
        const end = new Date(sleep.sleepEndTime);
        const durationMs = end - start;
        const durationHours = durationMs / (1000 * 60 * 60);
        
        if (durationHours >= 8) {
          streak++;
        } else {
          break; // Break streak if sleep was less than 8 hours
        }
      }
      return streak;

    } else if (name === 'No Snooze Master') {
      // Assuming we track snooze usage in sleep data
      const completedSessions = user.sleep.filter(sleep => sleep.sleepEndTime);
      const sortedSessions = completedSessions.sort((a, b) => 
        new Date(b.sleepEndTime) - new Date(a.sleepEndTime)
      );

      let streak = 0;
      for (const sleep of sortedSessions) {
        if (!sleep.snoozed) { // You'll need to add this property to your sleep data
          streak++;
        } else {
          break; // Break streak if snoozed
        }
      }
      return streak;
    }
    
    return 0;
  };

  const [challenges, setChallenges] = useState(
    user.challenge.map(challenge => {
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
    
    celebrationAnim.setValue(0);
    ringAnim.setValue(0);
    xpAnim.setValue(0);

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
        });
    });
  };

  const CelebrationOverlay = () => (
    <View className="absolute inset-0" pointerEvents="box-none" style={{ transform: [{ translateY: '50%' }] }}>
      <Animated.View 
        className="absolute inset-0 bg-black"
        style={{
          opacity: celebrationAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.8],
          }),
        }}
      />
      
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
          {/* Sleep Level Progress */}
          <View className="mx-4 mt-6 bg-gray-900/50 rounded-3xl p-6 shadow-sm border border-gray-800/50">
            <View className="items-center">
              <View className="bg-gray-800/50 rounded-full p-1.5 mb-4">
                <View className="bg-gray-800 rounded-full p-5">
                  <Text className="text-5xl">{emoji}</Text>
                </View>
              </View>
              <Text className="text-2xl font-bold text-gray-200 mb-2">
                {title}
              </Text>
              <View className="flex-row items-center mb-4">
                <View className="bg-sky-500/20 px-3 py-1 rounded-full">
                  <Text className="text-sky-400 font-medium">Level {levelInfo.current}</Text>
                </View>
                <Text className="text-gray-500 mx-2">•</Text>
                <Text className="text-gray-500">{user.xp || 0} XP</Text>
              </View>
              <View className="w-full">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-400 text-sm">Progress</Text>
                  <Text className="text-gray-400 text-sm">
                    {levelInfo.nextMin ? `${xpToNext} XP to level ${levelInfo.current + 1}` : 'Max Level'}
                  </Text>
                </View>
                <View className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <View 
                    className="h-2 bg-sky-500 rounded-full"
                    style={{ width: `${levelInfo.progress}%` }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Challenges Section */}
          <View className="px-4 mt-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-300">
                Challenges
              </Text>
              <View className="flex-row items-center">
                <View className="w-5 h-5 bg-yellow-500/20 rounded-full mr-2 items-center justify-center">
                  <Text className="text-yellow-400 text-xs">✨</Text>
                </View>
                <Text className="text-gray-400 font-medium">1,250 XP</Text>
              </View>
            </View>

            {challenges.map((challenge, index) => (
              <View 
                key={index}
                className="bg-gray-900/50 rounded-2xl p-5 mb-4 border border-gray-800/50"
              >
                <View className="flex-row items-start mb-5">
                  <View className="bg-gray-800/80 rounded-xl p-2.5">
                    <Text className="text-2xl">{challenge.icon}</Text>
                  </View>
                  <View className="flex-1 mx-3">
                    <Text className="text-white font-semibold text-base">
                      {challenge.title}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-0.5 leading-5" numberOfLines={2}>
                      {challenge.description}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${
                    challenge.tier === 'BRONZE' ? 'bg-amber-500/10' :
                    challenge.tier === 'SILVER' ? 'bg-gray-400/10' :
                    challenge.tier === 'GOLD' ? 'bg-yellow-500/10' :
                    'bg-sky-400/10'
                  }`}>
                    <Text className={`font-medium text-xs ${
                      challenge.tier === 'BRONZE' ? 'text-amber-500' :
                      challenge.tier === 'SILVER' ? 'text-gray-400' :
                      challenge.tier === 'GOLD' ? 'text-yellow-500' :
                      'text-sky-400'
                    }`}>
                      {challenge.tier}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-4">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-400 text-xs font-medium">
                        PROGRESS {challenge.progress}/{challenge.total}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {Math.round((challenge.progress / challenge.total) * 100)}%
                      </Text>
                    </View>
                    <View className="h-1.5 bg-gray-800/80 rounded-full overflow-hidden">
                      <View 
                        className={`h-1.5 rounded-full ${
                          challenge.completed ? 'bg-emerald-500' : 'bg-sky-500'
                        }`}
                        style={{ 
                          width: `${(challenge.progress / challenge.total) * 100}%`
                        }}
                      />
                    </View>
                  </View>
                  {challenge.completed ? (
                    <TouchableOpacity
                      onPress={() => handleCollectReward(index)}
                      className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full flex-row items-center"
                    >
                      <Text className="text-emerald-400 font-medium mr-1">
                        +{challenge.xp}
                      </Text>
                      <Text className="text-emerald-400 font-medium">
                        XP
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View className="bg-gray-800/50 px-4 py-1.5 rounded-full flex-row items-center">
                      <Text className="text-gray-500 font-medium mr-1">
                        {challenge.xp}
                      </Text>
                      <Text className="text-gray-500 font-medium">
                        XP
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
      {showCelebration && <CelebrationOverlay />}
    </LinearGradient>
  );
} 