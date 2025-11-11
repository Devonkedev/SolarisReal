import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import RootScreen from './src/router/RootScreen';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { initializeNotifications } from './src/utils/notification';
import { useAppFonts } from './src/theme/fonts';
import { TranslationProvider, useTranslationContext } from './src/i18n/TranslationProvider';

const TranslationGate = ({ children }: { children: ReactNode }) => {
  const { isLoading } = useTranslationContext();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B1120' }}>
        <ActivityIndicator size="large" color="#6EA8FF" />
      </View>
    );
  }

  return <>{children}</>;
};


export default function App() {
  const fontsLoaded = useAppFonts();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(undefined);
  const notificationListener = useRef(null);
  const responseListener = useRef(null);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      // navigation.navigate('ReminderScreen');
      console.log('Navigate to reminder screen..');
    });
    return () => subscription.remove();
  }, []);


  useEffect(() => {
    const setupNotifications = async () => {
      const granted = await initializeNotifications(); 
      if (!granted) {
        console.warn("Notification permission not granted");
        return;
      }

      // Optional: get Expo push token if needed later for remote push
      // const token = (await Notifications.getExpoPushTokenAsync()).data;
      // setExpoPushToken(token);

      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log("Notification received:", notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log("User tapped on notification:", response);
      });
    };

    setupNotifications();

    return () => {
      if (notificationListener.current)
        Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current)
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);



  // useEffect(() => {
  //   registerForPushNotificationsAsync().then((token) => token && setExpoPushToken(token));

  //   notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
  //     setNotification(notification);
  //   });

  //   responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
  //     console.log(response);
  //   });

  //   return () => {
  //     notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current);
  //     responseListener.current && Notifications.removeNotificationSubscription(responseListener.current);
  //   };
  // }, []);
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B1120' }}>
        <ActivityIndicator size="large" color="#6EA8FF" />
      </View>
    );
  }

  return (
    <TranslationProvider>
      <TranslationGate>
        <RootScreen />
      </TranslationGate>
    </TranslationProvider>
  );
}


async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: 'Here is the notification body',
      data: { data: 'goes here', test: { test1: 'more data' } },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}

const styles = {};
