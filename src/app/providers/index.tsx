import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { StoresProvider } from '@/stores';

export function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StoresProvider>
        {children}
      </StoresProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});