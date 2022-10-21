import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SignInScreen from '../screens/SignInScreen';
import SignUpVendorScreen from '../screens/SignUpVendorScreen';
import SignUpVisitorScreen from '../screens/SignUpVisitorScreen';
import SetInstagramUsernameScreen from '../screens/SetInstagramUsernameScreen';
import SetShopImagesScreen from '../screens/SetShopImagesScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

export default function AuthStack() {
  const [isAppFirstLaunched, setIsAppFirstLaunched]: any = useState(null);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const appData = await AsyncStorage.getItem('isAppFirstLaunched');
    console.log(appData);
    if (appData === null) {
      setIsAppFirstLaunched(true);
      AsyncStorage.setItem('isAppFirstLaunched', 'false');
    } else {
      setIsAppFirstLaunched(false);
    }
  };

  console.log(isAppFirstLaunched);
  return isAppFirstLaunched != null ? (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFF8F3' },
          animationEnabled: false,
        }}
      >
        {isAppFirstLaunched && (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        )}
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUpVendorScreen" component={SignUpVendorScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUpVisitorScreen" component={SignUpVisitorScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SetShopImagesScreen" component={SetShopImagesScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="SetInstagramUsernameScreen"
          component={SetInstagramUsernameScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  ) : null;
}
