import { Stack } from 'expo-router';

const RootLayout = () => {

    return (
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: '#09090b' },
              animation: 'none',
              animationDuration: 0,
              animationEnabled: false,
            }}>
            <Stack.Screen name='index' options={{ headerShown: false }} />
            <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
          </Stack>
      );
    };
    
    export default RootLayout;