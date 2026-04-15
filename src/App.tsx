import "./i18n/i18n.config";
import { Routes, Route, Navigate, HashRouter } from "react-router-dom";

import AuthModal from "./pages/admin/AuthModal";

import CatalogSection from "./components/CatalogSection/CatalogSection";
import SellerProfile from "./pages/user/SellerProfile";
import Favorites from "./pages/user/profile/Favorites";
import HeroSection from "./components/HeroSection/HeroSection";
import AdminPage from "./pages/admin/AdminDashboard";
import { SessionProvider } from "./providers/SessionProvider";
import { ProtectedRoute } from "./middleware/ProtectedRoute";
import ProfilePage from "./pages/user/profile/Profile";
import BookPage from "./pages/book/BookPage";
import { ToastContainer } from "react-toastify";
import { CatalogPage } from "./pages/user/Catalog";
import { UserLayout } from "./layouts/UserLayout";
import { ScrollToTop } from "./providers/ScrollToTop";
import PersonalData from "./pages/user/profile/PersonalData";
import { MyBooks } from "./pages/user/profile/MyBooks";
import EditBook from "./pages/book/EditBook";
import AllBooksTab from "./pages/admin/AllBooksTab";
import ReportsTab from "./pages/admin/ReportsTab";
import UsersTab from "./pages/admin/UsersTab";
import StatisticsTab from "./pages/admin/StatisticsTab";
import AddBook from "./pages/book/AddBook";
import AiAssistant from "./components/AiAsisstent/AiAssistant";

function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <SessionProvider />
      <ToastContainer />
      <AuthModal />

      <Routes>
        <Route
          path="/"
          element={
            <UserLayout>
              <HeroSection />
              <CatalogSection />
            </UserLayout>
          }
        />

        <Route
          path="/catalog"
          element={
            <UserLayout>
              <CatalogPage />
            </UserLayout>
          }
        />

        <Route
          path="/book/:id"
          element={
            <UserLayout>
              <BookPage />
            </UserLayout>
          }
        />
        <Route
          path="/new-book"
          element={
            <ProtectedRoute fallbackPath="/?login=true">
              <UserLayout>
                <AddBook />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-book/:id"
          element={
            <ProtectedRoute fallbackPath="/?login=true">
              <UserLayout>
                <EditBook />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/:id"
          element={
            <UserLayout>
              <SellerProfile />
            </UserLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserLayout>
                <ProfilePage />
              </UserLayout>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/profile/personal" replace />} />

          <Route path="personal" element={<PersonalData />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="my-books" element={<MyBooks />} />
        </Route>
        <Route
          path="*"
          element={
            <UserLayout>
              <div
                style={{
                  minHeight: "60vh",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fdf8f3",
                  fontFamily: "'DM Sans', sans-serif",
                  gap: "0.75rem",
                }}
              >
                <div style={{ fontSize: "2.5rem" }}>📚</div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.3rem",
                    color: "#2d1a0e",
                  }}
                >
                  Страница не найдена
                </div>
              </div>
            </UserLayout>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <UserLayout>
                <AdminPage />
              </UserLayout>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/books" replace />} />
          <Route path="books" element={<AllBooksTab />} />
          <Route path="reports" element={<ReportsTab />} />
          <Route path="users" element={<UsersTab />} />
          <Route path="stats" element={<StatisticsTab />} />
        </Route>
        {/* Остальные маршруты */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
      <AiAssistant />
    </HashRouter>
  );
}

export default App;
