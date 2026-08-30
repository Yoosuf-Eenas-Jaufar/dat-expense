import {
  NativeModule,
  requireNativeModule,
} from 'expo';

export interface DatSmsMessage {
  id: string;
  address: string;
  body: string;
  date: number;
}

declare class DatSmsReaderModule extends NativeModule {
  getMessagesFromSenderSince(
    sender: string,
    sinceEpochMs: number
  ): Promise<DatSmsMessage[]>;
}

export default requireNativeModule<DatSmsReaderModule>(
  'DatSmsReader'
);