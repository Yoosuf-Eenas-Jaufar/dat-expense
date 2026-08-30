import { requireNativeModule } from 'expo-modules-core';

export interface DatSmsMessage {
  id: string;
  address: string;
  body: string;
  date: number;
}

interface DatSmsReaderNativeModule {
  getMessagesFromSenderSince(
    sender: string,
    sinceEpochMs: number
  ): Promise<DatSmsMessage[]>;
}

export default requireNativeModule(
  'DatSmsReader'
) as DatSmsReaderNativeModule;