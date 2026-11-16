
"use client";

import { useFormStatus } from "react-dom";
import { batalkanPendaftaranAction } from "./actions";

function TombolProses() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 transition-all"
    >
      {pending ? "Memproses..." : "Batalkan"}
    </button>
  );
}

export default function TombolBatalkan({
  nomor,
}: {
  nomor: number;
}) {
  return (
    <form action={batalkanPendaftaranAction}>
      <input type="hidden" name="nomor" value={nomor} />
      <TombolProses />
    </form>
  );
}
