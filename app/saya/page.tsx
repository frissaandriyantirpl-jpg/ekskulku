
import Link from "next/link";
import { cookies } from "next/headers";
import { ekskul, pendaftar, JAM_SESI } from "@/data/ekskul";
import TombolBatalkan from "./tombol-batalkan";

export default async function HalamanEkskulSaya({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const cookieStore = await cookies();

  const nama = cookieStore.get("nama")?.value || "";
  const kelas = cookieStore.get("kelas")?.value || "";

  const sudahLogin = Boolean(nama && kelas);

  const daftarSaya = sudahLogin
    ? pendaftar
        .filter(
          (p) =>
            p.nama.toLowerCase() === nama.toLowerCase() &&
            p.kelas.toLowerCase() === kelas.toLowerCase()
        )
        .sort((a, b) => a.nomor - b.nomor)
    : [];

  const pesanStatus: Record<string, string> = {
    berhasil: "Pendaftaran berhasil dibatalkan.",
    gagal: "Pembatalan gagal. Silakan coba lagi.",
    identitas: "Identitas pendaftar tidak ditemukan.",
    ditolak: "Kamu tidak memiliki izin membatalkan pendaftaran ini.",
    "tidak-ditemukan": "Pendaftaran tidak ditemukan.",
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100/50 px-4 py-12">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-10">
          <span className="inline-block bg-pink-200 text-pink-800 text-xs font-bold px-4 py-2 rounded-full mb-4">
            🎀 EKSKULKU
          </span>

          <h1 className="text-3xl sm:text-4xl font-black text-[#701a35]">
            Ekskul Saya
          </h1>

          <p className="text-pink-600 mt-2">
            Daftar ekstrakurikuler yang sedang kamu ikuti.
          </p>
        </div>

        {status && pesanStatus[status] && (
          <div className="mb-6 p-4 rounded-2xl bg-pink-100 border border-pink-200 text-pink-800 font-semibold text-sm">
            {pesanStatus[status]}
          </div>
        )}

        {!sudahLogin ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-pink-100 shadow-lg">
            <div className="text-5xl mb-4">🌸</div>

            <h2 className="text-xl font-extrabold text-[#701a35] mb-2">
              Kamu belum mendaftar apa pun.
            </h2>

            <p className="text-gray-500 text-sm mb-6">
              Yuk, pilih ekstrakurikuler yang kamu sukai!
            </p>

            <Link
              href="/ekskul"
              className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold px-6 py-3 rounded-2xl"
            >
              Lihat Daftar Ekskul →
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-lg mb-8">
              <h2 className="text-lg font-extrabold text-[#701a35] mb-5">
                👤 Ringkasan Pendaftaran
              </h2>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-pink-50 p-4 rounded-2xl">
                  <p className="text-xs text-pink-600 font-bold mb-1">NAMA</p>
                  <p className="font-extrabold text-gray-800">{nama}</p>
                </div>

                <div className="bg-pink-50 p-4 rounded-2xl">
                  <p className="text-xs text-pink-600 font-bold mb-1">KELAS</p>
                  <p className="font-extrabold text-gray-800">{kelas}</p>
                </div>

                <div className="bg-pink-50 p-4 rounded-2xl">
                  <p className="text-xs text-pink-600 font-bold mb-1">
                    EKSKUL DIIKUTI
                  </p>
                  <p className="font-extrabold text-gray-800">
                    {daftarSaya.length} ekskul
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-lg">
              <h2 className="text-xl font-extrabold text-[#701a35] mb-6">
                📚 Daftar Ekskul Saya
              </h2>

              {daftarSaya.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-3">🌷</p>
                  <p className="font-bold text-[#701a35]">
                    Belum ada ekskul yang diikuti.
                  </p>
                  <Link
                    href="/ekskul"
                    className="inline-block mt-4 text-pink-600 font-bold hover:underline"
                  >
                    Daftar ekskul sekarang →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {daftarSaya.map((item) => {
                    const detail = ekskul.find(
                      (e) => e.id === item.ekskulId
                    );

                    if (!detail) return null;

                    return (
                      <div
                        key={item.nomor}
                        className="border border-pink-100 bg-pink-50/50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div>
                          <span className="text-xs font-bold text-pink-600">
                            PENDAFTARAN #{item.nomor}
                          </span>

                          <h3 className="text-lg font-extrabold text-[#701a35] mt-1">
                            {detail.nama}
                          </h3>

                          <p className="text-sm text-gray-600 mt-2">
                            📅 {detail.hari} · Sesi {detail.sesi}
                          </p>

                          <p className="text-sm text-gray-600">
                            ⏰ {JAM_SESI[detail.sesi]}
                          </p>

                          <p className="text-sm text-gray-600">
                            👨‍🏫 {detail.pembina}
                          </p>
                        </div>

                        <div className="flex flex-col sm:items-end gap-3">
                          <span className="bg-pink-200 text-pink-800 text-xs font-bold px-3 py-1.5 rounded-full">
                            {detail.kategori}
                          </span>

                          <TombolBatalkan nomor={item.nomor} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        <div className="text-center mt-8">
          <Link
            href="/ekskul"
            className="text-pink-700 font-bold hover:underline"
          >
            ← Kembali ke Daftar Ekskul
          </Link>
        </div>

      </div>
    </main>
  );
}
