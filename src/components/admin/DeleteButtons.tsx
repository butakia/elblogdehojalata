"use client";

import { useTransition } from "react";
import { deleteComment, deleteStory } from "@/app/admin/actions";

export function DeleteStoryButton({ slug, title }: { slug: string; title: string }) {
  const [pending, start] = useTransition();
  return (
    <button className="link-danger" disabled={pending} onClick={() => confirm(`¿Eliminar «${title}»? No se puede deshacer.`) && start(() => deleteStory(slug))}>
      Eliminar
    </button>
  );
}

export function DeleteCommentButton({ slug, id }: { slug: string; id: string }) {
  const [pending, start] = useTransition();
  return (
    <button className="link-danger" disabled={pending} onClick={() => confirm("¿Eliminar este comentario?") && start(() => deleteComment(slug, id))}>
      Eliminar
    </button>
  );
}
