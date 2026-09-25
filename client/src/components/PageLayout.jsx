import Navbar from "./Navbar";

export default function PageLayout({ children }) {
  return (
    <main className="min-h-screen bg-[#F2F7FB] text-[#0B1F3A]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
    </main>
  );
}
