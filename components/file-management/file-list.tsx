import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import DeleteFileButton from "../delete-user-button";

export default async function FilesTable() {
  const files = await prisma.file.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <Table>
      <TableCaption>Liste de fichiers</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px]">Sélectionner</TableHead>
          <TableHead className="w-[200px]">Nom</TableHead>
          <TableHead>Crée</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => (
          <TableRow key={file.id}>
            <TableCell>
              <input type="checkbox" name="selectedFiles" value={file.id} />
            </TableCell>
            <TableCell className="font-medium truncate max-w-0">
              {file.originalName}
            </TableCell>
            <TableCell className="whitespace-nowrap">
              {file.createdAt.toLocaleString()}
            </TableCell>
            <TableCell className="text-right whitespace-nowrap space-x-2">
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  Voir
                </Button>
              </a>
              <DeleteFileButton fileId={file.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
