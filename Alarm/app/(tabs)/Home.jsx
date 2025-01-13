import { View, Text, Switch, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import BottomPopup from '../components/BottomPopup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useGlobalContext } from '../context/GlobalProvider';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
  const { user,setUser } = useGlobalContext();

  const [alarms, setAlarms] = useState(user.alarms);

  const CreateAlarm = (date, days) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;
    
    // Convert days object to string format
    const selectedDaysString = Object.entries(days)
      .filter(([_, selected]) => selected)
      .map(([day]) => day.replace('T2', 'T').replace('S2', 'S'))
      .join(' ');
    
    console.log(time, selectedDaysString);
    axios.put('https://d0a5-109-245-203-120.ngrok-free.app/createAlarm', 
      {
        time, 
        days: selectedDaysString, 
        userId: user._id
      }
    )
    .then((res) => {
      if(res.status == 200){
        setUser(res.data);
        setAlarms(res.data.alarms);
        AsyncStorage.setItem('@user', JSON.stringify(res.data));
        setShowCreateAlarmPopup(false);
      }
    })
    .catch((err) => {
      console.log(err);
    })
  }

  // const [alarms, setAlarms] = useState([
  //   { id: 1, time: '07:00', days: 'M T W T F S S', enabled: true },
  //   { id: 2, time: '07:00', days: 'M T W T F S S', enabled: false },
  // ]);

  const toggleAlarm = (id) => {
    setAlarms(alarms.map(alarm => 
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ));
  };

  const [showCreateAlarmPopup, setShowCreateAlarmPopup] = useState(false);
  const [selectedDays, setSelectedDays] = useState({
    M: false, T: false, W: false, T2: false, F: false, S: false, S2: false
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSleepPopup, setShowSleepPopup] = useState(false);

  const DayButton = ({ day, label }) => (
    <TouchableOpacity
      onPress={() => setSelectedDays(prev => ({ ...prev, [day]: !prev[day] }))}
      className={`w-10 h-10 rounded-full items-center justify-center border ${
        selectedDays[day] ? 'bg-sky-400 border-sky-400' : 'border-sky-300'
      }`}
    >
      <Text className={`${selectedDays[day] ? 'text-white' : 'text-sky-400'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );


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
          {alarms.length > 0 ? (
            alarms.map((alarm) => (
              <View 
                key={alarm.id}
                className={`${alarm.enabled ? 'bg-white/80' : 'bg-white/60'} rounded-xl mb-3 p-4`}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text 
                      className={`text-3xl font-semibold ${
                        alarm.enabled ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {alarm.time}
                    </Text>
                    <Text 
                      className={`mt-1 ${
                        alarm.enabled ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {typeof alarm.days === 'object' 
                        ? Object.entries(alarm.days)
                            .filter(([_, selected]) => selected)
                            .map(([day]) => day.replace('T2', 'T').replace('S2', 'S'))
                            .join(' ')
                        : alarm.days}
                    </Text>
                  </View>
                  <Switch
                    value={alarm.enabled}
                    onValueChange={() => toggleAlarm(alarm.id)}
                    trackColor={{ false: '#e2e8f0', true: '#38bdf8' }}
                    thumbColor={alarm.enabled ? '#ffffff' : '#94a3b8'}
                  />
                </View>
              </View>
            ))
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-4xl mb-4">⏰</Text>
              <Text className="text-xl font-semibold text-gray-800 mb-2">
                No Alarms Yet
              </Text>
              <Text className="text-gray-500 text-center">
                Tap the + button to create your first alarm
              </Text>
            </View>
          )}
        </View>
        
        {/* Add Button - Moved above Start Sleep button */}
        <View className="absolute right-6 bottom-40">
          <TouchableOpacity 
            onPress={() => setShowCreateAlarmPopup(true)} 
            className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-sm"
          >
            <Text className="text-3xl text-sky-500">+</Text>
          </TouchableOpacity>
        </View>

        {/* Start Sleep Button */}
        <View className="px-4 pb-14">
          <TouchableOpacity 
            className="bg-sky-500 py-4 rounded-xl flex-row items-center justify-center space-x-2"
            onPress={() => setShowSleepPopup(true)}
          >
            <Text className="text-2xl">🌙</Text>
            <Text className="text-white text-lg font-semibold">
              Start Sleep
            </Text>
          </TouchableOpacity>
        </View>

        {/* Create Alarm Popup */}
        {showCreateAlarmPopup && (
          <BottomPopup
            height={0.8}
            visible={showCreateAlarmPopup}
            onClose={() => setShowCreateAlarmPopup(false)}
          >
            <View className="flex-1 px-6">
              <Text className="text-2xl font-semibold text-sky-900 text-center mb-8">
                Create Alarm
              </Text>

              {/* Time Picker */}
              <View className="bg-sky-50 rounded-xl mb-8">
                <DateTimePicker
                  value={selectedDate}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    if (date) {
                      setSelectedDate(date);
                    }
                  }}
                  textColor="#0ea5e9"
                  themeVariant="light"
                  style={{ height: 180 }}
                />
              </View>

              {/* Day Selection */}
              <View className="flex-row justify-between mb-8">
                <DayButton day="M" label="M" />
                <DayButton day="T" label="T" />
                <DayButton day="W" label="W" />
                <DayButton day="T2" label="T" />
                <DayButton day="F" label="F" />
                <DayButton day="S" label="S" />
                <DayButton day="S2" label="S" />
              </View>

              {/* Create Button */}
              <TouchableOpacity 
                className="bg-sky-400 rounded-xl py-4 px-6"
                onPress={() => {CreateAlarm(selectedDate, selectedDays)}}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  Create Alarm
                </Text>
              </TouchableOpacity>
            </View>
          </BottomPopup>
        )}
        
        {/* Sleep Popup */}
        {showSleepPopup && (
          <BottomPopup
            visible={showSleepPopup}
            onClose={() => setShowSleepPopup(false)}
            height={0.6}
          >
            <View className="flex-1 px-6">
              <Text className="text-2xl font-semibold text-sky-900 text-center mb-8">
                Start Sleep
              </Text>

              {/* Wake Up Time */}
              <View className="bg-sky-50 rounded-xl p-4 mb-6">
                <Text className="text-gray-600 mb-2">Wake up at</Text>
                <Text className="text-3xl font-semibold text-sky-900">07:00</Text>
                <Text className="text-gray-500 mt-1">Tomorrow morning</Text>
              </View>

              {/* Sleep Duration */}
              <View className="bg-sky-50 rounded-xl p-4 mb-8">
                <Text className="text-gray-600 mb-2">Sleep duration</Text>
                <Text className="text-3xl font-semibold text-sky-900">8h 30m</Text>
                <Text className="text-gray-500 mt-1">Recommended: 8 hours</Text>
              </View>

              {/* Start Button */}
              <TouchableOpacity 
                className="bg-sky-500 py-4 rounded-xl"
                onPress={() => {
                  // Handle start sleep logic
                  setShowSleepPopup(false);
                }}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  Start Sleep Now
                </Text>
              </TouchableOpacity>
            </View>
          </BottomPopup>
        )}
        
      </SafeAreaView>
    </LinearGradient>
  );
}
