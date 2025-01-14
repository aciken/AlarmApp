import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <LinearGradient 
      colors={['#f8fafc', '#e0f2fe']} 
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-1 items-center justify-center p-6">
          <View className="bg-sky-50 rounded-full p-1 mb-8">
            <View className="bg-sky-100 rounded-full p-4">
              <Text className="text-4xl">⏰</Text>
            </View>
          </View>
          <Text className="text-4xl font-bold text-gray-800 mb-4">
            Smart Alarm
          </Text>
          <Text className="text-lg text-gray-500 text-center mb-12">
            Wake up better, live better
          </Text>

          {/* Main Buttons */}
          <View className="w-full space-y-4">
            <TouchableOpacity 
              onPress={() => router.push('/(auth)/signup')} 
              className="bg-sky-500 p-4 rounded-xl"
            >
              <Text className="text-lg font-semibold text-white text-center">
                Create Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/(auth)/signin')}
              className="bg-white/80 border border-sky-100 p-4 rounded-xl"
            >
              <Text className="text-lg font-semibold text-sky-500 text-center">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="pb-8 px-6">
          <Text className="text-gray-400 text-center">
            Make every morning count
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
