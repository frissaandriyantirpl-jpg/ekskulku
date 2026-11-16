import { Suspense } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { ambilEkskul, ambilAnggota } from "@/data/ambil";
import { ekskul, pendaftar, JAM_SESI } from "@/data/ekskul";
import FormPendaftaranClient from "./form-pendaftaran";

// Server Action murni untuk pendaftaran
async function daftarEkskulAction(formData: FormData) {
  "use server";

  const ekskulIdStr = formData.get("ekskulId") as string;
  const nama = (formData.get("nama") as string)?.trim() || "";
  const kelas = (formData.get("kelas") as string)?.trim() || "";

  const ekskulId = Number(ekskulIdStr);
  const targetEkskul = ekskul.find((e) => e.id === ekskulId);

  if (!targetEkskul) {
    return { success: false, message: "Ekskul tidak ditemukan." };
  }

  const errors: { nama?: string; kelas?: string; umum?: string } = {};
  if (nama.length < 3) errors.nama = "Nama minimal 3 huruf.";
  if (kelas.length < 3) errors.kelas = "Kelas minimal 3 karakter.";

  if (errors.nama || errors.kelas) {
    return { success: false, errors, input: { nama, kelas } };
  }

  const anggotaEkskul = pendaftar.filter((p) => p.ekskulId === ekskulId);
  const sudahTerdaftar = anggotaEkskul.some(
    (p) =>
      p.nama.toLowerCase() === nama.toLowerCase() &&
      p.kelas.toLowerCase() === kelas.toLowerCase(),
  );

  if (sudahTerdaftar) {
    return {
      success: false,
      errors: {
        umum: `Nama dan kelas yang sama sudah terdaftar di ekskul ${targetEkskul.nama}.`,
      },
      input: { nama, kelas },
    };
  }

  if (anggotaEkskul.length >= targetEkskul.kuota) {
    return {
      success: false,
      errors: {
        umum: `Kuota ${targetEkskul.nama} sudah penuh (${targetEkskul.kuota} orang).`,
      },
      input: { nama, kelas },
    };
  }

  // Cek bentrok jadwal
  const ekskulDiikutiMurid = pendaftar.filter(
    (p) =>
      p.nama.toLowerCase() === nama.toLowerCase() &&
      p.kelas.toLowerCase() === kelas.toLowerCase(),
  );

  for (const p of ekskulDiikutiMurid) {
    const eLain = ekskul.find((item) => item.id === p.ekskulId);
    if (
      eLain &&
      eLain.hari === targetEkskul.hari &&
      eLain.sesi === targetEkskul.sesi
    ) {
      return {
        success: false,
        errors: {
          umum: `Jadwal bentrok dengan ${eLain.nama} (${eLain.hari}, sesi ${eLain.sesi}).`,
        },
        input: { nama, kelas },
      };
    }
  }

  const nomorBaru =
    pendaftar.length > 0 ? Math.max(...pendaftar.map((p) => p.nomor)) + 1 : 1;
  pendaftar.push({ nomor: nomorBaru, ekskulId, nama, kelas });

  const cookieStore = await cookies();
  cookieStore.set("nama", nama);
  cookieStore.set("kelas", kelas);

  revalidatePath(`/ekskul/${ekskulId}`);
  revalidatePath("/ekskul");

  return {
    success: true,
    message: `Pendaftaran #${nomorBaru} berhasil: ${targetEkskul.nama}, ${targetEkskul.hari}, sesi ${targetEkskul.sesi} (${JAM_SESI[targetEkskul.sesi]}).`,
    input: { nama, kelas },
  };
}

