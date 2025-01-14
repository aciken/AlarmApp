import { View, Text, Switch, TouchableOpacity, Platform, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import BottomPopup from '../components/BottomPopup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useGlobalContext } from '../context/GlobalProvider';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

export default function Home() {
  const { updateUser, updateLocalAlarm, user, setUser } = useGlobalContext();

  const [alarms, setAlarms] = useState(user.alarms);

  const CreateAlarm = async (date, days) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;

    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    await updateUser({
      alarms: [...user.alarms, {
        _id: id,
        time,
        days,
        enabled: false
      }]
    });
    const storedUser = await AsyncStorage.getItem('@user');
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setAlarms(parsedUser.alarms);

    axios.put('https://ac5a-109-245-203-120.ngrok-free.app/createAlarm', 
      {
        _id: id,
        time, 
        days: selectedDays, 
        userId: user._id
      }
    )
    .then((res) => {
      if(res.status == 200){
        setUser(res.data);
        setAlarms(res.data.alarms);
        AsyncStorage.setItem('@user', JSON.stringify(res.data));

      }
    })
    .catch((err) => {
      console.log(err);
    })
    setShowCreateAlarmPopup(false);
  }

  const editAlarm = async (alarmId, time, days ) => {

    await updateUser({
      alarms: user.alarms.map(alarm => 
        alarm._id === alarmId ? { ...alarm, time, days } : alarm
      )
    });

    const storedUser = await AsyncStorage.getItem('@user');
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setAlarms(parsedUser.alarms);




    axios.put('https://ac5a-109-245-203-120.ngrok-free.app/editAlarm', {
      time,
      days,
      userId: user._id,
      alarmId
    })
    .then((res) => {
      console.log(res.data);
      setUser(res.data);
      AsyncStorage.setItem('@user', JSON.stringify(res.data));
      setAlarms(res.data.alarms);
    })
    .catch((err) => {
      console.log(err);
    })
    setShowAlarmDetailsPopup(false);
  }


  const toggleAlarm = async (alarmId) => {
    const alarm = alarms.find(a => a._id === alarmId);
    // Update locally first
    console.log(alarm);

    try {
      await updateLocalAlarm(alarmId, { enabled: !alarm.enabled });
      const storedUser = await AsyncStorage.getItem('@user');
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setAlarms(parsedUser.alarms);

      console.log('updated');

      // Try to sync with server
      const res = await axios.put('https://ac5a-109-245-203-120.ngrok-free.app/toggleAlarm', {
        alarmId,
        enabled: !alarm.enabled,
        userId: user._id
      });
      
      console.log('finished');
    } catch (err) {
      console.log(err);
    }
  };

  const [showCreateAlarmPopup, setShowCreateAlarmPopup] = useState(false);
  const [selectedDays, setSelectedDays] = useState({
    M: false, T: false, W: false, T2: false, F: false, S: false, S2: false
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSleepPopup, setShowSleepPopup] = useState(false);
  const [showAlarmDetailsPopup, setShowAlarmDetailsPopup] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState(null);
  const [isSleeping, setIsSleeping] = useState(false);
  const [showSleepingPopup, setShowSleepingPopup] = useState(false);
  const [sleepStartTime, setSleepStartTime] = useState(null);

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

  const handleAlarmPress = (alarm) => {
    setSelectedAlarm({
      ...alarm,
      label: alarm.label || '',
      sound: alarm.sound || 'Default',
      snoozeEnabled: alarm.snoozeEnabled || false,
      vibrationEnabled: alarm.vibrationEnabled || false
    });
    setShowAlarmDetailsPopup(true);
  };

  const handleDeleteAlarm = () => {
    axios.put(`https://ac5a-109-245-203-120.ngrok-free.app/deleteAlarm`,{id: user._id, selectedAlarm})
    .then((res) => {
      setUser(res.data);
      AsyncStorage.setItem('@user', JSON.stringify(res.data));
      setAlarms(res.data.alarms);
      setShowAlarmDetailsPopup(false);
    })
    .catch((err) => {
      console.log(err);
    })
  }

  const handleStartSleep = () => {

    const sleepId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    axios.put('https://ac5a-109-245-203-120.ngrok-free.app/startSleep', {
      userId: user._id,
      sleepStartTime: new Date(),
      sleepId: sleepId
      })
    .then((res) => {
      setUser(res.data);
      AsyncStorage.setItem('@user', JSON.stringify(res.data));
    })
    .catch((err) => {
      console.log(err);
    })
    setShowSleepPopup(false);
  };

  const handleEndSleep = () => {

    axios.put('https://ac5a-109-245-203-120.ngrok-free.app/endSleep', {
      userId: user._id,
      sleepEndTime: new Date(),
      })
    .then((res) => {
      setUser(res.data);
      AsyncStorage.setItem('@user', JSON.stringify(res.data));
    })
    .catch((err) => {
      console.log(err);
    })

    setShowSleepingPopup(false);
  };

  return (
    <LinearGradient 
      colors={['#f8fafc', '#e0f2fe']} 
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 pt-2">
          <Text className="text-2xl font-bold text-sky-900">Alarm</Text>
          <Text className="text-sky-900/50 font-semibold">
            {(() => {
              const now = new Date();
              let nextAlarmTime = null;
              let minDiff = Infinity;

              alarms.forEach(alarm => {
                if (!alarm.enabled) return;
                
                const [hours, minutes] = alarm.time.split(':').map(Number);
                const alarmDays = alarm.days;
                
                // Check each enabled day
                ['M','T','W','T2','F','S','S2'].forEach((day, index) => {
                  if (!alarmDays[day]) return;
                  
                  let targetDay = index;
                  if (day === 'T2') targetDay = 3;
                  if (day === 'S2') targetDay = 6;
                  
                  let targetDate = new Date(now);
                  targetDate.setHours(hours, minutes, 0, 0);
                  
                  // Adjust to next occurrence of this day
                  const daysToAdd = (targetDay - now.getDay() + 7) % 7;
                  targetDate.setDate(targetDate.getDate() + daysToAdd);
                  
                  // If same day but time already passed, add 7 days
                  if (daysToAdd === 0 && targetDate < now) {
                    targetDate.setDate(targetDate.getDate() + 7);
                  }
                  
                  const diff = targetDate - now;
                  if (diff > 0 && diff < minDiff) {
                    minDiff = diff;
                    nextAlarmTime = targetDate;
                  }
                });
              });

              if (!nextAlarmTime) return 'no alarms set';
              
              const hours = Math.floor(minDiff / (1000 * 60 * 60));
              const minutes = Math.floor((minDiff % (1000 * 60 * 60)) / (1000 * 60));
              
              return `next in ${hours}h ${minutes}m`;
            })()}
          </Text>
        </View>

        {/* Scrollable Alarm List */}
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="px-4 pt-4">
            {alarms.length > 0 ? (
              <>
                {alarms.map((alarm, index) => (
                  <TouchableOpacity 
                    key={index}
                    className={`${alarm.enabled ? 'bg-white/80' : 'bg-white/60'} rounded-xl mb-3 p-4`}
                    onPress={() => handleAlarmPress(alarm)}
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
                        <View className="flex-row space-x-2">
                          {typeof alarm.days === 'object' ? (
                            ['M', 'T', 'W', 'T2', 'F', 'S', 'S2'].map((day, idx) => (
                              <View key={idx}>
                                <Text
                                  className={`${
                                    alarm.days[day] 
                                      ? 'text-sky-500 font-medium' 
                                      : 'text-gray-400'
                                  }`}
                                >
                                  {day.replace('T2', 'T').replace('S2', 'S')}
                                </Text>
                              </View>
                            ))
                          ) : (
                            <Text className={alarm.enabled ? 'text-slate-500' : 'text-slate-400'}>
                              {alarm.days}
                            </Text>
                          )}
                        </View>
                      </View>
                      <Switch
                        value={alarm.enabled}
                        onValueChange={() => toggleAlarm(alarm._id)}
                        trackColor={{ false: '#e2e8f0', true: '#38bdf8' }}
                        thumbColor={alarm.enabled ? '#ffffff' : '#94a3b8'}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
                <View className="h-64" />
              </>
            ) : (
              <View className="flex-1 items-center justify-center min-h-[500px]">
                <Text className="text-4xl mb-4">⏰</Text>
                <Text className="text-xl font-semibold text-gray-800 mb-2">
                  No Alarms Yet
                </Text>
                <Text className="text-gray-500 text-center">
                  Tap the + button to create your first alarm
                </Text>
                <View className="h-64" />
              </View>
            )}
          </View>
        </ScrollView>

        {/* Add Button */}
        <View className="absolute right-6 bottom-40">
          <TouchableOpacity 
            onPress={() => setShowCreateAlarmPopup(true)} 
            className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-sm"
          >
            <Text className="text-3xl text-sky-500">+</Text>
          </TouchableOpacity>
        </View>

        {/* Start Sleep/Sleeping Button */}
        <View className="px-4 pb-14">
          <TouchableOpacity 
            className={`${
              user.sleep.find(sleep => sleep.sleepEndTime === null) ? 'bg-indigo-500' : 'bg-sky-500'
            } py-4 rounded-xl flex-row items-center justify-center space-x-2`}
            onPress={() => user.sleep.find(sleep => sleep.sleepEndTime === null) ? setShowSleepingPopup(true) : setShowSleepPopup(true)}
          >
            <Text className="text-2xl">{user.sleep.find(sleep => sleep.sleepEndTime === null) ? '💤' : '🌙'}</Text>
            <Text className="text-white text-lg font-semibold">
              {user.sleep.find(sleep => sleep.sleepEndTime === null) ? 'Sleeping' : 'Start Sleep'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Create Alarm Popup */}
        {showCreateAlarmPopup && (
          <BottomPopup
            height={0.90}
            visible={showCreateAlarmPopup}
            onClose={() => setShowCreateAlarmPopup(false)}
          >
            <View className="flex-1">
              <Text className="text-2xl font-semibold text-sky-900 text-center mb-8 px-6">
                Create Alarm
              </Text>

              {/* Scrollable Content */}
              <ScrollView className="flex-1 px-6">
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

                {/* Sound Selection */}
                <TouchableOpacity 
                  className="flex-row justify-between items-center bg-white/80 p-4 rounded-xl mb-6"
                  onPress={() => {/* Handle sound selection */}}
                >
                  <View>
                    <Text className="text-gray-600 mb-1">Sound</Text>
                    <Text className="text-gray-800 font-medium">
                      {selectedAlarm?.sound || 'Default'}
                    </Text>
                  </View>
                  <Text className="text-gray-400">→</Text>
                </TouchableOpacity>

                {/* Snooze Toggle */}
                <View className="flex-row justify-between items-center bg-white/80 p-4 rounded-xl mb-6">
                  <View>
                    <Text className="text-gray-600 mb-1">Snooze</Text>
                    <Text className="text-gray-800 font-medium">5 minutes</Text>
                  </View>
                  <Switch
                    value={selectedAlarm?.snoozeEnabled || false}
                    onValueChange={(value) => setSelectedAlarm(prev => ({...prev, snoozeEnabled: value}))}
                    trackColor={{ false: '#e2e8f0', true: '#38bdf8' }}
                    thumbColor={selectedAlarm?.snoozeEnabled ? '#ffffff' : '#94a3b8'}
                  />
                </View>

                {/* Vibration Toggle */}
                <View className="flex-row justify-between items-center bg-white/80 p-4 rounded-xl mb-8">
                  <View>
                    <Text className="text-gray-600 mb-1">Vibration</Text>
                    <Text className="text-gray-800 font-medium">Enabled</Text>
                  </View>
                  <Switch
                    value={selectedAlarm?.vibrationEnabled || false}
                    onValueChange={(value) => setSelectedAlarm(prev => ({...prev, vibrationEnabled: value}))}
                    trackColor={{ false: '#e2e8f0', true: '#38bdf8' }}
                    thumbColor={selectedAlarm?.vibrationEnabled ? '#ffffff' : '#94a3b8'}
                  />
                </View>

                {/* Day Selection */}
                <View className="flex-row justify-between mb-8">
                  {['M', 'T', 'W', 'T2', 'F', 'S', 'S2'].map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setSelectedDays(prev => ({
                          ...prev,
                          [day]: !prev[day]
                        }));
                      }}
                      className={`w-10 h-10 rounded-full items-center justify-center border ${
                        selectedDays[day] ? 'bg-sky-400 border-sky-400' : 'border-sky-300'
                      }`}
                    >
                      <Text 
                        className={selectedDays[day] ? 'text-white' : 'text-sky-400'}
                      >
                        {day.replace('T2', 'T').replace('S2', 'S')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Bottom padding for scrolling */}
                <View className="h-20" />
              </ScrollView>

              {/* Fixed Create Button */}
              <View className="px-6 pb-6 pt-2 bg-white border-t border-gray-100">
                <TouchableOpacity 
                  className="bg-sky-400 rounded-xl py-4 px-6"
                  onPress={() => {CreateAlarm(selectedDate, selectedDays)}}
                >
                  <Text className="text-white text-center text-lg font-semibold">
                    Create Alarm
                  </Text>
                </TouchableOpacity>
              </View>
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
                <Text className="text-3xl font-semibold text-sky-900">
                  {(() => {
                    const now = new Date();
                    let nextAlarmTime = null;
                    let minDiff = Infinity;

                    alarms.forEach(alarm => {
                      if (!alarm.enabled) return;
                      
                      const [hours, minutes] = alarm.time.split(':').map(Number);
                      const alarmDays = alarm.days;
                      
                      ['M','T','W','T2','F','S','S2'].forEach((day, index) => {
                        if (!alarmDays[day]) return;
                        
                        let targetDay = index;
                        if (day === 'T2') targetDay = 3;
                        if (day === 'S2') targetDay = 6;
                        
                        let targetDate = new Date(now);
                        targetDate.setHours(hours, minutes, 0, 0);
                        
                        const daysToAdd = (targetDay - now.getDay() + 7) % 7;
                        targetDate.setDate(targetDate.getDate() + daysToAdd);
                        
                        if (daysToAdd === 0 && targetDate < now) {
                          targetDate.setDate(targetDate.getDate() + 7);
                        }
                        
                        const diff = targetDate - now;
                        if (diff > 0 && diff < minDiff) {
                          minDiff = diff;
                          nextAlarmTime = targetDate;
                        }
                      });
                    });

                    return nextAlarmTime ? 
                      nextAlarmTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) :
                      'No alarms';
                  })()}
                </Text>
                <Text className="text-gray-500 mt-1">
                  {(() => {
                    const now = new Date();
                    let nextAlarmTime = null;
                    let minDiff = Infinity;

                    alarms.forEach(alarm => {
                      if (!alarm.enabled) return;
                      
                      const [hours, minutes] = alarm.time.split(':').map(Number);
                      const alarmDays = alarm.days;
                      
                      ['M','T','W','T2','F','S','S2'].forEach((day, index) => {
                        if (!alarmDays[day]) return;
                        
                        let targetDay = index;
                        if (day === 'T2') targetDay = 3;
                        if (day === 'S2') targetDay = 6;
                        
                        let targetDate = new Date(now);
                        targetDate.setHours(hours, minutes, 0, 0);
                        
                        const daysToAdd = (targetDay - now.getDay() + 7) % 7;
                        targetDate.setDate(targetDate.getDate() + daysToAdd);
                        
                        if (daysToAdd === 0 && targetDate < now) {
                          targetDate.setDate(targetDate.getDate() + 7);
                        }
                        
                        const diff = targetDate - now;
                        if (diff > 0 && diff < minDiff) {
                          minDiff = diff;
                          nextAlarmTime = targetDate;
                        }
                      });
                    });

                    if (!nextAlarmTime) return 'No upcoming alarms';
                    
                    // Check if alarm is today or tomorrow
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    
                    if (nextAlarmTime.getDate() === today.getDate()) {
                      return 'Today';
                    } else if (nextAlarmTime.getDate() === tomorrow.getDate()) {
                      return 'Tomorrow';
                    } else {
                      return 'In ' + Math.ceil((nextAlarmTime - today) / (1000 * 60 * 60 * 24)) + ' days';
                    }
                  })()}
                </Text>
              </View>

              {/* Sleep Duration */}
              <View className="bg-sky-50 rounded-xl p-4 mb-8">
                <Text className="text-gray-600 mb-2">Sleep duration</Text>
                <Text className={(() => {
                    const now = new Date();
                    let nextAlarmTime = null;
                    let minDiff = Infinity;

                    alarms.forEach(alarm => {
                      if (!alarm.enabled) return;
                      
                      const [hours, minutes] = alarm.time.split(':').map(Number);
                      const alarmDays = alarm.days;
                      
                      ['M','T','W','T2','F','S','S2'].forEach((day, index) => {
                        if (!alarmDays[day]) return;
                        
                        let targetDay = index;
                        if (day === 'T2') targetDay = 3;
                        if (day === 'S2') targetDay = 6;
                        
                        let targetDate = new Date(now);
                        targetDate.setHours(hours, minutes, 0, 0);
                        
                        const daysToAdd = (targetDay - now.getDay() + 7) % 7;
                        targetDate.setDate(targetDate.getDate() + daysToAdd);
                        
                        if (daysToAdd === 0 && targetDate < now) {
                          targetDate.setDate(targetDate.getDate() + 7);
                        }
                        
                        const diff = targetDate - now;
                        if (diff > 0 && diff < minDiff) {
                          minDiff = diff;
                          nextAlarmTime = targetDate;
                        }
                      });
                    });

                    if (!nextAlarmTime) return 'text-3xl font-semibold text-sky-900';
                    
                    const now_ms = now.getTime();
                    const alarm_ms = nextAlarmTime.getTime();
                    const diff_hours = Math.floor((alarm_ms - now_ms) / (1000 * 60 * 60));
                    const diff_minutes = Math.floor(((alarm_ms - now_ms) % (1000 * 60 * 60)) / (1000 * 60));
                    
                    // Calculate how close to 8 hours
                    const totalHours = diff_hours + (diff_minutes / 60);
                    const distanceFrom8 = Math.abs(8 - totalHours);
                    
                    if (distanceFrom8 <= 0.5) return 'text-3xl font-semibold text-green-600'; // Very close to 8 hours
                    if (distanceFrom8 <= 1) return 'text-3xl font-semibold text-yellow-600'; // Within 1 hour of 8
                    return 'text-3xl font-semibold text-red-600'; // More than 1 hour difference
                })()}>
                  {(() => {
                    const now = new Date();
                    let nextAlarmTime = null;
                    let minDiff = Infinity;

                    alarms.forEach(alarm => {
                      if (!alarm.enabled) return;
                      
                      const [hours, minutes] = alarm.time.split(':').map(Number);
                      const alarmDays = alarm.days;
                      
                      ['M','T','W','T2','F','S','S2'].forEach((day, index) => {
                        if (!alarmDays[day]) return;
                        
                        let targetDay = index;
                        if (day === 'T2') targetDay = 3;
                        if (day === 'S2') targetDay = 6;
                        
                        let targetDate = new Date(now);
                        targetDate.setHours(hours, minutes, 0, 0);
                        
                        const daysToAdd = (targetDay - now.getDay() + 7) % 7;
                        targetDate.setDate(targetDate.getDate() + daysToAdd);
                        
                        if (daysToAdd === 0 && targetDate < now) {
                          targetDate.setDate(targetDate.getDate() + 7);
                        }
                        
                        const diff = targetDate - now;
                        if (diff > 0 && diff < minDiff) {
                          minDiff = diff;
                          nextAlarmTime = targetDate;
                        }
                      });
                    });

                    if (!nextAlarmTime) return 'N/A';
                    
                    const now_ms = now.getTime();
                    const alarm_ms = nextAlarmTime.getTime();
                    const diff_hours = Math.floor((alarm_ms - now_ms) / (1000 * 60 * 60));
                    const diff_minutes = Math.floor(((alarm_ms - now_ms) % (1000 * 60 * 60)) / (1000 * 60));
                    
                    return `${diff_hours}h ${diff_minutes}m`;
                  })()}
                </Text>
                <Text className="text-gray-500 mt-1">Recommended: 8 hours</Text>
              </View>

              {/* Start Button */}
              <TouchableOpacity 
                className="bg-sky-500 py-4 rounded-xl"
                onPress={handleStartSleep}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  Start Sleep Now
                </Text>
              </TouchableOpacity>
            </View>
          </BottomPopup>
        )}
        
        {/* Add new Alarm Details Popup */}
        {showAlarmDetailsPopup && selectedAlarm && (
          <BottomPopup
            visible={showAlarmDetailsPopup}
            onClose={() => {
              setShowAlarmDetailsPopup(false);
              setSelectedAlarm(null);
            }}
            height={0.65}
          >
            <ScrollView className="flex-1">
              <View className="px-6">
                <Text className="text-2xl font-semibold text-sky-900 text-center mb-8">
                  Edit Alarm
                </Text>

                {/* Time Picker */}
                <View className="bg-sky-50 rounded-xl mb-8">
                  <DateTimePicker
                    value={new Date(`2000-01-01T${selectedAlarm.time}`)}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                      if (date) {
                        // Handle time change
                        setSelectedAlarm(prev => ({...prev, time: date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}));
                      }
                    }}
                    textColor="#0ea5e9"
                    themeVariant="light"
                    style={{ height: 180 }}
                  />
                </View>

                {/* Day Selection */}
                <View className="flex-row justify-between mb-8">
                  {['M', 'T', 'W', 'T2', 'F', 'S', 'S2'].map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        const updatedDays = {
                          ...selectedAlarm.days,
                          [day]: !selectedAlarm.days[day]
                        };
                        setSelectedAlarm({
                          ...selectedAlarm,
                          days: updatedDays
                        });
                      }}
                      className={`w-10 h-10 rounded-full items-center justify-center border ${
                        selectedAlarm.days[day] ? 'bg-sky-400 border-sky-400' : 'border-sky-300'
                      }`}
                    >
                      <Text className={selectedAlarm.days[day] ? 'text-white' : 'text-sky-400'}>
                        {day.replace('T2', 'T').replace('S2', 'S')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-3">
                  {/* Delete Button */}
                  <TouchableOpacity 
                    className="flex-1 bg-white border border-red-500 py-4 rounded-xl"
                    onPress={() => {
                      handleDeleteAlarm();
                    }}
                  >
                    <Text className="text-red-500 text-center text-lg font-semibold">
                      Delete
                    </Text>
                  </TouchableOpacity>

                  {/* Save Button */}
                  <TouchableOpacity 
                    className="flex-1 bg-sky-500 py-4 rounded-xl"
                    onPress={() => {
                      editAlarm(selectedAlarm._id, selectedAlarm.time, selectedAlarm.days);

                    }}
                  >
                    <Text className="text-white text-center text-lg font-semibold">
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </BottomPopup>
        )}
        
        {/* Sleeping Status Popup */}
        {showSleepingPopup && (
          <BottomPopup
            visible={showSleepingPopup}
            onClose={() => setShowSleepingPopup(false)}
            height={0.5}
          >
            <View className="flex-1 px-6">
              <Text className="text-2xl font-semibold text-sky-900 text-center mb-8">
                Sleep Status
              </Text>

              {/* Sleep Duration */}
              <View className="bg-sky-50 rounded-xl p-4 mb-8">
                <Text className="text-gray-600 mb-2">Currently sleeping for</Text>
                <Text className="text-3xl font-semibold text-sky-900">
                  {(() => {
                    const currentSleep = user.sleep.find(sleep => sleep.sleepEndTime === null);
                    if (!currentSleep) return '0h 0m';
                    const now = new Date();
                    const sleepStart = new Date(currentSleep.sleepStartTime);
                    const diff = now - sleepStart;
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    return `${hours}h ${minutes}m`;
                  })()}
                </Text>
                <Text className="text-gray-500 mt-1">Started at {(() => {
                  const sleepStart = new Date(user.sleep.find(sleep => sleep.sleepEndTime === null)?.sleepStartTime);
                  return sleepStart.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  });
                })()}</Text>
              </View>

              {/* End Sleep Button */}
              <TouchableOpacity 
                className="bg-red-500 py-4 rounded-xl"
                onPress={handleEndSleep}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  End Sleep
                </Text>
              </TouchableOpacity>
            </View>
          </BottomPopup>
        )}
        
      </SafeAreaView>
    </LinearGradient>
  );
}
