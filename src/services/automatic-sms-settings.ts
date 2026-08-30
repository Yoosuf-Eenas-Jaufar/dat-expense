import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTOMATIC_SMS_DETECTION_KEY =
  'DatExpenseAutomaticSmsDetectionV1';

export async function getAutomaticSmsDetectionEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(
    AUTOMATIC_SMS_DETECTION_KEY
  );

  return value === 'true';
}

export async function setAutomaticSmsDetectionEnabled(
  enabled: boolean
): Promise<void> {
  await AsyncStorage.setItem(
    AUTOMATIC_SMS_DETECTION_KEY,
    enabled ? 'true' : 'false'
  );
}