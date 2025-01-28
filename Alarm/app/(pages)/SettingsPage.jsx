import { View, Text, TouchableOpacity, Switch, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '../context/GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser, setIsLogged } = useGlobalContext();
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      setUser(null);
      setIsLogged(false);
      router.back();
      router.replace('/');
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  const SettingItem = ({ icon, title, description, value, onValueChange, type = "switch" }) => (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
      <View className="flex-row items-center flex-1">
        <Text className="text-2xl mr-3">{icon}</Text>
        <View className="flex-1 mr-4">
          <Text className="text-base font-medium text-gray-300">{title}</Text>
          {description && (
            <Text className="text-sm text-gray-500 mt-0.5">{description}</Text>
          )}
        </View>
      </View>
      {type === "switch" ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#1e293b', true: '#0ea5e9' }}
          thumbColor={value ? '#ffffff' : '#64748b'}
        />
      ) : type === "button" && (
        <TouchableOpacity 
          onPress={onValueChange}
          className="bg-gray-800 px-3 py-1.5 rounded-full"
        >
          <Text className="text-gray-400">{value}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <LinearGradient 
      colors={['#0f172a', '#1e293b']} 
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 py-4 border-b border-gray-800">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-4"
          >
            <Image 
              source={require('../../assets/icons/back.png')}
              className="w-6 h-6"
              style={{ tintColor: '#94a3b8' }}
            />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-white">Settings</Text>
        </View>

        <ScrollView className="flex-1">
          {/* Notifications Section */}
          <View className="mt-6">
            <Text className="px-4 mb-2 text-sm font-medium text-sky-500">
              Notifications
            </Text>
            <SettingItem
              icon="🔔"
              title="Push Notifications"
              description="Get reminders for your sleep schedule"
              value={notifications}
              onValueChange={setNotifications}
            />
            <SettingItem
              icon="🔊"
              title="Sound"
              description="Play sound with notifications"
              value={soundEnabled}
              onValueChange={setSoundEnabled}
            />
            <SettingItem
              icon="📳"
              title="Vibration"
              description="Vibrate with notifications"
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
            />
          </View>

          {/* Account Section */}
          <View className="mt-6">
            <Text className="px-4 mb-2 text-sm font-medium text-sky-500">
              Account
            </Text>
            <SettingItem
              icon="👤"
              title="Profile"
              description={user?.email}
              value="Edit"
              type="button"
              onValueChange={() => console.log('Edit profile')}
            />
            <SettingItem
              icon="🔒"
              title="Privacy"
              description="Manage your data and privacy settings"
              value="View"
              type="button"
              onValueChange={() => console.log('View privacy')}
            />
          </View>

          {/* About Section */}
          <View className="mt-6">
            <Text className="px-4 mb-2 text-sm font-medium text-sky-500">
              About
            </Text>
            <SettingItem
              icon="📱"
              title="Version"
              description="Current version of the app"
              value="1.0.0"
              type="button"
              onValueChange={() => {}}
            />
            <SettingItem
              icon="📄"
              title="Terms of Service"
              value="View"
              type="button"
              onValueChange={() => console.log('View terms')}
            />
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            onPress={handleLogout}
            className="mx-4 mt-8 mb-6 bg-red-500/20 p-4 rounded-xl border border-red-500/20"
          >
            <Text className="text-red-500 text-center font-semibold text-lg">
              Log Out
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
