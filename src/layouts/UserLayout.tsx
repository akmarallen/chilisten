import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";

export const UserLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10">
        <Header />
      </header>

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
};
