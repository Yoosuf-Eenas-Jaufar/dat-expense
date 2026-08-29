import '../../global.css';

import { SplashScreen, Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import { AppLoadingScreen } from '@/components/app-loading-screen';
import { hydrateStores } from '@/stores';

import { Providers } from './providers';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isMinimumLoadTimePassed, setIsMinimumLoadTimePassed] =
    useState(false);
  const [nativeSplashHidden, setNativeSplashHidden] =
    useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await hydrateStores();
      } catch (error) {
        console.error(
          'Failed to hydrate stores:',
          error
        );
      } finally {
        setIsHydrated(true);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMinimumLoadTimePassed(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const hideNativeSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error(
          'Failed to hide native splash:',
          error
        );
      } finally {
        setNativeSplashHidden(true);
      }
    };

    hideNativeSplash();
  }, []);

  const isAppReady =
    isHydrated &&
    isMinimumLoadTimePassed &&
    nativeSplashHidden;

  if (!isAppReady) {
    return <AppLoadingScreen />;
  }

  return (
    <Providers>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(app)" />

        <Stack.Screen
          name="add-expense"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </Providers>
  );
}