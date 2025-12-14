'use client';

import { useIsMounted } from '@/hooks/use-is-mounted';
import { useQuery } from '@tanstack/react-query';
import { LogOut, Plus, Shield } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AddAuthenticatorDialog } from '@/components/add-authenticator-dialog';
import { AuthenticatorCard } from '@/components/authenticator-card';
import { ChangePasswordDialog } from '@/components/change-password-dialog';
import { ImportExportMenu } from '@/components/import-export-menu';
import { ModeToggle } from '@/components/mode-toggle';
import { useAuth } from '@/components/providers/auth-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import api from '@/lib/api';
import { KeyRoundIcon, UserIcon } from 'lucide-react';

interface Authenticator {
  id: string;
  name: string;
  description: string | null;
  tags: string[] | null;
  secret: string;
  createdAt: string;
}

export default function Dashboard() {
  const { logout } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false);
  const isMounted = useIsMounted();

  const {
    data: authenticators,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['authenticators'],
    queryFn: async () => {
      const response = await api.get<{ data: Authenticator[] }>(
        '/authenticators',
      );
      return response.data.data;
    },
  });

  if (!isMounted) {
    return (
      <div className='min-h-screen bg-background text-foreground'>
        <header className='border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50'>
          <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='bg-primary/20 p-2 rounded-lg'>
                <Shield className='w-6 h-6 text-primary' />
              </div>
              <h1 className='text-xl font-bold bg-linear-to-r from-primary to-purple-400 bg-clip-text text-transparent'>
                2FA Authenticator
              </h1>
            </div>
            <div className='flex items-center gap-2'>
              <ImportExportMenu />
              <ModeToggle />
              <Button
                variant='ghost'
                size='sm'
                onClick={logout}
                className='text-muted-foreground hover:text-destructive transition-colors'
              >
                <LogOut className='w-4 h-4 mr-2' />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className='container mx-auto px-4 py-8'>
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h2 className='text-3xl font-bold tracking-tight'>Your Codes</h2>
              <p className='text-muted-foreground mt-1'>
                Manage your two-factor authentication codes securely.
              </p>
            </div>
            <Button disabled className='shadow-lg shadow-primary/20'>
              <Plus className='w-4 h-4 mr-2' />
              Add Account
            </Button>
          </div>

          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {[1, 2, 3].map((i) => (
              <Card key={i} className='h-48 animate-pulse bg-muted/50' />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <header className='border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50'>
        <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='bg-primary/20 p-2 rounded-lg'>
              <Shield className='w-6 h-6 text-primary' />
            </div>
            <h1 className='text-xl font-bold bg-linear-to-r from-primary to-purple-400 bg-clip-text text-transparent'>
              2FA Authenticator
            </h1>
          </div>
          <div className='flex items-center gap-2'>
            <ImportExportMenu />
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon'>
                  <UserIcon className='h-[1.2rem] w-[1.2rem]' />
                  <span className='sr-only'>User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  onClick={() => setIsChangePasswordDialogOpen(true)}
                >
                  <KeyRoundIcon className='mr-2 h-4 w-4' />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className='text-destructive focus:text-destructive'
                >
                  <LogOut className='mr-2 h-4 w-4' />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className='container mx-auto px-4 py-8'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>Your Codes</h2>
            <p className='text-muted-foreground mt-1'>
              Manage your two-factor authentication codes securely.
            </p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className='shadow-lg shadow-primary/20'
          >
            <Plus className='w-4 h-4 mr-2' />
            Add Account
          </Button>
        </div>

        {isLoading ? (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {[1, 2, 3].map((i) => (
              <Card key={i} className='h-48 animate-pulse bg-muted/50' />
            ))}
          </div>
        ) : isError ? (
          <div className='text-center py-12 text-destructive'>
            Failed to load authenticators. Please try again.
          </div>
        ) : (authenticators?.length ?? 0) <= 0 ? (
          <div className='text-center py-20 border border-dashed border-border rounded-xl bg-card/30'>
            <Shield className='w-12 h-12 mx-auto text-muted-foreground mb-4' />
            <h3 className='text-lg font-medium'>No accounts yet</h3>
            <p className='text-muted-foreground mb-6'>
              Add your first two-factor authentication account to get started.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className='w-4 h-4 mr-2' />
              Add Account
            </Button>
          </div>
        ) : (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {authenticators?.map((auth) => (
              <AuthenticatorCard key={auth.id} authenticator={auth} />
            ))}
          </div>
        )}
      </main>

      <AddAuthenticatorDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
      <ChangePasswordDialog
        open={isChangePasswordDialogOpen}
        onOpenChange={setIsChangePasswordDialogOpen}
      />
    </div>
  );
}
