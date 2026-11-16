
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  pendaftar,
  hapusPendaftar,
} from "@/data/ekskul";

export async function batalkanPendaftaranAction(
  formData: FormData
): Promise<void> {
  const nomor = Number(formData.get("nomor"));

  if (!Number.isInteger(nomor) || nomor <= 0) {
    redirect("/saya?status=gagal");
  }

  const cookieStore = await cookies();
  const nama = cookieStore.get("nama")?.value || "";
  const kelas = cookieStore.get("kelas")?.value || "";

  if (!nama || !kelas) {
    redirect("/saya?status=identitas");
  }

  const target = pendaftar.find((p) => p.nomor === nomor);

  if (!target) {
    redirect("/saya?status=tidak-ditemukan");
  }

  const pemilikCocok =
    target.nama.toLowerCase() === nama.toLowerCase() &&
    target.kelas.toLowerCase() === kelas.toLowerCase();

  if (!pemilikCocok) {
    redirect("/saya?status=ditolak");
  }

  const dataTerhapus = hapusPendaftar(nomor);

  if (!dataTerhapus) {
    redirect("/saya?status=gagal");
  }

  revalidatePath("/saya");
  revalidatePath("/ekskul");
  revalidatePath(`/ekskul/${dataTerhapus.ekskulId}`);

  redirect("/saya?status=berhasil");
}
