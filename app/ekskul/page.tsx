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
    <main
      style={{
        padding: "2rem",
        fontFamily: "sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1>Daftar Ekstrakurikuler</h1>

      <form
        method="GET"
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.9rem",
              marginBottom: "0.3rem",
            }}
          >
            Kategori:
          </label>
          <select
            name="kategori"
            defaultValue={selectedKategori}
            style={{ padding: "0.5rem" }}
          >
            <option value="">Semua Kategori</option>
            {DAFTAR_KATEGORI.map((kat) => (
              <option key={kat} value={kat}>
                {kat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.9rem",
              marginBottom: "0.3rem",
            }}
          >
            Hari:
          </label>
          <select
            name="hari"
            defaultValue={selectedHari}
            style={{ padding: "0.5rem" }}
          >
            <option value="">Semua Hari</option>
            {DAFTAR_HARI.map((hari) => (
              <option key={hari} value={hari}>
                {hari}
              </option>
            ))}
          </select>
        </div>

        <div style={{ alignSelf: "flex-end" }}>
          <button
            type="submit"
            style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
          >
            Saring
          </button>
        </div>
      </form>

      <p style={{ fontStyle: "italic", marginBottom: "1rem" }}>
        {ekskulTerfilter.length} ekskul ditemukan.
      </p>

      {ekskulTerfilter.length === 0 ? (
        <p style={{ color: "gray", padding: "1rem 0" }}>
          Tidak ada ekskul yang cocok.
        </p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {ekskulTerfilter.map((item) => {
            const jumlahPendaftar = pendaftar.filter(
              (p) => p.ekskulId === item.id,
            ).length;
            const sisaTempat = item.kuota - jumlahPendaftar;
            const isPenuh = sisaTempat <= 0;

            return (
              <div
                key={item.id}
                style={{
                  border: "1px solid #ccc",
                  padding: "1rem",
                  borderRadius: "8px",
                  background: "#f9f9f9",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    background: "#e2e2e2",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                  }}
                >
                  {item.kategori}
                </span>
                <h3 style={{ margin: "0.5rem 0" }}>{item.nama}</h3>
                <p style={{ margin: "0.2rem 0", fontSize: "0.9rem" }}>
                  📅 Hari: {item.hari} | Sesi {item.sesi} (
                  {JAM_SESI[item.sesi] || "-"})
                </p>
                <p style={{ margin: "0.2rem 0", fontSize: "0.9rem" }}>
                  👨‍🏫 Pembina: {item.pembina}
                </p>
                <p style={{ margin: "0.5rem 0", fontWeight: "bold" }}>
                  {isPenuh ? (
                    <span style={{ color: "red" }}>Penuh</span>
                  ) : (
                    <span>
                      Sisa {sisaTempat} dari {item.kuota} tempat
                    </span>
                  )}
                </p>

                <Link
                  href={`/ekskul/${item.id}`}
                  style={{
                    display: "inline-block",
                    marginTop: "0.5rem",
                    color: "blue",
                    textDecoration: "underline",
                  }}
                >
                  Lihat Detail &rarr;
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
