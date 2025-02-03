import { View, Text, TextInput, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';

export default function AIModal() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const glowAnim = useRef(new Animated.Value(0)).current;
  const borderGlowAnim = useRef(new Animated.Value(0)).current;

  // Button glow animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const handleAskAI = () => {
    // Stop any existing animations
    borderGlowAnim.stopAnimation();
    
    // Reset and start continuous pulse
    borderGlowAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(borderGlowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(borderGlowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        })
      ])
    ).start();
    
    // Add your AI processing logic here
  };

  const BorderGlow = () => (
    <Animated.View 
      style={{
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        borderRadius: 24,
        opacity: borderGlowAnim,
        borderWidth: borderGlowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [2, 4],
        }),
        borderColor: borderGlowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['rgba(34, 211, 238, 0.2)', 'rgba(34, 211, 238, 0.8)'],
        }),
        shadowColor: '#22d3ee',
        shadowRadius: borderGlowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 30],
        }),
        shadowOpacity: borderGlowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 0.8],
        }),
        shadowOffset: { width: 0, height: 0 },
        elevation: borderGlowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 30],
        }),
      }}
    >
      <LinearGradient
        colors={['transparent', 'rgba(34, 211, 238, 0.05)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, borderRadius: 24 }}
      />
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-gray-950" style={{ overflow: 'visible' }}>
      {/* Glowing Borders */}
      <BorderGlow />
      <BorderGlow />

      {/* Background Gradient */}
      <LinearGradient
        colors={['rgba(56, 189, 248, 0.03)', 'rgba(0, 0, 0, 0)']}
        className="absolute inset-0"
      />
      
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-5 pt-2">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-2xl font-bold text-white">AI Assistant</Text>
              <Text className="text-sky-500/80 text-sm">Powered by Claude</Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.back()}
              className="bg-gray-900/80 h-8 w-8 rounded-full items-center justify-center"
            >
              <Text className="text-gray-400 text-base">×</Text>
            </TouchableOpacity>
          </View>

          {/* Chat Container */}
          <View className="flex-1 mb-5">
            {/* Welcome Message */}
            <View className="bg-gray-900/50 rounded-2xl p-4 mb-4">
              <Text className="text-white text-base">
                Hi! I'm your AI sleep assistant. I can help you:
              </Text>
              <View className="mt-3 space-y-2">
                {[
                  '• Analyze your sleep patterns',
                  '• Create bedtime routines',
                  '• Provide relaxation techniques',
                  '• Answer sleep-related questions'
                ].map((item, index) => (
                  <Text key={index} className="text-gray-400 text-sm">
                    {item}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* Input Section */}
          <View className="mb-5">
            <Animated.View
              style={{
                shadowColor: '#38bdf8',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 0.3],
                }),
                shadowRadius: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [5, 15],
                }),
              }}
            >
              <LinearGradient
                colors={['rgba(56, 189, 248, 0.1)', 'rgba(56, 189, 248, 0.05)']}
                className="rounded-2xl p-[1px]"
              >
                <View className="flex-row items-center bg-gray-900/90 rounded-2xl p-2">
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Ask me anything about sleep..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    className="flex-1 px-4 py-3 text-white text-base"
                    multiline
                  />
                  <TouchableOpacity 
                    className="ml-2"
                    onPress={handleAskAI}
                  >
                    <LinearGradient
                      colors={['#38bdf8', '#0284c7']}
                      className="rounded-xl p-3"
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Animated.Text 
                        style={{
                          opacity: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          }),
                        }}
                        className="text-white font-medium"
                      >
                        Ask AI
                      </Animated.Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}