"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface IndexButtonProps {
  formId: string;
}

export default function IndexButton({ formId }: IndexButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      const form = document.getElementById(formId) as HTMLFormElement;
      if (!form) return;

      const formData = new FormData(form);
      const selectedIds = formData.getAll("selectedFiles") as string[];

      if (selectedIds.length === 0) {
        alert("Aucun fichier sélectionné");
        return;
      }

      try {
        const res = await fetch("/api/create-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileIds: selectedIds }),
        });

        const data = await res.json();

        if (data?.chatId) {
          // Redirection vers /chat/[chatId]
          router.push(`/chat/${data.chatId}`);
        } else {
          alert("Erreur : chatId non reçu");
        }
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la création du chat");
      }
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      className="mt-4 self-end"
    >
      {isPending ? "Indexation..." : "Indexer les fichiers sélectionnés"}
    </Button>
  );
}
