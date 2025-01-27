import { View, Text, TouchableOpacity, Switch, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useGlobalContext } from '../context/GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WakeSetup() {

    const { user, setUser, updateUser } = useGlobalContext();



  const [settings, setSettings] = useState({
    vibration: user.wakeup?.vibration ?? true,
    gradualVolume: user.wakeup?.gradualVolume ?? true,
    challenge: user.wakeup?.wakeUpChallange ?? 'math', // 'math', 'memory', 'shake'
    music: user.wakeup?.alarmSound ?? 'peaceful', // 'peaceful', 'energetic', 'nature'
  });

  const [selectedTime, setSelectedTime] = useState(
    user.wakeup?.time ? new Date(user.wakeup.time) : new Date()
  );

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const challenges = [
    { id: 'math', name: 'Math Problem', icon: '🔢' },
    { id: 'memory', name: 'Memory Pattern', icon: '🧩' },
    { id: 'shake', name: 'Shake Phone', icon: '📱' },
  ];

  const musicTypes = [
    { id: 'peaceful', name: 'Peaceful', icon: '🎵' },
    { id: 'energetic', name: 'Energetic', icon: '🎸' },
    { id: 'nature', name: 'Nature Sounds', icon: '🌿' },
  ];

  const handleSave = async () => {

    await updateUser({
      wakeup: {
        time: selectedTime,
        vibration: settings.vibration,
        gradualVolume: settings.gradualVolume,
        wakeUpChallange: settings.challenge,
        alarmSound: settings.music
      }
    });

    const storedUser = await AsyncStorage.getItem('@user');
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);



    axios.put('https://5d69-109-245-202-17.ngrok-free.app/savewakeup', {
      time: selectedTime,
      vibration: settings.vibration,
      gradualVolume: settings.gradualVolume,
      wakeUpChallange: settings.challenge,
      alarmSound: settings.music,
      userId: user._id
    })
    .then((res) => {
      console.log(res.status);
      if(res.status == 200){
        setUser(res.data);
        router.back();
        AsyncStorage.setItem('@user', JSON.stringify(res.data));
      }
    })


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
          <Text className="text-xl font-semibold text-white ml-2">Wake Up Settings</Text>
        </View>

        <ScrollView className="flex-1 px-4 pt-6">
          {/* Time Selector */}
          <View className="mb-8">
            <Text className="text-white text-lg font-semibold mb-4">Wake Up Time</Text>
            
            {/* Time Display and Picker */}
            <View className="bg-gray-800/40 rounded-2xl p-4 mb-4">
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  if (date) setSelectedTime(date);
                }}
                textColor="#38bdf8"
                themeVariant="dark"
                style={{ height: 180 }}
              />
            </View>
          </View>

          {/* Basic Settings */}
          <View className="bg-gray-800/40 rounded-2xl p-4 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-white text-base font-medium">Vibration</Text>
                <Text className="text-gray-400 text-sm">Additional wake up help</Text>
              </View>
              <Switch
                value={settings.vibration}
                onValueChange={(value) => setSettings(prev => ({ ...prev, vibration: value }))}
                trackColor={{ false: '#1e293b', true: '#0284c7' }}
                thumbColor={settings.vibration ? '#38bdf8' : '#64748b'}
              />
            </View>

            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white text-base font-medium">Gradual Volume</Text>
                <Text className="text-gray-400 text-sm">Slowly increase volume</Text>
              </View>
              <Switch
                value={settings.gradualVolume}
                onValueChange={(value) => setSettings(prev => ({ ...prev, gradualVolume: value }))}
                trackColor={{ false: '#1e293b', true: '#0284c7' }}
                thumbColor={settings.gradualVolume ? '#38bdf8' : '#64748b'}
              />
            </View>
          </View>

          {/* Challenge Selection */}
          <Text className="text-white text-lg font-semibold mb-3">Wake Up Challenge</Text>
          <View className="bg-gray-800/40 rounded-2xl p-4 mb-6">
            {challenges.map((challenge) => (
              <TouchableOpacity
                key={challenge.id}
                className={`flex-row items-center p-3 rounded-xl mb-2 ${
                  settings.challenge === challenge.id ? 'bg-sky-500/20' : ''
                }`}
                onPress={() => setSettings(prev => ({ ...prev, challenge: challenge.id }))}
              >
                <Text className="text-2xl mr-3">{challenge.icon}</Text>
                <Text className={`text-base ${
                  settings.challenge === challenge.id ? 'text-sky-400' : 'text-gray-300'
                }`}>
                  {challenge.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Music Selection */}
          <Text className="text-white text-lg font-semibold mb-3">Alarm Sound</Text>
          <View className="bg-gray-800/40 rounded-2xl p-4 mb-8">
            {musicTypes.map((music) => (
              <TouchableOpacity
                key={music.id}
                className={`flex-row items-center p-3 rounded-xl mb-2 ${
                  settings.music === music.id ? 'bg-sky-500/20' : ''
                }`}
                onPress={() => setSettings(prev => ({ ...prev, music: music.id }))}
              >
                <Text className="text-2xl mr-3">{music.icon}</Text>
                <Text className={`text-base ${
                  settings.music === music.id ? 'text-sky-400' : 'text-gray-300'
                }`}>
                  {music.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Save Button */}
        <View className="px-4 pb-6">
          <TouchableOpacity 
            className="w-full bg-sky-500 py-4 rounded-xl"
            onPress={handleSave}
          >
            <Text className="text-white text-center text-lg font-semibold">
              Save Settings
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
