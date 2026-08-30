import {
  PermissionsAndroid,
  Platform,
} from 'react-native';

import DatSmsReaderModule, {
  type DatSmsMessage,
} from '../../modules/dat-sms-reader/src/DatSmsReaderModule';

const PAYMENT_SMS_SENDER = '455';

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
      title: 'SMS Payment Detection',
      message:
        'Dat Expense needs SMS access to detect payment messages from 455 and automatically add your expenses.',
      buttonPositive: 'Allow',
      buttonNegative: 'Cancel',
    }
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export function getCurrentMonthStart(): number {
  const now = new Date();

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0
  );

  return startOfMonth.getTime();
}

export async function readCurrentMonth455Messages(): Promise<
  DatSmsMessage[]
> {
  if (Platform.OS !== 'android') {
    return [];
  }

  const permissionGranted =
    await hasSmsPermission();

  if (!permissionGranted) {
    throw new Error(
      'SMS permission has not been granted.'
    );
  }

  const sinceEpochMs =
    getCurrentMonthStart();

  return DatSmsReaderModule.getMessagesFromSenderSince(
    PAYMENT_SMS_SENDER,
    sinceEpochMs
  );
}