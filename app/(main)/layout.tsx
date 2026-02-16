import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import PopupManager from "@/app/components/PopupManager";
import AppInitializer from "@/app/components/AppInitializer";
import GlobalLoginPopup from "@/app/components/GlobalLoginPopup";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppInitializer />
      <PopupManager />
      <div className="mainPageWrapper">
        <Header />
        {children}
        <Footer />
      </div>
      <GlobalLoginPopup />
    </>
  );
}
