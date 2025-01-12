import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-4xl font-bold text-slate-800 mb-4">
          Smart Alarm
        </Text>
        <Text className="text-lg text-slate-500 text-center mb-12">
          Wake up better, live better
        </Text>

        {/* Main Buttons */}
        <View className="w-full space-y-4">
          <TouchableOpacity onPress={() => router.push('/Home')} className="bg-sky-100 p-4 rounded-xl">
            <Text className="text-lg font-semibold text-sky-600 text-center">
              Get Started
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-slate-100 p-4 rounded-xl">
            <Text className="text-lg font-semibold text-slate-600 text-center">
              Learn More
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View className="pb-8 px-6">
        <Text className="text-slate-400 text-center">
          Make every morning count
        </Text>
      </View>
    </SafeAreaView>
  );
}
