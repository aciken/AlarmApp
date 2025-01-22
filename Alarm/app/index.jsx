import { View, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from './context/GlobalProvider';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  const { isLogged, isLoading } = useGlobalContext();

  useEffect(() => {
    if (isLogged && !isLoading) {
      router.push('/Wake');
    }
  }, [isLogged, isLoading]);

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b']}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center px-6">
          {/* Logo/Icon */}
          <View className="items-center mb-12">
            <View className="bg-gray-800/50 rounded-full p-1 mb-4">
              <View className="bg-gray-800 rounded-full p-8">
                <Text className="text-6xl">⏰</Text>
              </View>
            </View>
            <Text className="text-4xl font-bold text-gray-200">
              Sleep Better
            </Text>
            <Text className="text-gray-400 text-lg mt-2">
              Track and improve your sleep
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="w-full space-y-4">
            <Link href="/signup" asChild>
              <TouchableOpacity className="bg-sky-600 py-4 rounded-xl">
                <Text className="text-white text-center font-semibold text-lg">
                  Create Account
                </Text>
              </TouchableOpacity>
            </Link>

            <Link href="/signin" asChild>
              <TouchableOpacity className="bg-gray-800/80 py-4 rounded-xl border border-gray-700">
                <Text className="text-gray-200 text-center font-semibold text-lg">
                  Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
