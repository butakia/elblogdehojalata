import type { Metadata } from "next";
import PreviewFrame from "@/components/admin/PreviewFrame";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Vista previa", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Página que se carga dentro del marco de celular del editor y muestra el texto en pantalla pequeña. */
export default async function VistaPrevia() {
  await requireAdmin();
  return <PreviewFrame />;
}
