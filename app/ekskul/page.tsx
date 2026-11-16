'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function HalamanEkskul() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Ambil nilai filter yang ada di URL saat ini
  const kategoriQuery = searchParams.get('kategori') || 'Semua Kategori';
  const hariQuery = searchParams.get('hari') || 'Semua Hari';
  const sisaQuery = searchParams.get('sisa') || '';

  // 2. State untuk form dropdown
  const [kategori, setKategori] = useState<string>(kategoriQuery);
  const [hari, setHari] = useState<string>(hariQuery);
  const [sisa, setSisa] = useState<string>(sisaQuery);

  // Data contoh ekstrakurikuler
  const dataEkskul = [
    { nama: 'Basket', kategori: 'Olahraga', hari: 'Senin', sisaSlot: 1, pembina: 'Pak Andi' },
    { nama: 'Futsal', kategori: 'Olahraga', hari: 'Rabu', sisaSlot: 20, pembina: 'Pak Reza' },
    { nama: 'Pramuka', kategori: 'Umum', hari: 'Jumat', sisaSlot: 3, pembina: 'Bu Siti' },
  ];

  // 3. LOGIKA FILTER
  const filteredEkskul = dataEkskul.filter((item) => {
    const matchKategori = kategoriQuery === 'Semua Kategori' || !kategoriQuery ? true : item.kategori.toLowerCase() === kategoriQuery.toLowerCase();
    const matchHari = hariQuery === 'Semua Hari' || !hariQuery ? true : item.hari.toLowerCase() === hariQuery.toLowerCase();
    
    // Jika ada parameter ?sisa=1 di URL, saring ekskul yang sisa slotnya <= nilai tersebut
    const matchSisa = sisaQuery ? item.sisaSlot <= parseInt(sisaQuery) : true;

    return matchKategori && matchHari && matchSisa;
  });

  // 4. Fungsi saat tombol "Cari & Saring" diklik (memperbarui URL)
  const handleCariSaring = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (kategori && kategori !== 'Semua Kategori') params.set('kategori', kategori);
    if (hari && hari !== 'Semua Hari') params.set('hari', hari);
    if (sisa) params.set('sisa', sisa);

    router.push(`/ekskul?${params.toString()}`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* FORM FILTER ATAS */}
      <form onSubmit={handleCariSaring} className="bg-white p-4 rounded-3xl shadow-sm mb-6 flex flex-wrap gap-4 items-center">
        {/* Dropdown Kategori */}
        <select 
          value={kategori} 
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setKategori(e.target.value)}
          className="border p-2 rounded-xl flex-1"
        >
          <option>Semua Kategori</option>
          <option>Olahraga</option>
          <option>Umum</option>
        </select>

        {/* Dropdown Hari */}
        <select 
          value={hari} 
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setHari(e.target.value)}
          className="border p-2 rounded-xl flex-1"
        >
          <option>Semua Hari</option>
          <option>Senin</option>
          <option>Rabu</option>
          <option>Jumat</option>
        </select>

        {/* Input Sisa Slot */}
        <input 
          type="number" 
          placeholder="Maks. Sisa Slot (cth: 1)" 
          value={sisa}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSisa(e.target.value)}
          className="border p-2 rounded-xl"
        />

        {/* Tombol Cari & Saring Pink */}
        <button 
          type="submit" 
          className="bg-pink-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-pink-600 transition"
        >
          Cari & Saring 🔍
        </button>
      </form>

      {/* HASIL KARTU EKSKUL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEkskul.length > 0 ? (
          filteredEkskul.map((item, index) => (
            <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <span className="text-xs bg-pink-100 text-pink-600 px-3 py-1 rounded-full font-semibold">
                {item.kategori}
              </span>
              <h3 className="text-xl font-bold mt-2">{item.nama}</h3>
              <p className="text-sm text-gray-500 mt-1">📅 {item.hari} • Pembina: {item.pembina}</p>
              <div className="mt-4 inline-block bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-medium">
                Sisa {item.sisaSlot} slot
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-2 text-center py-8">Tidak ada ekstrakurikuler yang sesuai dengan filter.</p>
        )}
      </div>
    </div>
  );
}