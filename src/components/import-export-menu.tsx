'use client';

import { useRef } from 'react';
import { Download, Upload, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient, useMutation } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import api from '@/lib/api';

interface Authenticator {
  name: string;
  secret: string;
  description?: string | null;
  tags?: string[] | null;
}

export function ImportExportMenu() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      // Fetch all authenticators (limit 100 should be enough for now, or we can paginate if needed)
      const response = await api.get('/authenticators?take=100');
      const data = response.data.data;

      if (!data || !Array.isArray(data) || data.length === 0) {
        toast.error('No authenticators found');
        return;
      }

      // Clean data for export (remove IDs, timestamps)
      const exportData = data.map((auth: Authenticator) => ({
        name: auth.name,
        secret: auth.secret,
        description: auth.description,
        tags: auth.tags,
      }));

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `2fa-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Exported successfully');
    } catch (error) {
      console.error('Export failed', error);
      toast.error('Failed to export data');
    }
  };

  const importMutation = useMutation({
    mutationFn: async (authenticators: Authenticator[]) => {
      let successCount = 0;
      let failCount = 0;

      for (const auth of authenticators) {
        try {
           // Basic validation
           if (!auth.name || !auth.secret) {
             failCount++;
             continue;
           }
           
           await api.post('/authenticators', {
             name: auth.name,
             secret: auth.secret,
             description: auth.description,
             tags: auth.tags,
           });
           successCount++;
        } catch (e: unknown) {
          console.error(`Failed to import ${auth.name}`, e);
          failCount++;
        }
      }
      return { successCount, failCount };
    },
    onSuccess: ({ successCount, failCount }) => {
      queryClient.invalidateQueries({ queryKey: ['authenticators'] });
      toast.success(`Imported ${successCount} accounts. ${failCount > 0 ? `${failCount} failed.` : ''}`);
    },
    onError: () => {
      toast.error('Failed to import data');
    }
  });

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (!Array.isArray(data)) {
          toast.error('Invalid file format. Expected an array of accounts.');
          return;
        }

        importMutation.mutate(data);
      } catch {
        toast.error('Failed to parse JSON file');
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <FileJson className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Import/Export</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Import JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleImportFile}
      />
    </>
  );
}
