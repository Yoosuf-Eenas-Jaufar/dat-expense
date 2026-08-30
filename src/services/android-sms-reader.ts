import {
  PermissionsAndroid,
  Platform,
} from 'react-native';

import DatSmsReaderModule, {
  type DatSmsMessage,
} from '../../modules/dat-sms-reader/src/DatSmsReaderModule';

export async function hasSmsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  return PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.READ_SMS
  );
}

export async function requestSmsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_SMS,
    {
      title: 'Enable payment detection',
      message:
        'Dat Expense uses payment SMS messages from 455 to record your expenses automatically.',
      buttonPositive: 'Allow',
      buttonNegative: 'Not now',
    }
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export function getCurrentMonthStart(): number {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0
  ).getTime();
}

export async function readCurrentMonth455Messages(): Promise<
  DatSmsMessage[]
> {
  if (Platform.OS !== 'android') {
    return [];
  }

  const permissionGranted = await hasSmsPermission();

  if (!permissionGranted) {
    throw new Error('SMS permission has not been granted.');
  }

  return DatSmsReaderModule.getMessagesFromSenderSince(
    '455',
    getCurrentMonthStart()
  );
}