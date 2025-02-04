import React from 'react';
import { View, Image, Vibration, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import icons from '../../constants/icons';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import Purchases from 'react-native-purchases';
import * as Notifications from 'expo-notifications';
import { useGlobalContext } from '../context/GlobalProvider';

// Add this at the top level, outside the component
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: 'high',
  }),
});

const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useGlobalContext();

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // useEffect(() => {
  //   const setupPurchases = async () => {
  //     try {
  //       if(Platform.OS === 'ios') {
  //         await Purchases.configure({ apiKey: 'appl_QREOkhpBbXGDRXyYeCqXXvirAAA', appUserID: user._id });
  //       } else {
  //         await Purchases.configure({ apiKey: 'appl_QREOkhpBbXGDRXyYeCqXXvirAAA', appUserID: user._id });
  //       }

  //       const offerings = await Purchases.getOfferings();
  //       console.log('RevenueCat Offerings:', offerings);
        
  //       // Check if user is premium
  //       const customerInfo = await Purchases.getCustomerInfo();
  //       const isPro = customerInfo.entitlements.active.Pro !== undefined;
  //       console.log('User is premium:', isPro);
  //       console.log('Customer Info:', customerInfo);

  //       if(!isPro) {
  //         router.push('utils/two');
  //       } 

  //       if (offerings.current) {
  //         console.log('Current Offering:', {
  //           identifier: offerings.current.identifier,
  //           packages: offerings.current.availablePackages.map(pkg => ({
  //             identifier: pkg.identifier,
  //             product: {
  //               title: pkg.product.title,
  //               price: pkg.product.price,
  //               priceString: pkg.product.priceString,
  //               description: pkg.product.description
  //             }
  //           }))
  //         });
  //       } else {
  //         console.log('No current offering available');
  //       }
  //     } catch (error) {
  //       console.error('RevenueCat Error:', error);
  //     }
  //   };

  //   setupPurchases();
  // }, []);

  const handleTabPress = () => {
    try {
      // Pattern: [wait time, vibration time]
      // Vibration.vibrate([0, 10]);
    } catch (error) {
      console.log('Vibration error:', error);
    }
  };

  const handleAIPress = () => {
    handleTabPress();
    router.push('/modal/ai'); // This will open AI as a modal
  };

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
              allowAnnouncements: true,
            },
          });
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Failed to get push token for push notification!');
          return;
        }

        console.log('Notification permissions granted');
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();
  }, []);

  // console.log(new Date(2025, 1, 4, 13, 13, 0))

  // Notifications.scheduleNotificationAsync({
  //   content: {
  //     title: "⏰ Wake Up!",
  //     body: "Time to start your day",
  //     sound: true,
  //     priority: 'high',
  //     vibrate: [0, 250, 250, 250],
  //   },
  //   trigger: {
  //     date: new Date(2025, 1, 4, 13, 13, 0),
  //     repeats: true,
  //   },
  // });

  // useEffect(() => {
  //   let isMounted = true;
    
  //   const scheduleAlarmNotification = async () => {
  //     if (!user?.wakeup?.time || !isMounted) return;
  //     try {
  //       // Cancel any existing notifications
  //       await Notifications.cancelAllScheduledNotificationsAsync();

  //       // Get current time components
  //       const now = new Date();
  //       const currentHours = now.getHours();
  //       const currentMinutes = now.getMinutes();

  //       // Parse wake up time from stored string (format: "HH:mm")
  //       const [targetHours, targetMinutes] = user.wakeup.time.split(':').map(Number);

  //       // Create next trigger date
  //       const triggerDate = new Date();
  //       triggerDate.setHours(targetHours, targetMinutes, 0, 0);

  //       // If target time has already passed today, schedule for tomorrow
  //       if (targetHours < currentHours || 
  //           (targetHours === currentHours && targetMinutes <= currentMinutes)) {
  //         triggerDate.setDate(triggerDate.getDate() + 1);
  //       }

  //       // Schedule the notification
  //       await 

  //       console.log('Alarm scheduled for:', triggerDate.toLocaleString());
  //     } catch (error) {
  //       console.error('Error scheduling notification:', error);
  //     }
  //   };

  //   scheduleAlarmNotification();
    
  //   return () => {
  //     isMounted = false;
  //     Notifications.cancelAllScheduledNotificationsAsync();
  //   };
  // }, [user?.wakeup?.time]);

  // useEffect(() => {
  //   const subscription = Notifications.addNotificationResponseReceivedListener(response => {
  //     const data = response.notification.request.content.data;
      
  //     // Handle notification tap
  //     if (data?.screen) {
  //       router.push(data.screen);
  //     }
  //   });

  //   return () => subscription.remove();
  // }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#38bdf8',
          tabBarInactiveTintColor: '#475569',
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 20,
            right: 20,
            backgroundColor: '#1e293b',
            borderRadius: 15,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            height: 80,
            paddingBottom: 15,
            paddingTop: 15,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            borderTopWidth: 0,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen 
          name="Wake"
          options={{
            tabBarIcon: ({color}) => (
              <View className="w-8 h-8 items-center justify-center">
                <Image 
                  source={icons.alarm}
                  style={{ width: 24, height: 24, tintColor: color }}
                  resizeMode="contain"
                />
              </View>
            ),
            listeners: {
              tabPress: handleTabPress
            }
          }}
        />

        <Tabs.Screen 
          name="Tasks"
          options={{
            tabBarIcon: ({color}) => (
              <View className="w-8 h-8 items-center justify-center">
                <Image 
                  source={icons.stats}
                  style={{ width: 24, height: 24, tintColor: color }}
                  resizeMode="contain"
                />
              </View>
            ),
            listeners: {
              tabPress: handleTabPress
            }
          }}
        />

        <Tabs.Screen 
          name="Sleep"
          options={{
            tabBarIcon: ({color}) => (
              <View className="w-8 h-8 items-center justify-center">
                <Image 
                  source={icons.calendar}
                  style={{ width: 24, height: 24, tintColor: color }}
                  resizeMode="contain"
                />
              </View>
            ),
            listeners: {
              tabPress: handleTabPress
            }
          }}
        />

        <Tabs.Screen 
          name="Social"
          options={{
            tabBarIcon: ({color}) => (
              <View className="w-8 h-8 items-center justify-center">
                <Image 
                  source={icons.profile}
                  style={{ width: 24, height: 24, tintColor: color }}
                  resizeMode="contain"
                />
              </View>
            ),
            listeners: {
              tabPress: handleTabPress
            }
          }}
        />

        <Tabs.Screen 
          name="AI_Tab"
          listeners={{
            tabPress: (e) => {
              // Prevent default tab navigation
              e.preventDefault();
              handleTabPress();
              // Open modal instead
              router.push('/modal/ai');
            },
          }}
          options={{
            tabBarIcon: ({color}) => (
              <View className="w-8 h-8 items-center justify-center">
                <Image 
                  source={icons.ai}
                  style={{ width: 24, height: 24, tintColor: color }}
                  resizeMode="contain"
                />
              </View>
            ),
          }}
        />
      </Tabs>
    </View>
  );
};

// Add this outside the component
const scheduleAlarmNotification = async (wakeupTime) => {
  try {
    if (!wakeupTime) return;

    // Cancel any existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Get wake up time
    const [hours, minutes] = wakeupTime.split(':');
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Wake Up!",
        body: "Time to start your day",
        sound: true,
        priority: 'high',
        vibrate: [0, 250, 250, 250],
      },
      trigger: {
        hour: parseInt(hours),
        minute: parseInt(minutes),
        repeats: true,
      },
    });

    console.log('Alarm scheduled for:', `${hours}:${minutes}`);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

// Export it to use in other components
export { scheduleAlarmNotification };

export default TabsLayout;