import { Suspense } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ambilEkskul, ambilAnggota } from "@/data/ambil";
import { JAM_SESI } from "@/data/ekskul";

// Komponen Async untuk Menampilkan Daftar Anggota dengan Delay
async function BagianAnggota({ ekskulId }: { ekskulId: number }) {
  const cookieStore = await cookies();
  const namaUserCookie = cookieStore.get("nama")?.value || "";

  const daftarAnggota = await ambilAnggota(ekskulId);

  return (
    <div className="mt-8 bg-white/90 backdrop-blur-sm border border-pink-100 rounded-3xl p-6 shadow-md">
      <h3 className="text-xl font-bold text-pink-900 mb-4">
        👥 Daftar Anggota Terdaftar
      </h3>

      {daftarAnggota.length === 0 ? (
        <p className="text-gray-500 italic">Belum ada anggota.</p>
      ) : (
        <div className="space-y-3">
          {daftarAnggota.map((item) => {
            const isKamu =
              namaUserCookie &&
              item.nama.toLowerCase() === namaUserCookie.toLowerCase();

            return (
              <div
                key={item.nomor}
                className="flex items-center justify-between p-3 bg-pink-50/50 rounded-2xl border border-pink-100"
              >
                <div>
                  <span className="text-xs font-bold text-pink-500 mr-2">
                    #{item.nomor}
                  </span>
                  <span className="font-semibold text-gray-800">
                    {item.nama}
                  </span>
                  {isKamu && (
                    <span className="ml-2 bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      Kamu 🌸
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-xl shadow-xs">
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

// Komponen Utama Halaman Detail
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ekskul = await ambilEkskul(Number(id));

  if (!ekskul) {
    return { title: "Ekskul tidak ditemukan" };
  }

  return {
    title: ekskul.nama,
  };
}

export default async function PageDetailEkskul({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ekskulId = Number(id);

  if (isNaN(ekskulId)) {
    notFound();
  }

  const ekskul = await ambilEkskul(ekskulId);

  if (!ekskul) {
    notFound();
  }

  // Hitung jumlah anggota untuk kapasitas
  const anggotaAwal = await ambilAnggota(ekskulId);
  const totalAnggota = anggotaAwal.length;
  const sisaTempat = ekskul.kuota - totalAnggota;
  const isPenuh = sisaTempat <= 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Tombol Kembali */}
        <div className="mb-6">
          <Link
            href="/ekskul"
            className="inline-flex items-center text-sm font-semibold text-pink-600 hover:text-pink-800 bg-white px-4 py-2 rounded-xl shadow-sm border border-pink-100 transition-all"
          >
            &larr; Kembali ke Daftar Ekskul
          </Link>
        </div>

        {/* Kartu Informasi Utama Ekskul */}
        <div className="bg-white/90 backdrop-blur-sm border border-pink-100 rounded-3xl p-8 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold bg-pink-100 text-pink-700 px-3 py-1 rounded-full uppercase tracking-wider">
              {ekskul.kategori}
            </span>
            {isPenuh ? (
              <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                Penuh ❌
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                {totalAnggota} dari {ekskul.kuota} tempat terisi 🩷
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold text-pink-900 mb-4">
            {ekskul.nama}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
            <div>
              <p className="text-xs font-bold text-pink-700 uppercase">
                Jadwal Hari
              </p>
              <p className="font-semibold mt-0.5">📅 {ekskul.hari}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-pink-700 uppercase">
                Sesi & Jam
              </p>
              <p className="font-semibold mt-0.5">
                ⏰ Sesi {ekskul.sesi} ({JAM_SESI[ekskul.sesi] || "-"})
              </p>
            </div>
            <div className="sm:col-span-2 mt-2 pt-2 border-t border-pink-200/60">
              <p className="text-xs font-bold text-pink-700 uppercase">
                Pembina
              </p>
              <p className="font-semibold mt-0.5">👨‍🏫 {ekskul.pembina}</p>
            </div>
          </div>
        </div>

        {/* Bagian Anggota dengan Suspense (Loading State 1.5 detik) */}
        <Suspense
          fallback={
            <div className="mt-8 text-center py-12 bg-white/60 rounded-3xl border border-pink-100 shadow-sm">
              <p className="text-pink-500 font-medium animate-pulse">
                ✨ Memuat anggota...
              </p>
            </div>
          }
        >
          <BagianAnggota ekskulId={ekskul.id} />
        </Suspense>
      </div>
    </main>
  );
}
