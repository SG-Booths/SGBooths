import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SignInScreen from '../screens/SignInScreen';
import SignUpVendorScreen from '../screens/SignUpVendorScreen';
import SignUpVisitorScreen from '../screens/SignUpVisitorScreen';
import SetInstagramUsernameScreen from '../screens/SetInstagramUsernameScreen';
import SetShopImagesScreen from '../screens/SetShopImagesScreen';

const Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFF8F3' },
          animationEnabled: false,
        }}
      >
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUpVendorScreen" component={SignUpVendorScreen} />
        <Stack.Screen name="SignUpVisitorScreen" component={SignUpVisitorScreen} />
        <Stack.Screen name="SetShopImagesScreen" component={SetShopImagesScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SetInstagramUsernameScreen" component={SetInstagramUsernameScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
