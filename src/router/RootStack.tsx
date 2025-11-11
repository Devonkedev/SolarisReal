import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SubsidyEligibilityScreen from '../screens/subsidy/SubsidyEligibilityScreen';
import SubsidyResultsScreen from '../screens/subsidy/SubsidyResultsScreen';
import TrackerScreen from '../screens/tracker/TrackerScreen';
import ProjectsScreen from '../screens/projects/ProjectsScreen';
import AddProjectScreen from '../screens/projects/AddProjectScreen';
import MapScreen from '../screens/map/HealthScreen';
import AddTrackerScreen from '../screens/tracker/AddTrackerScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import EditProfile from '../screens/profile/EditProfileScreen';
import AddHealthDataScreen from '../screens/map/AddHealthDataScreen';
import { useTranslation } from '../hooks/useTranslation';

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

const AuthStack = () => {
  return (
  <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      {/* Add other auth screens here if needed */}
    </Stack.Navigator>
  );
};


const MapStack = () => {
  return (
  <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapScreen" component={MapScreen} />
      <Stack.Screen name="AddHealthDataScreen" component={AddHealthDataScreen} />
      {/* Add other auth screens here if needed */}
    </Stack.Navigator>
  );
};

const ProjectsStack = () => {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProjectsScreen" component={ProjectsScreen} />
      <Stack.Screen name="AddProjectScreen" component={AddProjectScreen} />
    </Stack.Navigator>
  );
};

const SubsidyStack = () => {
  return (
  <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SubsidyEligibility" component={SubsidyEligibilityScreen} />
      <Stack.Screen name="SubsidyResults" component={SubsidyResultsScreen} />
    </Stack.Navigator>
  );
};
const TrackerStack = () => {
  return (
  <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TrackerScreen" component={TrackerScreen} />
      <Stack.Screen name="AddTrackerScreen" component={AddTrackerScreen} />
      {/* Add other auth screens here if needed */}
    </Stack.Navigator>
  );
}

const ProfileStack = () => {
  return (
  <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="SubsidyEligibility" component={SubsidyEligibilityScreen} />
      <Stack.Screen name="SubsidyResults" component={SubsidyResultsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      {/* Add otherauth screens here if needed */}
    </Stack.Navigator >
  );
}

const BottomNavigation = () => {
  const { translate } = useTranslation();
  return (
    <Tab.Navigator
    initialRouteName="Solar"
      // activeColor="#e91e63"
      // inactiveColor="#95a5a6"
      // barStyle={{ backgroundColor: '#ffffff' }}
      shifting={false}
      barStyle={{ height: 80, paddingBottom: 4 }}
    >
      <Tab.Screen
        name="Solar"
        component={SubsidyStack}
        options={{
          tabBarLabel: translate('Solar subsidy'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="solar-power" color={color} size={26} />
          ),
        }}
      />

<Tab.Screen
        name="Projects"
        component={ProjectsStack}
        options={{
          tabBarLabel: translate('Projects'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="clipboard-text" color={color} size={26} />
          ),
        }}
      />

      <Tab.Screen
        name="Tracker"
        component={TrackerStack}
        options={{
          tabBarLabel: translate('Tracker'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="map-marker" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapStack}
        options={{
          tabBarLabel: translate('Map'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="map" color={color} size={26} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: translate('Profile'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const RootStack = () => {
  const [user, setUser] = useState <User | null>(null)

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
  }, [])

  return (
    <View style={{ flex: 1 }}>
      {user ? <BottomNavigation /> : <AuthStack />}
    </View>
  );

  // const user = { uid: "mockUser", email: "test@example.com" };

  // return (
  //   <View style={{ flex: 1 }}>
  //     <BottomNavigation />
  //   </View>
  //   );
};

export default RootStack;