import React from 'react';
import { View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import RootStack from './RootStack';
import { appLightTheme } from '../theme';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

const RootScreen = () => {
  return (
    <SafeAreaProvider>
      <LinearGradient
        colors={['#0B1120', '#102A43', '#1A365D']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <PaperProvider theme={appLightTheme}>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.75)' }}>
              <NavigationContainer theme={navigationTheme}>
                <RootStack />
              </NavigationContainer>
            </View>
          </PaperProvider>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
};

export default RootScreen;