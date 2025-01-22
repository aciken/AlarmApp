import { Stack } from 'expo-router';

export default function PagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="WakeSetup" />
      <Stack.Screen name="SleepSetup" />
      <Stack.Screen name="CurrentSleep" />
    </Stack>
  );
}
