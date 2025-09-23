'use client';

import { useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface DeleteFileButtonProps {
  fileId: string;
}

export default function DeleteFileButton({ fileId }: DeleteFileButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {

    try {
      setIsLoading(true);
      const res = await fetch(`/api/files/delete/${fileId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete file');

      toast.success('File deleted successfully');

      // Rafraîchir la table
      startTransition(() => router.refresh());
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm deletion</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The file will be permanently removed.
          </DialogDescription>
          <div className="mt-4 flex justify-end space-x-2">
            <Button
              disabled={isLoading}
              variant="destructive"
              onClick={handleDelete}
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : 'Delete'}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
