"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h2 style={{ color: "red" }}>Terjadi kesalahan saat memuat data!</h2>
      <p>{error.message}</p>
      <button 
        onClick={() => reset()} 
        style={{ padding: "0.5rem 1rem", marginTop: "1rem", cursor: "pointer" }}
      >
        Coba lagi
      </button>
    </main>
  );
}