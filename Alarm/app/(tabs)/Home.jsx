import { View, Text, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function Home() {
  return (
    <LinearGradient 
      colors={['#f8fafc', '#e0f2fe']} 
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 pt-2">
          <Text className="text-2xl font-bold text-sky-900">Alarm</Text>
          <Text className="text-sky-900/50 font-semibold">next in 7h 32m</Text>
        </View>

        {/* Alarm List */}
        <View className="flex-1 px-4 pt-4">
          {/* Alarm Item */}
          <View className="bg-white/80 rounded-xl mb-3 p-4">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-3xl font-semibold text-slate-800">07:00</Text>
                <Text className="text-slate-500 mt-1">M T W T F S S</Text>
              </View>
              <Switch />
            </View>
          </View>

          {/* Disabled Alarm Item */}
          <View className="bg-white/60 rounded-xl mb-3 p-4">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-3xl font-semibold text-slate-400">07:00</Text>
                <Text className="text-slate-400 mt-1">M T W T F S S</Text>
              </View>
              <Switch value={false} />
            </View>
          </View>
        </View>

        {/* Add Button */}
        <View className="absolute bottom-20 right-6">
          <View className="w-14 h-14 bg-white rounded-full items-center justify-center">
            <Text className="text-3xl text-sky-500">+</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
