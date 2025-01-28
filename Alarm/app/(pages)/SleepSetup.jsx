import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { router } from 'expo-router';
import axios from 'axios';
import { useGlobalContext } from '../context/GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SleepSetup() {
  const { user, setUser, updateUser } = useGlobalContext();
  const [selectedSound, setSelectedSound] = useState(user.wakeup?.alarmSound ?? 'peaceful');

  const sounds = [
    { id: 'none', name: 'None', icon: '🌙' },
    { id: 'peaceful', name: 'Peaceful Melody', icon: '🎵' },
    { id: 'rain', name: 'Rain Sounds', icon: '🌧️' },
    { id: 'nature', name: 'Nature Sounds', icon: '🌿' },
    { id: 'whitenoise', name: 'White Noise', icon: '🌊' },

  ];

  const handleStartSleep = async () => {
    if(selectedSound == null){
      alert('Please select a sound');
      return;
    }

    const sleepId = Math.random().toString(36).substring(2) + Date.now().toString(36);

    await updateUser({
      sleep: [...user.sleep, {
        sleepStartTime: new Date(),
        sleepId: sleepId,
        sleepEndTime: null,
        sound: selectedSound,
      }]
    });

    const storedUser = await AsyncStorage.getItem('@user');
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);






    console.log(user._id, selectedSound, new Date());
    axios.put('https://6483-109-245-202-17.ngrok-free.app/startsleep', {
      userId: user._id,
      sleepStartTime: new Date(),
      sleepId: sleepId,
    })
    .then((res) => {
      if(res.status == 200){
        setUser(res.data);
        AsyncStorage.setItem('@user', JSON.stringify(res.data));
      }
    });

    router.back();
  };

  return (
    <LinearGradient 
      colors={['#0f172a', '#1e293b']} 
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center px-4 pt-2">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <Text className="text-2xl text-gray-400">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-white ml-2">Start Sleep</Text>
        </View>

        <ScrollView className="flex-1 px-4 pt-6">
          {/* Wake Up Time Display */}
          <TouchableOpacity
            onPress={() => router.push('/WakeSetup')}
            className="bg-gray-800/40 rounded-2xl p-6 mb-8 border border-gray-700/50 active:opacity-80"
            style={{
              shadowColor: '#1e293b',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-gray-400 text-base mb-2">Wake up at</Text>
                <Text className="text-white text-4xl font-bold">
                  {new Date(user.wakeup.time).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}
                </Text>
              </View>
              <View className="bg-gray-700/30 rounded-full p-3">
                <Text className="text-2xl">⏰</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Sound Selection */}
          <Text className="text-white text-lg font-semibold mb-3">Sleep Sound</Text>
          <View className="bg-gray-800/40 rounded-2xl p-4 mb-8">
            {sounds.map((sound) => (
              <TouchableOpacity
                key={sound.id}
                className={`flex-row items-center p-4 rounded-xl mb-2 ${
                  selectedSound === sound.id ? 'bg-sky-500/20' : ''
                }`}
                onPress={() => setSelectedSound(sound.id)}
              >
                <Text className="text-3xl mr-4">{sound.icon}</Text>
                <Text className={`text-lg ${
                  selectedSound === sound.id ? 'text-sky-400' : 'text-gray-300'
                }`}>
                  {sound.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Start Sleep Button */}
        <View className="px-4 pb-6">
          <TouchableOpacity 
            className="w-full bg-indigo-500 py-5 rounded-xl"
            onPress={handleStartSleep}
          >
            <Text className="text-white text-center text-lg font-semibold">
              Start Sleep Now
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
