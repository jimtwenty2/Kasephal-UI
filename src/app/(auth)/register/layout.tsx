import RegisterAside from "./_components/RegisterAside";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white p-4">
      <section className="grid min-h-[calc(100dvh-32px)] grid-cols-1 rounded-[24px] bg-white lg:grid-cols-[38%_62%]">
        <RegisterAside />

        <section className="flex items-start justify-center overflow-y-auto px-4 py-8 lg:items-center">
          {children}
        </section>
      </section>
    </main>
  );
}
