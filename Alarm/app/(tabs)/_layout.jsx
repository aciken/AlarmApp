import React from 'react';
import { View, Image } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import icons from '../../constants/icons';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// import Purchases from 'react-native-purchases';


const TabsLayout = () => {
  const insets = useSafeAreaInsets();

  // useEffect(() => {
  //   if(Platform.OS === 'ios') {
  //     Purchases.configure({apiKey: 'appl_QREOkhpBbXGDRXyYeCqXXvirAAA'});
  //   } else if(Platform.OS === 'android') {
  //     Purchases.configure({apiKey: 'appl_QREOkhpBbXGDRXyYeCqXXvirAAA'});
  //   }

  //   Purchases.getOfferings().then(console.log);
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
          <Tabs.Screen name="Wake"
          options={{
            tabBarIcon: ({color}) => (
              <View className="w-8 h-8 items-center justify-center">
                <Image 
                  source={icons.alarm}
                  style={{ width: 24, height: 24, tintColor: color }}
                  resizeMode="contain"
                />
              </View>
            )
          }}
        />

        <Tabs.Screen name="Tasks"
          options={{
            tabBarIcon: ({color}) => (
              <View className="w-8 h-8 items-center justify-center">
                <Image 
                  source={icons.calendar}
                  style={{ width: 24, height: 24, tintColor: color }}
                  resizeMode="contain"
                />
              </View>
            )
          }}
        />
        <Tabs.Screen name="Social"
          options={{
            tabBarIcon: ({color}) => (
              <View className="w-8 h-8 items-center justify-center">
                <Image 
                  source={icons.profile}
                  style={{ width: 24, height: 24, tintColor: color }}
                  resizeMode="contain"
                />
              </View>
            )
          }}
        />
      </Tabs>
    </View>
  );
};

export default TabsLayout;