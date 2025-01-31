import { Stack } from 'expo-router';

export default function PagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="WakeSetup"        
      options={{
          animation: 'slide_from_bottom',
          animationEnabled: true,
          contentStyle: { backgroundColor: '#f8fafc' },
          presentation: 'modal',
        }} />
      <Stack.Screen name="SleepSetup" />
      <Stack.Screen name="CurrentSleep" />
      <Stack.Screen name="SettingsPage" />
      <Stack.Screen name="AllSleeps" />
      <Stack.Screen name="SleepDetails"
      options={{
        animation: 'slide_from_bottom',
        animationEnabled: true,
        contentStyle: { backgroundColor: '#f8fafc' },
        presentation: 'modal',
      }} />
    </Stack>
  );
}
