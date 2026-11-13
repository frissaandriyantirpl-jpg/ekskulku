import Link from "next/link";
import { ambilSemuaEkskul } from "@/data/ambil";
import {
  pendaftar,
  DAFTAR_KATEGORI,
  DAFTAR_HARI,
  JAM_SESI,
} from "@/data/ekskul";

export const metadata = {
  title: "Daftar Ekskul",
};

export default async function PageDaftarEkskul({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; hari?: string }>;
}) {
  const params = await searchParams;
  const selectedKategori = params.kategori || "";
  const selectedHari = params.hari || "";

  const semuaEkskul = await ambilSemuaEkskul();

  const ekskulTerfilter = semuaEkskul.filter((e) => {
    const matchKategori = selectedKategori
      ? e.kategori === selectedKategori
      : true;
    const matchHari = selectedHari ? e.hari === selectedHari : true;
    return matchKategori && matchHari;
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Judul yang Cantik */}
        <div className="text-center mb-8">
          <span className="bg-pink-200 text-pink-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            🎀 EkskulKu Aktivitas Sekolah
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-pink-900 mt-2">
            Daftar Ekstrakurikuler
          </h1>
          <p className="text-pink-600 mt-1 text-sm sm:text-base">
            Temukan dan pilih kegiatan ekstrakurikuler favoritmu di sini! ✨
          </p>
        </div>

        {/* Form Filter / Saringan */}
        <form
          method="GET"
          className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-pink-100 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between"
        >
          <div className="w-full sm:w-auto flex-1">
            <label className="block text-xs font-bold text-pink-700 uppercase mb-1">
              Kategori
            </label>
            <select
              name="kategori"
              defaultValue={selectedKategori}
              className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="">Semua Kategori</option>
              {DAFTAR_KATEGORI.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-auto flex-1">
            <label className="block text-xs font-bold text-pink-700 uppercase mb-1">
              Hari
            </label>
            <select
              name="hari"
              defaultValue={selectedHari}
              className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="">Semua Hari</option>
              {DAFTAR_HARI.map((hari) => (
                <option key={hari} value={hari}>
                  {hari}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-auto self-end">
            <button
              type="submit"
              className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white font-medium px-6 py-2.5 rounded-xl shadow-md transition-all duration-200 hover:shadow-pink-200"
            >
              Cari & Saring 🔍
            </button>
          </div>
        </form>

        {/* Info Jumlah Ditemukan */}
        <div className="mb-4 px-2">
          <p className="text-sm font-medium text-pink-800 italic">
            🌸 Ditemukan{" "}
            <span className="font-bold text-pink-900">
              {ekskulTerfilter.length}
            </span>{" "}
            ekstrakurikuler
          </p>
        </div>

        {/* Daftar Kartu Ekskul */}
        {ekskulTerfilter.length === 0 ? (
          <div className="text-center py-16 bg-white/60 rounded-3xl border border-pink-100 shadow-sm">
            <p className="text-pink-400 text-lg">
              🥺 Tidak ada ekskul yang cocok.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ekskulTerfilter.map((item) => {
              const jumlahPendaftar = pendaftar.filter(
                (p) => p.ekskulId === item.id,
              ).length;
              const sisaTempat = item.kuota - jumlahPendaftar;
              const isPenuh = sisaTempat <= 0;

              return (
                <div
                  key={item.id}
                  className="bg-white/90 backdrop-blur-sm border border-pink-100 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold bg-pink-100 text-pink-700 px-3 py-1 rounded-full">
                        {item.kategori}
                      </span>
                      {isPenuh ? (
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                          Penuh ❌
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                          Sisa {sisaTempat} dari {item.kuota} 🩷
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-pink-600 transition-colors">
                      {item.nama}
                    </h3>

                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <p>
                        📅 <span className="font-medium">{item.hari}</span> •
                        Sesi {item.sesi} ({JAM_SESI[item.sesi] || "-"})
                      </p>
                      <p>
                        👨‍🏫 Pembina:{" "}
                        <span className="font-medium text-gray-700">
                          {item.pembina}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-pink-50 flex items-center justify-between">
                    <span className="text-xs font-medium text-pink-400">
                      EkskulKu ✨
                    </span>
                    <Link
                      href={`/ekskul/${item.id}`}
                      className="inline-flex items-center gap-1 bg-pink-50 hover:bg-pink-500 text-pink-600 hover:text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
                    >
                      Lihat Detail &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
