import './config/firebase';
import React from 'react';
import RootNavigation from './navigation';
import { ThemeProvider } from 'react-native-elements';
import './config/firebase';
import { StyleSheet, TouchableOpacity, Text, View, Image } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';

export default function App() {
  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <ThemeProvider>
        <RootNavigation />
      </ThemeProvider>
    );
  }
}
