'use client';

import QRCode from 'react-qr-code';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ShowQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  secret: string;
  issuer?: string;
}

export function ShowQrDialog({
  open,
  onOpenChange,
  name,
  secret,
  issuer = '2FA Authenticator',
}: ShowQrDialogProps) {
  // Construct otpauth URI
  // otpauth://totp/Issuer:AccountName?secret=Secret&issuer=Issuer
  const uri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(
    name
  )}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code for {name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <div className="bg-white p-4 rounded-xl">
            <QRCode value={uri} size={200} />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Scan this with another authenticator app to transfer your account.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
