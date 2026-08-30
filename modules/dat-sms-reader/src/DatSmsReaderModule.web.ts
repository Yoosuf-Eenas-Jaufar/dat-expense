import { registerWebModule, NativeModule } from 'expo';

import { DatSmsReaderModuleEvents } from './DatSmsReader.types';

class DatSmsReaderModule extends NativeModule<DatSmsReaderModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(DatSmsReaderModule, 'DatSmsReaderModule');
