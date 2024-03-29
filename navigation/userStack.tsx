import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
import { RootTabParamList, RootTabScreenProps } from '../types';
import SettingsScreen from '../screens/SettingsScreen';
import HomeScreen from '../screens/HomeScreen';
import FollowingScreen from '../screens/FollowingScreen';
import EventInfoScreen from '../screens/EventInfoScreen';
import AddEventScreen from '../screens/AddEventScreen';
import VerifyAccountScreen from '../screens/VerifyAccountScreen';

const Stack = createStackNavigator();

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: '#C1C2E8',
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#575FCC',
        },
      }}
    >
      <BottomTab.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }: RootTabScreenProps<'Home'>) => ({
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon2 name="home" width={25} color={color} />,
        })}
      />
      <BottomTab.Screen
        name="Following"
        component={FollowingScreen}
        options={{
          title: 'Following',
          tabBarIcon: ({ color }) => <TabBarIcon name="people" width={30} color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

export default function UserStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen
          name="SettingsScreen"
          component={SettingsScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen name="EventInfoScreen" component={EventInfoScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddEvent" component={AddEventScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="VerifyAccountScreen"
          component={VerifyAccountScreen}
          options={{ headerShown: false, animationEnabled: true }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: { name: React.ComponentProps<typeof MaterialIcons>['name']; width: number; color: string }) {
  return <MaterialIcons size={props.width} style={{ marginBottom: -3 }} {...props} />;
}

function TabBarIcon2(props: { name: React.ComponentProps<typeof Entypo>['name']; width: number; color: string }) {
  return <Entypo size={props.width} style={{ marginBottom: -3 }} {...props} />;
}
