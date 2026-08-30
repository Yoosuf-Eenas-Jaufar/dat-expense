import { requireNativeView } from 'expo';
import * as React from 'react';

import { DatSmsReaderViewProps } from './DatSmsReader.types';

const NativeView: React.ComponentType<DatSmsReaderViewProps> =
  requireNativeView('DatSmsReader');

export default function DatSmsReaderView(props: DatSmsReaderViewProps) {
  return <NativeView {...props} />;
}
