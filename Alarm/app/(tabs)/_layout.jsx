import React from 'react';
import { View, Image } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import icons from '../../constants/icons';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Purchases from 'react-native-purchases';


const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    const setupPurchases = async () => {
      try {
        if(Platform.OS === 'ios') {
          await Purchases.configure({ apiKey: 'appl_QREOkhpBbXGDRXyYeCqXXvirAAA'});
        } else {
          await Purchases.configure({ apiKey: 'appl_QREOkhpBbXGDRXyYeCqXXvirAAA' });
        }

        const offerings = await Purchases.getOfferings();
        console.log('RevenueCat Offerings:', offerings);
        
        // Check if user is premium
        const customerInfo = await Purchases.getCustomerInfo();
        const isPro = customerInfo.entitlements.active.Pro !== undefined;
        console.log('User is premium:', isPro);
        console.log('Customer Info:', customerInfo);

        if(!isPro) {
          router.push('utils/two');
        } 

        if (offerings.current) {
          console.log('Current Offering:', {
            identifier: offerings.current.identifier,
            packages: offerings.current.availablePackages.map(pkg => ({
              identifier: pkg.identifier,
              product: {
                title: pkg.product.title,
                price: pkg.product.price,
                priceString: pkg.product.priceString,
                description: pkg.product.description
              }
            }))
          });
        } else {
          console.log('No current offering available');
        }
      } catch (error) {
        console.error('RevenueCat Error:', error);
      }
    };

    setupPurchases();
  }, []);




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