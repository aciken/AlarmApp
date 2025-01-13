import { Stack } from 'expo-router';
import GlobalProvider from './context/GlobalProvider';

const RootLayout = () => {
  return (
    <GlobalProvider>
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name='index' />
      <Stack.Screen 
        name='(tabs)' 
        options={{
          animation: 'slide_from_bottom',
          presentation: 'push',
          gestureEnabled: false 
        }} 
      />
      <Stack.Screen 
        name='(auth)' 
        options={{
          animation: 'slide_from_bottom',
          animationEnabled: true,
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      />
    </Stack>
    </GlobalProvider>
  );
};

export default RootLayout;