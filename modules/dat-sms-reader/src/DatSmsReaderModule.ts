import { NativeModule, requireNativeModule } from 'expo';

import { DatSmsReaderModuleEvents } from './DatSmsReader.types';

declare class DatSmsReaderModule extends NativeModule<DatSmsReaderModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<DatSmsReaderModule>('DatSmsReader');
