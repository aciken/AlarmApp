import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, Link, useNavigation } from 'expo-router';
import { useState } from 'react';
import { useGlobalContext } from '../../context/GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function ChallengeDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [showExample, setShowExample] = useState(false);
  const { user } = useGlobalContext();
  const navigation = useNavigation();
  
  // Get current challenge level from user settings
  const currentLevel = user?.wakeup?.challengeLevel || 1;

  const challenges = {
    math: {
      title: 'Math Problem',
      icon: '🔢',
      description: 'Solve a math problem to turn off the alarm',
      levels: [
        {
          level: 1,
          description: 'Simple addition and subtraction',
          example: '15 + 7 = ?',
          difficulty: 'Easy'
        },
        {
          level: 2,
          description: 'Multiplication and division',
          example: '24 ÷ 3 = ?',
          difficulty: 'Medium'
        },
        {
          level: 3,
          description: 'Mixed operations',
          example: '(15 + 5) × 2 = ?',
          difficulty: 'Hard'
        }
      ]
    },
    memory: {
      title: 'Memory Pattern',
      icon: '🧩',
      description: 'Remember and repeat a sequence to turn off the alarm',
      levels: [
        {
          level: 1,
          description: '3 item sequence',
          example: 'Remember 3 symbols in order',
          difficulty: 'Easy'
        },
        {
          level: 2,
          description: '5 item sequence',
          example: 'Remember 5 symbols in order',
          difficulty: 'Medium'
        },
        {
          level: 3,
          description: '7 item sequence',
          example: 'Remember 7 symbols in order',
          difficulty: 'Hard'
        }
      ]
    },
    shake: {
      title: 'Shake Phone',
      icon: '📱',
      description: 'Shake your phone to turn off the alarm',
      levels: [
        {
          level: 1,
          description: 'Light shaking for 5 seconds',
          example: 'Gentle movement required',
          difficulty: 'Easy'
        },
        {
          level: 2,
          description: 'Medium shaking for 10 seconds',
          example: 'More vigorous movement needed',
          difficulty: 'Medium'
        },
        {
          level: 3,
          description: 'Intense shaking for 15 seconds',
          example: 'Very active movement required',
          difficulty: 'Hard'
        }
      ]
    }
  };

  const challenge = challenges[id];

  const handleSelectLevel = (level) => {
    // Store the selected level in AsyncStorage or context
    const selectedData = {
      challengeId: id,
      challengeLevel: level
    };
    
    // Store in AsyncStorage temporarily
    AsyncStorage.setItem('@selectedChallenge', JSON.stringify(selectedData))
      .then(() => {
        router.back();
      });
  };

  // Add this function to map challenge level to difficulty
  const getDifficultyLevel = (challengeLevel) => {
    switch(challengeLevel) {
      case 1: return 1; // Bronze - Easy
      case 2: return 2; // Silver - Medium
      case 3: return 3; // Gold - Hard
      default: return 1;
    }
  };

  // Update the handleExamplePress function
  const handleExamplePress = async(level) => {
    try {
      router.back();
      router.back();
      router.push({
        pathname: 'AlarmChallenge',
        params: {
          level: level.toString(),
          type: id  // 'math', 'memory', or 'shake'
        }
      });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <LinearGradient 
      colors={['#0f172a', '#1e293b']} 
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 pt-2">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <Text className="text-2xl text-gray-400">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-lg font-medium ml-2">{challenge.title}</Text>
        </View>

        <ScrollView className="flex-1 px-4 pt-6">
          {/* Challenge Info */}
          <View className="items-center mb-8">
            <View className="bg-gray-800/50 rounded-full p-4 mb-4">
              <Text className="text-4xl">{challenge.icon}</Text>
            </View>
            <Text className="text-white text-xl font-semibold mb-2">
              {challenge.title}
            </Text>
            <Text className="text-gray-400 text-center">
              {challenge.description}
            </Text>
          </View>

          {/* Levels */}
          <Text className="text-sky-400 text-sm font-medium mb-4">SELECT DIFFICULTY LEVEL</Text>
          {challenge.levels.map((level, index) => (
            <TouchableOpacity 
              key={index}
              onPress={() => handleSelectLevel(level.level)}
              className={`bg-white/5 rounded-xl p-4 mb-4 border ${
                currentLevel === level.level 
                  ? 'border-sky-500' 
                  : 'border-white/10'
              }`}
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white font-medium">Level {level.level}</Text>
                <View className={`px-3 py-1 rounded-full ${
                  level.difficulty === 'Easy' ? 'bg-green-500/20' :
                  level.difficulty === 'Medium' ? 'bg-yellow-500/20' :
                  'bg-red-500/20'
                }`}>
                  <Text className={`text-sm ${
                    level.difficulty === 'Easy' ? 'text-green-400' :
                    level.difficulty === 'Medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {level.difficulty}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400 mb-3">{level.description}</Text>
              <TouchableOpacity
                onPress={() => handleExamplePress(level.level)}
                className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-4 mb-6"
              >
                <Text className="text-sky-400 text-center">
                  Tap to see example
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
} 