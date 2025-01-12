import { View, Text, Switch, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import BottomPopup from '../components/BottomPopup';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Home() {
  const [alarms, setAlarms] = useState([
    { id: 1, time: '07:00', days: 'M T W T F S S', enabled: true },
    { id: 2, time: '07:00', days: 'M T W T F S S', enabled: false },
  ]);

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
          {alarms.map((alarm) => (
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
                    {alarm.days}
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
          ))}
        </View>

        {/* Add Button */}
        <View className="absolute bottom-24 right-6">
          <TouchableOpacity onPress={() => setShowCreateAlarmPopup(true)} className="w-14 h-14 bg-white rounded-full items-center justify-center">
            <Text className="text-3xl text-sky-500">+</Text>
          </TouchableOpacity>
        </View>

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
                  display="spinner"
                  onChange={(event, date) => {
                    if (date) setSelectedDate(date);
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
                onPress={() => {
                  const hours = selectedDate.getHours().toString().padStart(2, '0');
                  const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
                  // Add alarm logic here with hours and minutes
                  setShowCreateAlarmPopup(false);
                }}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  Create Alarm
                </Text>
              </TouchableOpacity>
            </View>
          </BottomPopup>
        )}
        
      </SafeAreaView>
    </LinearGradient>
  );
}
