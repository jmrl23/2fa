import { useState, useEffect } from 'react';
import { authenticator as otplib } from 'otplib';
import { Copy, Trash2, Edit2, Clock, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import api from '@/lib/api';
import { EditAuthenticatorDialog } from './edit-authenticator-dialog';
import { ShowQrDialog } from './show-qr-dialog';
import { DeleteAuthenticatorDialog } from './delete-authenticator-dialog';

interface Authenticator {
  id: string;
  name: string;
  description: string | null;
  tags: string[] | null;
  secret: string;
  createdAt: string;
}

export function AuthenticatorCard({ authenticator }: { authenticator: Authenticator }) {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const updateCode = () => {
      try {
        const token = otplib.generate(authenticator.secret);
        setCode(token);
        const remaining = otplib.timeRemaining();
        setTimeLeft(remaining);
      } catch (e) {
        console.error('Error generating token', e);
        setCode('ERROR');
      }
    };

    updateCode();
    const interval = setInterval(updateCode, 1000);
    return () => clearInterval(interval);
  }, [authenticator.secret]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/authenticators/${authenticator.id}`);
    },
    onSuccess: () => {
      toast.success('Authenticator deleted');
      queryClient.invalidateQueries({ queryKey: ['authenticators'] });
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete authenticator');
    },
  });

  return (
    <>
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
        {/* ... Card Header ... */}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
               {/* ... Title/Desc ... */}
               <CardTitle className="text-lg font-semibold truncate pr-4">
                {authenticator.name}
              </CardTitle>
              <CardDescription className="truncate max-w-[200px]">
                {authenticator.description || 'No description'}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="sr-only">Open menu</span>
                  <Edit2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsQrDialogOpen(true)}>
                  <QrCode className="mr-2 h-4 w-4" />
                  Show QR Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        {/* ... Card Content ... */}
        <CardContent>
          <div className="flex items-center justify-between mt-2">
            <div className="text-4xl font-mono font-bold tracking-wider text-primary tabular-nums">
              {code.match(/.{1,3}/g)?.join(' ') || '--- ---'}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="h-10 w-10 shrink-0 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Expires in {timeLeft}s</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden ml-2">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
        {/* ... Card Footer ... */}
        <CardFooter className="pt-2 flex flex-wrap gap-2">
          {authenticator.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </CardFooter>
      </Card>

      <EditAuthenticatorDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        authenticator={authenticator}
      />

      <ShowQrDialog
        open={isQrDialogOpen}
        onOpenChange={setIsQrDialogOpen}
        name={authenticator.name}
        secret={authenticator.secret}
      />

      <DeleteAuthenticatorDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => deleteMutation.mutate()}
        isDeleting={deleteMutation.isPending}
        authenticatorName={authenticator.name}
      />
    </>
  );
}