// Komponen Anggota dengan Suspense & Delay 1.5 detik
async function BagianAnggota({ ekskulId }: { ekskulId: number }) {
  const cookieStore = await cookies();
  const namaUserCookie = cookieStore.get("nama")?.value || "";

  await new Promise((r) => setTimeout(r, 1500));
  const daftarAnggota = await ambilAnggota(ekskulId);

  return (
    <div className="mt-8 bg-white/90 backdrop-blur-sm border border-pink-100 rounded-3xl p-6 sm:p-8 shadow-lg shadow-pink-100/50">
      <h3 className="text-xl font-extrabold text-[#701a35] mb-6 flex items-center gap-2">
        <span>👥</span> Daftar Anggota Terdaftar
      </h3>

      {daftarAnggota.length === 0 ? (
        <p className="text-pink-400 italic text-sm">Belum ada anggota.</p>
      ) : (
        <div className="space-y-3">
          {daftarAnggota.map((item) => {
            const isKamu =
              namaUserCookie &&
              item.nama.toLowerCase() === namaUserCookie.toLowerCase();

            return (
              <div
                key={item.nomor}
                className="flex items-center justify-between p-4 bg-pink-50/40 rounded-2xl border border-pink-100 transition-all hover:bg-pink-50/80"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold bg-pink-200 text-[#701a35] px-2.5 py-1 rounded-full">
                    #{item.nomor}
                  </span>
                  <span className="font-bold text-gray-800">{item.nama}</span>
                  {isKamu && (
                    <span className="bg-[#ec4899] text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                      Kamu 🌸
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-pink-700 bg-white px-3 py-1.5 rounded-xl shadow-xs border border-pink-100">
                  {item.kelas}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const itemEkskul = await ambilEkskul(Number(id));
  if (!itemEkskul) return { title: "Ekskul tidak ditemukan" };
  return { title: itemEkskul.nama };
}

export default async function PageDetailEkskul({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ekskulId = Number(id);

  if (isNaN(ekskulId)) notFound();

  const itemEkskul = await ambilEkskul(ekskulId);
  if (!itemEkskul) notFound();

  const cookieStore = await cookies();
  const defaultNama = cookieStore.get("nama")?.value || "";
  const defaultKelas = cookieStore.get("kelas")?.value || "";

  const anggotaAwal = await ambilAnggota(ekskulId);
  const totalAnggota = anggotaAwal.length;
  const sisaTempat = itemEkskul.kuota - totalAnggota;
  const isPenuh = sisaTempat <= 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50/60 via-white to-pink-100/40 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Tombol Kembali */}
        <div className="mb-6">
          <Link
            href="/ekskul"
            className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#701a35] bg-white hover:bg-pink-50 px-4 py-2.5 rounded-2xl shadow-sm border border-pink-200 transition-all"
          >
            &larr; Kembali ke Daftar Ekskul
          </Link>
        </div>

        {/* Header Gaya Estetik seperti Referensi */}
        <div className="text-center mb-8">
          <span className="inline-block bg-pink-200/80 text-[#701a35] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-xs mb-3">
            🎀 EKSKULKU AKTIVITAS SEKOLAH
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#701a35] tracking-tight">
            {itemEkskul.nama}
          </h1>
          <p className="text-pink-600 mt-1.5 text-sm font-medium">
            Detail informasi lengkap dan formulir pendaftaran kegiatan ✨
          </p>
        </div>

        {/* Kartu Informasi Detail Ekskul */}
        <div className="bg-white/90 backdrop-blur-sm border border-pink-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-pink-100/50 mb-6">
          <div className="flex justify-between items-start mb-5">
            <span className="text-xs font-bold bg-pink-100 text-[#701a35] px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              {itemEkskul.kategori}
            </span>
            {isPenuh ? (
              <span className="bg-red-100 text-red-600 text-xs font-bold px-3.5 py-1.5 rounded-full animate-pulse shadow-xs">
                Penuh ❌
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs">
                Sisa {sisaTempat} dari {itemEkskul.kuota} tempat terisi 🩷
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 bg-pink-50/40 p-5 rounded-2xl border border-pink-100/80">
            <div>
              <p className="text-xs font-bold text-pink-700 uppercase tracking-wider">
                Jadwal Hari
              </p>
              <p className="font-bold text-gray-800 mt-1">
                📅 {itemEkskul.hari}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-pink-700 uppercase tracking-wider">
                Sesi & Jam
              </p>
              <p className="font-bold text-gray-800 mt-1">
                ⏰ Sesi {itemEkskul.sesi} ({JAM_SESI[itemEkskul.sesi] || "-"})
              </p>
            </div>
            <div className="sm:col-span-2 pt-3 border-t border-pink-200/50">
              <p className="text-xs font-bold text-pink-700 uppercase tracking-wider">
                Pembina
              </p>
              <p className="font-bold text-gray-800 mt-1">
                👨‍🏫 {itemEkskul.pembina}
              </p>
            </div>
          </div>

          {/* Bagian Formulir Pendaftaran */}
          <div className="mt-8 pt-6 border-t border-pink-100">
            <h3 className="text-lg font-extrabold text-[#701a35] mb-4 flex items-center gap-2">
              <span>📝</span> Formulir Pendaftaran Ekskul
            </h3>
            <FormPendaftaranClient
              ekskulId={itemEkskul.id}
              action={daftarEkskulAction}
              defaultNama={defaultNama}
              defaultKelas={defaultKelas}
            />
          </div>
        </div>

        {/* Suspense Anggota */}
        <Suspense
          fallback={
            <div className="mt-8 text-center py-12 bg-white/60 rounded-3xl border border-pink-100 shadow-sm">
              <p className="text-pink-500 font-bold animate-pulse text-sm">
                ✨ Memuat anggota...
              </p>
            </div>
          }
        >
          <BagianAnggota ekskulId={itemEkskul.id} />
        </Suspense>
      </div>
    </main>
  );
}
