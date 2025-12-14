'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QrCode, X } from 'lucide-react';
import { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { QrScanner } from '@/components/qr-scanner';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  secret: z.string().min(1, 'Secret is required').regex(/^[A-Z2-7]+=*$/i, 'Invalid Base32 secret'),
  description: z.string().optional(),
  tags: z.string().optional(),
});

interface AddAuthenticatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAuthenticatorDialog({
  open,
  onOpenChange,
}: AddAuthenticatorDialogProps) {
  const [isScanning, setIsScanning] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      secret: '',
      description: '',
      tags: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const tagsArray = values.tags
        ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];
      
      const payload = {
        name: values.name,
        secret: values.secret.replace(/\s/g, ''), // Remove spaces
        description: values.description,
        tags: tagsArray,
      };
      
      const response = await api.post('/authenticators', payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Authenticator added successfully');
      queryClient.invalidateQueries({ queryKey: ['authenticators'] });
      onOpenChange(false);
      form.reset();
      setIsScanning(false);
    },
    onError: (error: AxiosError<{ error: string }>) => {
      const errorMessage = typeof error.response?.data?.error === 'string'
        ? error.response.data.error
        : 'Failed to add authenticator';
      toast.error(errorMessage);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  const handleScan = (data: string) => {
    try {
      // Basic otpauth parsing
      // otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example
      if (!data.startsWith('otpauth://')) {
        toast.error('Invalid QR Code: Not an authenticator code');
        return;
      }

      const url = new URL(data);
      const secret = url.searchParams.get('secret');
      const issuer = url.searchParams.get('issuer');
      
      // Extract label (path)
      let label = decodeURIComponent(url.pathname.replace(/^\/\/?/, ''));
      if (label.startsWith('totp/')) {
        label = label.substring(5);
      }

      if (secret) {
        form.setValue('secret', secret);
      } else {
        toast.error('Invalid QR Code: No secret found');
        return;
      }

      // Try to determine a good name
      let name = label;
      if (issuer) {
        // If label already contains issuer (e.g. "Issuer:Account"), keep it or clean it?
        // Let's just use the label as name, or issuer if label is email
        if (!name.includes(issuer)) {
             name = `${issuer} (${name})`;
        }
      }
      
      form.setValue('name', name);
      setIsScanning(false);
      toast.success('QR Code scanned successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to parse QR Code');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsScanning(false);
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Add Account</DialogTitle>
            <div className="flex items-center gap-2 mr-4">
              {!isScanning ? (
                <Button variant="outline" size="sm" onClick={() => setIsScanning(true)}>
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan QR
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setIsScanning(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel Scan
                </Button>
              )}
            </div>
          </div>
          <DialogDescription>
            {isScanning
              ? 'Scan a QR code from another authenticator app.'
              : 'Enter the details of your 2FA account manually.'}
          </DialogDescription>
        </DialogHeader>

        {isScanning ? (
          <div className="aspect-square w-full bg-muted rounded-lg overflow-hidden relative">
            <QrScanner onScan={handleScan} onError={(e) => console.error(e)} />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Google" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secret Key</FormLabel>
                    <FormControl>
                      <Input placeholder="JBSWY3DPEHPK3PXP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. work account" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (Comma separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="work, email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Adding...' : 'Add Account'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
