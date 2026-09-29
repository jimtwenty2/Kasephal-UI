import Footer from "@/components/layout/Footer";
import IdentityVerificationBanner from "@/components/layout/IdentityVerificationBanner";
import Navbar from "@/components/layout/NavBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <IdentityVerificationBanner />
      <Navbar />
      {children}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </>
  );
}
