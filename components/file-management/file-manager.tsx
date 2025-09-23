import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FilesTable from "./file-list";
import FileUpload from "./file-upload";
import IndexButton from "./create-chat-button";
import { Button } from "../ui/button";

export default function FileManagerPage() {
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mes Fichiers</h1>
        <p className="text-gray-600">Gérez et téléchargez vos documents</p>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg">ouvrir le gestionnaire de fichiers</Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="mb-6 text-center">
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
              Gestionnaire de fichiers
            </DialogTitle>
            <p className="text-gray-600">Gérez et téléchargez vos documents</p>
          </DialogHeader>

          <div className="mb-6 flex justify-center">
            <FileUpload />
          </div>

          <form id="fileManagerForm" className="flex flex-col">
            <FilesTable />
            <IndexButton formId="fileManagerForm" />
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
