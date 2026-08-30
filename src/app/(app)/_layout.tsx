import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import {
  AppState,
  type AppStateStatus,
} from 'react-native';

import {
  hasSmsPermission,
  readCurrentMonth455Messages,
} from '@/services/android-sms-reader';
import { importCurrentMonthMessages } from '@/services/current-month-import';
import { useStores } from '@/stores';

export default function TabLayout() {
  const { expense } = useStores();

  const isAutomaticScanRunning = useRef(false);

  const scanPaymentsSilently = useCallback(async () => {
    if (isAutomaticScanRunning.current) {
      return;
    }

    try {
      isAutomaticScanRunning.current = true;

      const permissionGranted =
        await hasSmsPermission();

      // Never interrupt the user with a permission popup here.
      // Permission is requested manually from Settings.
      if (!permissionGranted) {
        return;
      }

      const messages =
        await readCurrentMonth455Messages();

      const result = importCurrentMonthMessages(
        messages.map(message => message.body),
        expense
      );

      if (result.imported > 0) {
        console.log(
          `Dat Expense automatically imported ${result.imported} new transaction(s).`
        );
      }
    } catch (error) {
      console.warn(
        'Automatic payment scan failed:',
        error
      );
    } finally {
      isAutomaticScanRunning.current = false;
    }
  }, [expense]);

  useEffect(() => {
    // Scan once when Dat Expense opens.
    void scanPaymentsSilently();

    let previousAppState =
      AppState.currentState;

    const subscription =
      AppState.addEventListener(
        'change',
        (nextAppState: AppStateStatus) => {
          const wasInBackground =
            previousAppState === 'background' ||
            previousAppState === 'inactive';

          if (
            wasInBackground &&
            nextAppState === 'active'
          ) {
            // Scan again when the user returns to Dat Expense.
            void scanPaymentsSilently();
          }

          previousAppState = nextAppState;
        }
      );

    return () => {
      subscription.remove();
    };
  }, [scanPaymentsSilently]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: '#111111',
        tabBarInactiveTintColor: '#8E8E93',

        tabBarStyle: {
          height: 68,
          paddingTop: 7,
          paddingBottom: 8,
          borderTopColor: '#E5E5E5',
          backgroundColor: '#FFFFFF',
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'home'
                  : 'home-outline'
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',

          tabBarIcon: ({
            color,
            size,
          }) => (
            <MaterialCommunityIcons
              name="cash-multiple"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'grid'
                  : 'grid-outline'
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'settings'
                  : 'settings-outline'
              }
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}