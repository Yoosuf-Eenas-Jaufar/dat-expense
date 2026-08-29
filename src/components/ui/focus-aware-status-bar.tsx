import { useIsFocused } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

type Props = {
  hidden?: boolean;
};

export const FocusAwareStatusBar = ({ hidden = false }: Props) => {
  const isFocused = useIsFocused();
  const { colorScheme } = useColorScheme();

  if (Platform.OS === 'web' || !isFocused) {
    return null;
  }

  return (
    <StatusBar
      style={colorScheme === 'dark' ? 'light' : 'dark'}
      hidden={hidden}
    />
  );
};