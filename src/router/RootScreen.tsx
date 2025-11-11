import React from 'react';
import { View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import RootStack from './RootStack';
import { appLightTheme } from '../theme';
import { colors } from '../styles/tokens';

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
        colors={[colors.palette.indigo900, '#102A43', colors.palette.indigo700]}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <PaperProvider theme={appLightTheme}>
            <View style={{ flex: 1, backgroundColor: 'rgba(248,250,255,0.85)' }}>
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