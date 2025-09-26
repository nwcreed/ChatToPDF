"use client";

import Chatbot from "@/components/chatbot";
import PDFViewerComponent from "@/components/pdf-viewer"; // ton composant PDFViewerPage renommé
import { useParams } from "next/navigation";

export default function ChatWithPDFPage() {
   const { chatId } = useParams<{ chatId: string }>();
  return (
    <div className="w-full h-screen flex">
      {/* Chatbot - moitié gauche */}
      <div className="w-1/2 border-r border-gray-100 overflow-hidden">
        <Chatbot chatId={chatId} />
      </div>

      {/* PDF Viewer - moitié droite */}
      <div className="w-1/2 overflow-hidden">
        <PDFViewerComponent />
      </div>
    </div>
  );
}
