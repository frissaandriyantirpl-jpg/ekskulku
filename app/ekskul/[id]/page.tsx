"use client";

import { Suspense, useState, useTransition } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ambilEkskul, ambilAnggota } from "@/data/ambil";
import { ekskul, pendaftar, JAM_SESI } from "@/data/ekskul";

// Komponen Formulir Interaktif di dalam satu file
function FormPendaftaranClient({
  ekskulId,
  action,
  defaultNama,
  defaultKelas,
}: {
  ekskulId: number;
  action: (formData: FormData) => Promise<any>;
  defaultNama: string;
  defaultKelas: string;
}) {
  const [state, setState] = useState<any>(null);
  const [nama, setNama] = useState(defaultNama);
  const [kelas, setKelas] = useState(defaultKelas);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await action(formData);
      setState(result);
      if (result?.input) {
        setNama(result.input.nama);
        setKelas(result.input.kelas);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="ekskulId" value={ekskulId} />

      {state?.message && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-medium">
          ✅ {state.message}
        </div>
      )}

      {state?.errors?.umum && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm font-medium">
          ❌ {state.errors.umum}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-pink-700 uppercase mb-1">
          Nama Lengkap
        </label>
        <input
          type="text"
          name="nama"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Contoh: Budi Santoso"
          className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        {state?.errors?.nama && (
          <p className="text-red-500 text-xs mt-1 font-medium">
            {state.errors.nama}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-pink-700 uppercase mb-1">
          Kelas
        </label>
        <input
          type="text"
          name="kelas"
          value={kelas}
          onChange={(e) => setKelas(e.target.value)}
          placeholder="Contoh: XI RPL 1"
          className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        {state?.errors?.kelas && (
          <p className="text-red-500 text-xs mt-1 font-medium">
            {state.errors.kelas}
          </p>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-md ${
            isPending
              ? "bg-pink-300 cursor-not-allowed"
              : "bg-pink-500 hover:bg-pink-600 hover:shadow-pink-200 cursor-pointer"
          }`}
        >
          {isPending ? "Memproses..." : "Daftar Sekarang 💖"}
        </button>
      </div>
    </form>
  );
}

export default function PageDetailEkskul({
  params,
}: {
  params: { id: string };
}) {
  const ekskulId = Number(params.id);

  if (isNaN(ekskulId)) notFound();

  const itemEkskul = ekskul.find((e) => e.id === ekskulId);
  if (!itemEkskul) notFound();

  // Data Anggota & Cookie simulasi di sisi klien/server terpadu
  const anggotaEkskul = pendaftar.filter((p) => p.ekskulId === ekskulId);
  const totalAnggota = anggotaEkskul.length;
  const sisaTempat = itemEkskul.kuota - totalAnggota;
  const isPenuh = sisaTempat <= 0;

  // Server Action internal
  async function daftarEkskulAction(formData: FormData) {
    "use server";

    const id = Number(formData.get("ekskulId"));
    const nama = (formData.get("nama") as string)?.trim() || "";
    const kelas = (formData.get("kelas") as string)?.trim() || "";
    const target = ekskul.find((e) => e.id === id);

    if (!target) return { success: false, message: "Ekskul tidak ditemukan." };

    const errors: { nama?: string; kelas?: string; umum?: string } = {};
    if (nama.length < 3) errors.nama = "Nama minimal 3 huruf.";
    if (kelas.length < 3) errors.kelas = "Kelas minimal 3 karakter.";

    if (errors.nama || errors.kelas) {
      return { success: false, errors, input: { nama, kelas } };
    }

    const anggotaList = pendaftar.filter((p) => p.ekskulId === id);
    const sudahTerdaftar = anggotaList.some(
      (p) =>
        p.nama.toLowerCase() === nama.toLowerCase() &&
        p.kelas.toLowerCase() === kelas.toLowerCase(),
    );

    if (sudahTerdaftar) {
      return {
        success: false,
        errors: {
          umum: `Nama dan kelas yang sama sudah terdaftar di ekskul ${target.nama}.`,
        },
        input: { nama, kelas },
      };
    }

    if (anggotaList.length >= target.kuota) {
      return {
        success: false,
        errors: {
          umum: `Kuota ${target.nama} sudah penuh (${target.kuota} orang).`,
        },
        input: { nama, kelas },
      };
    }

    const nomorBaru =
      pendaftar.length > 0 ? Math.max(...pendaftar.map((p) => p.nomor)) + 1 : 1;
    pendaftar.push({ nomor: nomorBaru, ekskulId: id, nama, kelas });

    return {
      success: true,
      message: `Pendaftaran #${nomorBaru} berhasil: ${target.nama}, ${target.hari}, sesi ${target.sesi} (${JAM_SESI[target.sesi]}).`,
      input: { nama, kelas },
    };
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/ekskul"
            className="inline-flex items-center text-sm font-semibold text-pink-600 hover:text-pink-800 bg-white px-4 py-2 rounded-xl shadow-sm border border-pink-100 transition-all"
          >
            &larr; Kembali ke Daftar Ekskul
          </Link>
        </div>

        <div className="bg-white/90 backdrop-blur-sm border border-pink-100 rounded-3xl p-8 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold bg-pink-100 text-pink-700 px-3 py-1 rounded-full uppercase tracking-wider">
              {itemEkskul.kategori}
            </span>
            {isPenuh ? (
              <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                Penuh ❌
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                Sisa {sisaTempat} dari {itemEkskul.kuota} tempat terisi 🩷
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold text-pink-900 mb-4">
            {itemEkskul.nama}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
            <div>
              <p className="text-xs font-bold text-pink-700 uppercase">
                Jadwal Hari
              </p>
              <p className="font-semibold mt-0.5">📅 {itemEkskul.hari}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-pink-700 uppercase">
                Sesi & Jam
              </p>
              <p className="font-semibold mt-0.5">
                ⏰ Sesi {itemEkskul.sesi} ({JAM_SESI[itemEkskul.sesi] || "-"})
              </p>
            </div>
            <div className="sm:col-span-2 mt-2 pt-2 border-t border-pink-200/60">
              <p className="text-xs font-bold text-pink-700 uppercase">
                Pembina
              </p>
              <p className="font-semibold mt-0.5">👨‍🏫 {itemEkskul.pembina}</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-pink-100">
            <h3 className="text-lg font-bold text-pink-900 mb-4">
              📝 Daftar Ekskul Ini
            </h3>
            <FormPendaftaranClient
              ekskulId={itemEkskul.id}
              action={daftarEkskulAction}
              defaultNama=""
              defaultKelas=""
            />
          </div>
        </div>

        {/* Daftar Anggota */}
        <div className="mt-8 bg-white/90 backdrop-blur-sm border border-pink-100 rounded-3xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-pink-900 mb-4">
            👥 Daftar Anggota Terdaftar
          </h3>

          {anggotaEkskul.length === 0 ? (
            <p className="text-gray-500 italic">Belum ada anggota.</p>
          ) : (
            <div className="space-y-3">
              {anggotaEkskul.map((item) => (
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
                  </div>
                  <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-xl shadow-xs">
                    {item.kelas}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
