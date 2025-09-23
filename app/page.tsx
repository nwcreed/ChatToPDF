import { prisma } from "@/lib/prisma";
import { MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ChatsTable() {
  const chats = await prisma.chat.findMany({
    orderBy: { createdAt: "desc" },
    include: { files: true },
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header avec bouton create */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Conversations</h1>
          <p className="text-gray-500 text-sm">
            {chats.length} conversation{chats.length !== 1 ? "s" : ""}
          </p>
        </div>
        
        <Link href="/create-chat">
          <Button 
            variant="default"
            size="sm"
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle conversation
          </Button>
        </Link>
      </div>

      {/* Liste des chats */}
      <div className="space-y-1">
        {chats.map((chat) => (
          <Link
            key={chat.id}
            href={`/chat/${chat.id}`}
            className="block group border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150"
          >
            {/* En-tête du chat */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-3 h-3 text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900">Chat {chat.id}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(chat.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* État vide global */}
      {chats.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 text-gray-300" />
          <p className="text-sm mb-4">Aucune conversation pour le moment</p>
          <Link href="/create-chat">
            <Button 
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer votre première conversation
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}