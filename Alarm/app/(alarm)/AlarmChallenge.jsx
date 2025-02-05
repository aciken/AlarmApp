import { View, Text, TouchableOpacity, TextInput, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
// import { DeviceMotion } from 'expo-sensors';

export default function AlarmChallenge() {
  const params = useLocalSearchParams();
  const level = parseInt(params.level) || 1;
  const type = params.type || 'math';

  console.log(params)
  
  const [answer, setAnswer] = useState('');
  const [problem, setProblem] = useState({ question: '', answer: 0 });
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [showingSequence, setShowingSequence] = useState(false);
  const [shakeProgress, setShakeProgress] = useState(0);
  const shakeThreshold = useRef(level === 1 ? 1.2 : level === 2 ? 1.5 : 1.8).current;
  const shakeDuration = useRef(level === 1 ? 5 : level === 2 ? 10 : 15).current;
  const shakeTimer = useRef(null);
  const [mistakes, setMistakes] = useState(0);

  // Math Challenge Functions
  const generateMathProblem = (difficulty) => {
    let num1, num2, operator;
    
    switch(difficulty) {
      case 1: // Easy: Addition/Subtraction with numbers 1-20
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        operator = Math.random() < 0.5 ? '+' : '-';
        break;
      case 2: // Medium: Multiplication with numbers 1-12
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        operator = '×';
        break;
      case 3: // Hard: All operations including division
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        operator = ['×', '÷', '+', '-'][Math.floor(Math.random() * 4)];
        if (operator === '÷') {
          // Ensure clean division
          num1 = num2 * (Math.floor(Math.random() * 10) + 1);
        }
        break;
    }

    let correctAnswer;
    switch(operator) {
      case '+': correctAnswer = num1 + num2; break;
      case '-': correctAnswer = num1 - num2; break;
      case '×': correctAnswer = num1 * num2; break;
      case '÷': correctAnswer = num1 / num2; break;
    }

    return {
      question: `${num1} ${operator} ${num2} = ?`,
      answer: correctAnswer
    };
  };

  // Memory Challenge Functions
  const generateSequence = (difficulty) => {
    const length = difficulty === 1 ? 3 : difficulty === 2 ? 5 : 7;
    const symbols = ['🌟', '🎈', '🎯', '🎨', '🎭', '🎪', '🎰'];
    const newSequence = [];
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * symbols.length);
      newSequence.push(symbols[randomIndex]);
    }
    
    return newSequence;
  };

  const showSequence = async () => {
    setShowingSequence(true);
    setUserSequence([]);
    
    // Wait 2 seconds before starting (increased from 1)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show each symbol for 1 second with a highlight effect
    for (let i = 0; i < sequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Wait 1.5 seconds before hiding (increased from 0.5)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setShowingSequence(false);
  };

  const handleSymbolPress = (symbol) => {
    if (showingSequence) return;
    
    const newUserSequence = [...userSequence, symbol];
    setUserSequence(newUserSequence);
    
    if (newUserSequence.length === sequence.length) {
      if (newUserSequence.every((s, i) => s === sequence[i])) {
        router.back();
        router.push('WakeSetup');
      } else {
        setUserSequence([]);
        setMistakes(prev => prev + 1);
        if (mistakes < 2) {
          setSequence(generateSequence(level));
        }
      }
    }
  };

  const handleShowNewSequence = () => {
    setMistakes(0);
    setSequence(generateSequence(level));
    showSequence();
  };

  // Shake Challenge Functions
  const startShakeChallenge = () => {
    setShakeProgress(0);
    let lastUpdate = 0;
    let shakeCount = 0;

    DeviceMotion.setUpdateInterval(100);
    
    const subscription = DeviceMotion.addListener(({ acceleration }) => {
      const magnitude = Math.sqrt(
        acceleration.x * acceleration.x +
        acceleration.y * acceleration.y +
        acceleration.z * acceleration.z
      );

      if (magnitude > shakeThreshold) {
        const now = Date.now();
        if (now - lastUpdate > 100) {  // Throttle updates
          shakeCount++;
          setShakeProgress(Math.min((shakeCount / (shakeDuration * 10)) * 100, 100));
          lastUpdate = now;
          
          if (shakeCount >= shakeDuration * 10) {
            subscription.remove();
            router.back();
            router.push('WakeSetup');
          }
        }
      }
    });

    shakeTimer.current = setTimeout(() => {
      subscription.remove();
      setShakeProgress(0);
    }, shakeDuration * 1000);

    return () => {
      subscription.remove();
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
    };
  };

  useEffect(() => {
    if (type === 'math') {
      setProblem(generateMathProblem(level));
    } else if (type === 'memory') {
      setSequence(generateSequence(level));
      showSequence();
    } else if (type === 'shake') {
      startShakeChallenge();
    }

    return () => {
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
    };
  }, [level, type]);

  if (type === 'math') {
    const handleSubmit = () => {
      const userAnswer = parseInt(answer);
      if (userAnswer === problem.answer) {
        router.back();
        router.push('WakeSetup')
         // Close the challenge when correct
      } else {
        setAnswer(''); // Clear input on wrong answer
        setProblem(generateMathProblem(level)); // Generate new problem
      }
    };

    return (
      <LinearGradient colors={['#0f172a', '#1e293b']} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1 justify-center px-6">
          <View className="bg-slate-800/50 rounded-3xl p-8 items-center">
            <Text className="text-white text-4xl font-bold mb-8">
              {problem.question}
            </Text>
            
            <TextInput
              value={answer}
              onChangeText={setAnswer}
              keyboardType="number-pad"
              className="w-32 bg-slate-700/50 rounded-xl px-4 py-3 text-white text-2xl text-center mb-6"
              placeholder="?"
              placeholderTextColor="#64748b"
            />

            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-sky-500 rounded-xl px-8 py-3"
            >
              <Text className="text-white text-lg font-medium">
                Check
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (type === 'memory') {
    return (
      <LinearGradient colors={['#0f172a', '#1e293b']} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1 justify-center px-6">
          <View className="bg-slate-800/50 rounded-3xl p-8 items-center">
            {showingSequence ? (
              <View className="items-center">
                <Text className="text-white text-2xl mb-8">Watch carefully!</Text>
                <Text className="text-4xl mb-4">{sequence.join(' ')}</Text>
                <Text className="text-gray-400 text-base mt-4">
                  Memorize this sequence
                </Text>
              </View>
            ) : (
              <View className="items-center">
                <Text className="text-white text-2xl mb-4">Your turn!</Text>
                <Text className="text-gray-400 text-base mb-8">
                  Recreate the sequence you just saw
                </Text>
                <Text className="text-4xl mb-8">{userSequence.join(' ')}</Text>
                {mistakes >= 3 ? (
                  <TouchableOpacity
                    onPress={handleShowNewSequence}
                    className="bg-sky-500 rounded-xl px-6 py-3 mb-8"
                  >
                    <Text className="text-white text-base font-medium">
                      Show New Sequence
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View className="flex-row flex-wrap justify-center gap-4">
                    {['🌟', '🎈', '🎯', '🎨', '🎭', '🎪', '🎰'].map((symbol) => (
                      <TouchableOpacity
                        key={symbol}
                        onPress={() => handleSymbolPress(symbol)}
                        className="bg-slate-700/50 p-4 rounded-xl"
                      >
                        <Text className="text-3xl">{symbol}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                <Text className="text-gray-500 mt-4">
                  Mistakes: {mistakes}/3
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (type === 'shake') {
    return (
      <LinearGradient colors={['#0f172a', '#1e293b']} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1 justify-center px-6">
          <View className="bg-slate-800/50 rounded-3xl p-8 items-center">
            <Text className="text-white text-2xl mb-8">
              Shake your phone!
            </Text>
            <View className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <View 
                className="h-full bg-sky-500 rounded-full"
                style={{ width: `${shakeProgress}%` }}
              />
            </View>
            <Text className="text-gray-400 mt-4">
              Progress: {Math.round(shakeProgress)}%
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }
}
