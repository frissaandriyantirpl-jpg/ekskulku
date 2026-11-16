
"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

type FormState = {
  message?: string;
  errors?: {
    umum?: string;
    nama?: string;
    kelas?: string;
  };
  input?: {
    nama: string;
    kelas: string;
  };
} | null;

function TombolKirim() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full py-3.5 rounded-2xl font-bold text-white transition-all shadow-lg shadow-pink-200 ${
        pending
          ? "bg-pink-300 cursor-not-allowed"
          : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
      }`}
    >
      {pending ? "Memproses..." : "Daftar Sekarang 💖"}
    </button>
  );
}

export default function FormPendaftaranClient({
  ekskulId,
  action,
  defaultNama,
  defaultKelas,
}: {
  ekskulId: number;
  action: (formData: FormData) => Promise<FormState>;
  defaultNama: string;
  defaultKelas: string;
}) {
  const [state, setState] = useState<FormState>(null);
  const [nama, setNama] = useState(defaultNama);
  const [kelas, setKelas] = useState(defaultKelas);

  const handleSubmit = async (formData: FormData): Promise<void> => {
    const result = await action(formData);
    setState(result);

    if (result?.input) {
      setNama(result.input.nama);
      setKelas(result.input.kelas);
    }
  };

  return (
    <form
      action={handleSubmit}
      className="space-y-5 bg-pink-50/40 p-6 rounded-3xl border border-pink-100/80 shadow-sm"
    >
      <input type="hidden" name="ekskulId" value={ekskulId} />

      {state?.message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-medium shadow-sm">
          ✅ {state.message}
        </div>
      )}

      {state?.errors?.umum && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-medium shadow-sm">
          ❌ {state.errors.umum}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-pink-700 uppercase tracking-wider mb-2">
          Nama Lengkap 🌸
        </label>

        <input
          type="text"
          name="nama"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Contoh: Budi Santoso"
          className="w-full bg-white border border-pink-200/80 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent shadow-sm transition-all"
        />

        {state?.errors?.nama && (
          <p className="text-rose-500 text-xs mt-1.5 font-medium ml-1">
            {state.errors.nama}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-pink-700 uppercase tracking-wider mb-2">
          Kelas ✨
        </label>

        <input
          type="text"
          name="kelas"
          value={kelas}
          onChange={(e) => setKelas(e.target.value)}
          placeholder="Contoh: XI RPL 1"
          className="w-full bg-white border border-pink-200/80 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent shadow-sm transition-all"
        />

        {state?.errors?.kelas && (
          <p className="text-rose-500 text-xs mt-1.5 font-medium ml-1">
            {state.errors.kelas}
          </p>
        )}
      </div>

      <div className="pt-2">
        <TombolKirim />
      </div>
    </form>
  );
}
