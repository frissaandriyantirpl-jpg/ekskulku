"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

function TombolKirim() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-md ${
        pending
          ? "bg-pink-300 cursor-not-allowed"
          : "bg-pink-500 hover:bg-pink-600 hover:shadow-pink-200 cursor-pointer"
      }`}
    >
      {pending ? "Memproses..." : "Daftar Sekarang 💖"}
    </button>
  );
}

export default function FormPendaftaran({
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

  const handleSubmit = async (formData: FormData) => {
    const result = await action(formData);
    setState(result);
    if (result?.input) {
      setNama(result.input.nama);
      setKelas(result.input.kelas);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-4">
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
        <TombolKirim />
      </div>
    </form>
  );
}
