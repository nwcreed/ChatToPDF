import FileManagerDialog from '@/components/file-management/file-manager';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';

function Page() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header avec bouton retour */}
      <div className="mb-6">
        <Link href="/">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </Link>
      </div>

      <FileManagerDialog />
    </div>
  );
}

export default Page;