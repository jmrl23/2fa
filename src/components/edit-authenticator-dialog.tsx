'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect } from 'react';
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

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  tags: z.string().optional(),
});

interface Authenticator {
  id: string;
  name: string;
  description: string | null;
  tags: string[] | null;
  secret: string;
}

interface EditAuthenticatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authenticator: Authenticator;
}

export function EditAuthenticatorDialog({
  open,
  onOpenChange,
  authenticator,
}: EditAuthenticatorDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: authenticator.name,
      description: authenticator.description || '',
      tags: authenticator.tags?.join(', ') || '',
    },
  });

  // Reset form when authenticator changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: authenticator.name,
        description: authenticator.description || '',
        tags: authenticator.tags?.join(', ') || '',
      });
    }
  }, [authenticator, form, open]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const tagsArray = values.tags
        ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];
      
      const payload = {
        name: values.name,
        description: values.description,
        tags: tagsArray,
      };
      
      const response = await api.patch(`/authenticators/${authenticator.id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Authenticator updated successfully');
      queryClient.invalidateQueries({ queryKey: ['authenticators'] });
      onOpenChange(false);
    },
    onError: (error: AxiosError<{ error: string }>) => {
      const errorMessage = typeof error.response?.data?.error === 'string'
        ? error.response.data.error
        : 'Failed to update authenticator';
      toast.error(errorMessage);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>
            Update the details of your 2FA account.
          </DialogDescription>
        </DialogHeader>
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
                {mutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
