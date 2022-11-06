import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SetInstagramUsernameScreen from '../screens/SetInstagramUsernameScreen';
import SetShopImagesScreen from '../screens/SetShopImagesScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReferralScreen from '../screens/ReferralScreen';

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

  return isAppFirstLaunched != null ? (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFF8F3' },
          animationEnabled: false,
        }}
      >
        {isAppFirstLaunched && <Stack.Screen name="Onboarding" component={OnboardingScreen} />}
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="ReferralScreen" component={ReferralScreen} />
        <Stack.Screen name="SetInstagramUsernameScreen" component={SetInstagramUsernameScreen} />
        <Stack.Screen name="SetShopImagesScreen" component={SetShopImagesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  ) : null;
}
