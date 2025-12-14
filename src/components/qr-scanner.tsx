'use client';

import { Scanner } from '@yudiel/react-qr-scanner';

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: unknown) => void;
}

export function QrScanner({ onScan, onError }: QrScannerProps) {
  return (
    <div className="w-full overflow-hidden rounded-lg">
      <Scanner
        onScan={(result) => {
          if (result && result.length > 0) {
            onScan(result[0].rawValue);
          }
        }}
        onError={(error) => {
          if (onError) onError(error);
        }}
        components={{
          onOff: false,
          torch: false,
          zoom: false,
          finder: true,
        }}
        styles={{
          container: { width: '100%', height: '100%' },
        }}
      />
    </div>
  );
}
