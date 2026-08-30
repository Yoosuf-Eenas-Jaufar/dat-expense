import * as React from 'react';

import { DatSmsReaderViewProps } from './DatSmsReader.types';

export default function DatSmsReaderView(props: DatSmsReaderViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
