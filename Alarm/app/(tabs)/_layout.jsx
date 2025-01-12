import React from 'react';
import { View, Image } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import icons from '../../constants/icons';

const TabsLayout = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f9ff' }}>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#0ea5e9',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 20,
            right: 20,
            backgroundColor: '#f0f9ff',
            borderRadius: 15,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            height: 80,
            paddingBottom: 15,
            paddingTop: 15,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            borderTopWidth: 0,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen name="Home"
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