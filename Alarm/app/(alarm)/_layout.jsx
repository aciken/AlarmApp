import { Stack } from 'expo-router';

export default function AlarmLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Alarm" />
      <Stack.Screen name="AlarmChallenge" />
    </Stack>
  );
}
