import { View, Text, TouchableOpacity, Platform, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef, useEffect } from 'react';
import BottomPopup from '../components/BottomPopup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useGlobalContext } from '../context/GlobalProvider';
import { useRouter } from 'expo-router';
import Purchases from 'react-native-purchases';
// import RevenueCatUI from 'react-native-purchases-ui';


export default function Wake() {
  const router = useRouter();
  const { user } = useGlobalContext();
  const [showTimePickerPopup, setShowTimePickerPopup] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [isWakeUpSet, setIsWakeUpSet] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;



  useEffect(() =>{
    console.log('user', user)
  }, [user])


  useEffect(() => {
    if (!user.wakeup.time) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [user.wakeup.time]);

  useEffect(() => {
    // Check for alarm time every second
    const checkAlarm = setInterval(() => {
      if (user.wakeup.time) {
        const now = new Date();
        const alarmTime = new Date(user.wakeup.time);
        
        // Compare hours and minutes
        if (now.getHours() === alarmTime.getHours() && 
            now.getMinutes() === alarmTime.getMinutes()) {
          router.push('Alarm');
          clearInterval(checkAlarm);
        }
      }
    }, 1000);

    return () => clearInterval(checkAlarm);
  }, [user.wakeup.time]);

  useEffect(() => {
    const setupPurchases = async () => {
      try {
        if(Platform.OS === 'ios') {
          await Purchases.configure({ apiKey: 'appl_QREOkhpBbXGDRXyYeCqXXvirAAA'});
        } else {
          await Purchases.configure({ apiKey: 'appl_QREOkhpBbXGDRXyYeCqXXvirAAA' });
        }

        // Sync user ID with RevenueCat before showing offerings
        await Purchases.logIn(user._id);
        
        const offerings = await Purchases.getOfferings();
        console.log('RevenueCat Offerings:', offerings);
        
        // Check if current user has premium
        const customerInfo = await Purchases.getCustomerInfo();
        if (!customerInfo.entitlements.active.premium) {
          setShowPaywall(true);
        }
      } catch (error) {
        console.error('RevenueCat Error:', error);
      }
    };

    if (user?._id) {
      setupPurchases();
    }
  }, [user]);

  const handleSetWakeUpTime = (time) => {
    setSelectedTime(time);
    setIsWakeUpSet(true);
    setShowTimePickerPopup(false);
    
    // Button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    return days[today.getDay()];
  };

  const handlePurchase = async (pkg) => {
    try {
      // Ensure user is logged in with correct ID before purchase
      await Purchases.logIn(user._id);
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      console.log('Purchase success:', customerInfo);
      setShowPaywall(false);
    } catch (error) {
      if (!error.userCancelled) {
        console.error('Purchase error:', error);
      }
    }
  };

  // Add this console log to help debug
  console.log('Current user state:', user);

  // Wrap the entire component in a try-catch to find the error
  try {
    const getWakeupTime = () => {
      if (!user?.wakeup?.time) return null;
      return user.wakeup.time;
    };

    const getSleepTime = () => {
      if (!user?.sleep || user.sleep.length === 0) return null;
      return user.sleep[user.sleep.length - 1];
    };

    const getStreak = () => {
      return user?.streak || 0;
    };

    // Add defensive check at component level
    if (!user || !user.wakeup) {
      console.log('User or wakeup data not available');
      return (
        <LinearGradient 
          colors={['#0f172a', '#1e293b']} 
          style={{ flex: 1 }}
        >
          <SafeAreaView className="flex-1">
            <View className="px-4 pt-4">
              <View className="flex-row justify-between items-start mb-6">
                <View>
                  <Text className="text-3xl font-bold text-white">Welcome</Text>
                </View>
                
                <TouchableOpacity
                  onPress={() => router.push('/SettingsPage')}
                  className="bg-gray-900/50 p-2.5 rounded-full border border-gray-800/50"
                >
                  <Image 
                    source={require('../../assets/icons/settings.png')} 
                    className="w-6 h-6"
                    style={{ tintColor: '#94a3b8' }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      );
    }

    return (
      <LinearGradient 
        colors={['#0f172a', '#1e293b']} 
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1">
          {/* Minimal Header */}
          <View className="px-4 pt-4">
            <View className="flex-row justify-between items-start mb-6">
              <View>
                <Text className="text-3xl font-bold text-white">
                  {new Date().getHours() < 12 ? 'Good Morning' : 
                   new Date().getHours() < 17 ? 'Good Afternoon' : 
                   'Good Evening'}
                </Text>
                <View className="flex-row items-center mt-2">
                  <Text className="text-4xl mr-2">🔥</Text>
                  <Text className="text-sky-400 text-lg">
                    <Text className="font-bold">{getStreak()}</Text>
                    <Text className="text-gray-400"> day streak</Text>
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.push('/SettingsPage')}
                className="bg-gray-900/50 p-2.5 rounded-full border border-gray-800/50"
              >
                <Image 
                  source={require('../../assets/icons/settings.png')} 
                  className="w-6 h-6"
                  style={{ tintColor: '#94a3b8' }}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Content - Circle and Button */}
          <View className="flex-1 items-center justify-center px-8">
            {/* Wake Up Time Circle */}
            <Animated.View 
              style={{
                transform: [{ scale: getWakeupTime() ? 1 : pulseAnim }],
                shadowColor: getWakeupTime() ? '#0ea5e9' : '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: getWakeupTime() ? 0.4 : 0.2,
                shadowRadius: 16,
                elevation: 10,
              }}
            >
              <TouchableOpacity 
                onPress={() => router.push('WakeSetup')}
                className="w-72 h-72 rounded-full items-center justify-center"
                style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  borderWidth: 2,
                  borderColor: getWakeupTime() ? '#0ea5e9' : 'rgba(14, 165, 233, 0.1)',
                }}
              >
                <LinearGradient
                  colors={getWakeupTime() ? 
                    ['rgba(14, 165, 233, 0.2)', 'rgba(37, 99, 235, 0.1)'] : 
                    ['rgba(30, 41, 59, 0.8)', 'rgba(30, 41, 59, 0.9)']}
                  className="absolute w-full h-full rounded-full"
                />
                {getWakeupTime() ? (
                  <View className="items-center">
                    <Text className="text-gray-400 text-base mb-1">Wake up at</Text>
                    <Text className="text-7xl font-bold text-white tracking-tight">
                      {formatTime(new Date(getWakeupTime()))}
                    </Text>
                    <Text className="text-sky-400/80 text-sm mt-3">tap to adjust</Text>
                  </View>
                ) : (
                  <View className="items-center">
                    <Text className="text-6xl mb-4">⏰</Text>
                    <Text className="text-white text-xl font-medium">
                      Set Wake Up Time
                    </Text>
                    <Text className="text-gray-400/80 text-sm mt-2">tap to set</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Simplified Sleep Button */}
            <View className="w-full mt-16">
              {getSleepTime() && (
                <Text className="text-gray-400 text-center mb-4">
                  {calculateSleepDuration(getSleepTime())} of sleep recommended
                </Text>
              )}
              <TouchableOpacity 
                onPress={() => {
                  if(!user.sleep.find(sleep => sleep.sleepEndTime === null ) || user.sleep.length === 0) {
                    router.push('SleepSetup');
                  } else {
                    router.push('CurrentSleep');
                  }
                }}
                className={`
                  w-full rounded-2xl overflow-hidden border
                  ${getSleepTime() && !getSleepTime().sleepEndTime ? 'border-indigo-500/30 bg-indigo-500/10' 
                    : 'border-sky-500/30 bg-sky-500/10'}
                `}
              >
                <LinearGradient
                  colors={getSleepTime() && !getSleepTime().sleepEndTime
                    ? ['rgba(99, 102, 241, 0.1)', 'rgba(99, 102, 241, 0.05)']
                    : ['rgba(14, 165, 233, 0.1)', 'rgba(14, 165, 233, 0.05)']}
                  className="px-5 py-4"
                >
                  {getSleepTime() && !getSleepTime().sleepEndTime ? (
                    <View className="flex-row items-center justify-between py-1">
                      <View className="flex-row items-center">
                        <View className="bg-indigo-500/10 rounded-full p-2.5 mr-3">
                          <Text className="text-2xl">💤</Text>
                        </View>
                        <View>
                          <Text className="text-white text-lg font-semibold">
                            Currently Sleeping
                          </Text>
                          <Text className="text-indigo-300 text-sm mt-0.5">
                            Since {new Date(getSleepTime().sleepStartTime)
                              .toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              })}
                          </Text>
                        </View>
                      </View>
                      <View className="bg-indigo-500/10 rounded-full px-3 ml-2 py-1.5">
                        <Text className="text-indigo-200 text-sm font-medium">Details</Text>
                      </View>
                    </View>
                  ) : (
                    <View className="flex-row items-center justify-between py-1">
                      <View className="flex-row items-center">
                        <View className="bg-sky-500/10 rounded-full p-2.5 mr-3">
                          <Text className="text-2xl">🌙</Text>
                        </View>
                        <Text className="text-white text-lg font-semibold">
                          Start Sleep
                        </Text>
                      </View>
                      <View className="bg-sky-500/10 rounded-full px-3 py-1.5">
                        <Text className="text-sky-300 text-sm">Tap to Setup</Text>
                      </View>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Time Picker Popup */}
          {showTimePickerPopup && (
            <BottomPopup
              visible={showTimePickerPopup}
              onClose={() => setShowTimePickerPopup(false)}
              height={0.5}
            >
              <View className="flex-1 px-8">
                <Text className="text-2xl font-semibold text-white text-center mb-8">
                  Set Wake Up Time
                </Text>

                <View className="bg-gray-800/50 rounded-2xl mb-8 overflow-hidden">
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

                <TouchableOpacity 
                  className="bg-gradient-to-r from-sky-600 to-sky-500 py-5 rounded-2xl"
                  style={{
                    shadowColor: '#0ea5e9',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                  onPress={() => handleSetWakeUpTime(selectedTime)}
                >
                  <Text className="text-white text-center text-lg font-semibold">
                    Set Time
                  </Text>
                </TouchableOpacity>
              </View>
            </BottomPopup>
          )}

          {/* {showPaywall && (
            <RevenueCatUI.Paywall 
              visible={showPaywall}
              onDismiss={() => setShowPaywall(false)}
            />
          )} */}
        </SafeAreaView>
      </LinearGradient>
    );
  } catch (error) {
    // Log the error to help debug
    console.error('Error in Wake component:', error);
    return null;
  }
}

const calculateSleepDuration = (sleep) => {
  const now = new Date();
  const sleepEnd = new Date(sleep.sleepEndTime);
  const sleepStart = new Date(sleep.sleepStartTime);
  const duration = Math.abs(sleepEnd.getTime() - sleepStart.getTime());
  const hours = Math.ceil(duration / (1000 * 60 * 60));
  return `${hours} hours`;
};



