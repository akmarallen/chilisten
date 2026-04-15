import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  Globe,
  LogOut,
  User,
  Heart,
  Plus,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import authStore from "../../context/auth";
import { useStore } from "zustand";
import { User as IUser } from "../../api/users.api";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [, setParams] = useSearchParams();

  const { user } = useStore(authStore);
  const isLoggedIn = !!user?.id;

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${searchQuery}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  const changeLanguage = () => {
    const newLang = i18n.language === "ru" ? "ky" : "ru";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#fdf8f3] border-b border-[#b48c5a]/20 font-sans ">
      {/* Accent Line */}
      <div className="h-[3px] w-full bg-linear-to-r from-[#8B5E3C] via-[#d4a96a] to-[#8B5E3C]" />

      <div className="max-w-7xl mx-auto px-6 flex items-center gap-4 h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#7a4020] to-[#C8874E] flex items-center justify-center shadow-lg shadow-[#8b3e25]/30">
            <BookOpen size={22} className="text-white" />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="text-xl font-semibold text-[#2d1a0e]">
              {t("header.logo")}
            </div>
            <div className="text-[11px] text-[#a07850] font-light">
              {t("header.tagline")}
            </div>
          </div>
        </Link>

        {/* Search Desktop */}
        <form
          onSubmit={handleSearch}
          className="hidden md:block flex-1 max-w-lg mx-4 relative"
        >
          <input
            type="text"
            placeholder={t("header.search")}
            className="placeholder-[#c4a882] w-full py-2 px-4 pr-10 border border-[#b48c5a]/30 rounded-xl bg-white text-sm outline-none transition-all focus:border-[#8B5E3C] focus:ring-4 focus:ring-[#8B5E3C]/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c4956a] hover:text-[#8B5E3C]"
          >
            <Search size={17} />
          </button>
        </form>

        {/* Actions Desktop */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <button
            onClick={changeLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#7a5030] hover:bg-[#8B5E3C]/10 transition-colors"
          >
            <Globe size={15} />
            {i18n.language === "ru" ? "РУ" : "КЫ"}
          </button>

          {isLoggedIn ? (
            <>
              <Link
                to="/new-book"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-linear-to-br from-[#7a4020] to-[#a0602a] text-white text-[13px] font-medium shadow-md shadow-[#783c14]/30 hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
              >
                <Plus size={15} /> {t("header.sell")}
              </Link>

              <Link
                to="/profile/favorites"
                className="p-2 rounded-lg text-[#7a5030] hover:bg-[#8B5E3C]/10 transition-colors"
              >
                <Heart size={18} />
              </Link>

              <div className="relative">
                <button
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#8B5E3C]/10 transition-colors"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <UserAvatar user={user} size="sm" />
                  <div className="hidden lg:block text-left">
                    <div className="text-[13px] font-medium text-[#2d1a0e] max-w-[110px] truncate">
                      {user?.full_name || t("header.profile")}
                    </div>
                    {user?.city && (
                      <div className="text-[11px] text-[#a07850]">
                        {user.city}
                      </div>
                    )}
                  </div>
                  <ChevronDown size={14} className="text-[#a07850] shrink-0" />
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#fdf8f3] border border-[#b48c5a]/20 rounded-2xl shadow-2xl overflow-hidden z-20">
                      <div className="p-3.5 bg-linear-to-br from-[#f5ede0] to-[#fdf8f3] border-b border-[#b48c5a]/10">
                        <div className="flex items-center gap-3 mb-2">
                          <UserAvatar user={user} size="sm" />
                          <div className="truncate">
                            <div className="font-medium text-[13px] text-[#2d1a0e] truncate">
                              {user?.full_name || "Пользователь"}
                            </div>
                            <div className="text-[11px] text-[#a07850] truncate">
                              {user?.email}
                            </div>
                          </div>
                        </div>
                        {Number(user.rating) > 0 && (
                          <div className="text-[11px] text-[#8B5E3C]">
                            ⭐ {user.rating} · {user.total_sales} продаж
                          </div>
                        )}
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#3d2010] hover:bg-[#8B5E3C]/5"
                        onClick={() => setProfileOpen(false)}
                      >
                        <User size={15} /> {t("header.profile")}
                      </Link>
                      <Link
                        to="/profile/favorites"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#3d2010] hover:bg-[#8B5E3C]/5"
                      >
                        <Heart size={15} /> {t("header.favorites")}
                      </Link>
                      <button
                        onClick={() => {
                          authStore.getState().logout();
                          navigate("/");
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 border-t border-[#b48c5a]/10"
                      >
                        <LogOut size={15} /> {t("header.logout")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => setParams({ login: "true" })}
              className="px-4 py-2 border-1.5 border-[#8B5E3C] text-[#7a4020] text-[13px] font-medium rounded-lg hover:bg-[#8B5E3C]/5 transition-colors"
            >
              {t("auth.login")}
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden ml-auto p-2 text-[#7a5030]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-6 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder={t("header.search")}
            className="w-full py-2 px-4 pr-10 border border-[#b48c5a]/30 rounded-xl bg-white text-sm outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c4956a]"
          >
            <Search size={17} />
          </button>
        </form>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[#b48c5a]/15 bg-[#fdf8f3] p-4 flex flex-direction flex-col gap-1">
          {isLoggedIn && (
            <div className="flex items-center gap-3 p-3 bg-[#8B5E3C]/5 rounded-xl mb-2">
              <UserAvatar user={user} size="lg" />
              <div>
                <div className="font-medium text-sm text-[#2d1a0e]">
                  {user?.full_name || "Пользователь"}
                </div>
                <div className="text-[11px] text-[#a07850]">{user?.city}</div>
              </div>
            </div>
          )}

          <MobileLink
            to="/"
            label={t("nav.home")}
            onClick={() => setIsMenuOpen(false)}
          />
          <MobileLink
            to="/catalog"
            label={t("nav.catalog")}
            onClick={() => setIsMenuOpen(false)}
          />

          {isLoggedIn ? (
            <>
              <MobileLink
                to="/new-book"
                label={t("nav.sell")}
                icon={<Plus size={16} />}
                primary
                onClick={() => setIsMenuOpen(false)}
              />
              <MobileLink
                to="/profile/favorites"
                label={t("nav.favorites")}
                icon={<Heart size={16} />}
                onClick={() => setIsMenuOpen(false)}
              />
              <MobileLink
                to="/profile"
                label={t("nav.profile")}
                icon={<User size={16} />}
                onClick={() => setIsMenuOpen(false)}
              />
              <MobileLink
                label={i18n.language === "ru" ? "Кыргызча" : "Русский"}
                icon={<Globe size={16} />}
                onClick={changeLanguage}
              />
              <button
                onClick={() => {
                  authStore.getState().logout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full p-3 text-sm text-red-600 font-medium rounded-lg hover:bg-red-50"
              >
                <LogOut size={16} /> {t("header.logout")}
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setParams({ login: "true" });
                setIsMenuOpen(false);
              }}
              className="w-full p-3 text-center text-sm font-medium text-white bg-linear-to-r from-[#7a4020] to-[#a0602a] rounded-lg"
            >
              {t("auth.login")}
            </button>
          )}
        </div>
      )}
    </header>
  );
};

const MobileLink = ({ to, label, icon, primary, onClick }: any) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 p-3 text-sm font-medium rounded-lg transition-colors ${
      primary
        ? "bg-linear-to-r from-[#7a4020] to-[#a0602a] text-white shadow-md"
        : "text-[#3d2010] hover:bg-[#8B5E3C]/5"
    }`}
  >
    {icon} {label}
  </Link>
);

type UserAvatarProps = {
  user: IUser;
  size?: "sm" | "lg";
};

const UserAvatar = ({ user, size = "sm" }: UserAvatarProps) => {
  const isSm = size === "sm";

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.full_name || "avatar"}
        className={`rounded-full object-cover border-2 border-[#d4a96a] shrink-0 ${
          isSm ? "w-8 h-8" : "w-10 h-10"
        }`}
      />
    );
  }

  const initial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : "?";

  return (
    <div
      className={`rounded-full bg-linear-to-br from-[#8B5E3C] to-[#C8874E] flex items-center justify-center font-semibold text-white shrink-0 shadow-sm select-none ${
        isSm ? "w-8 h-8 text-sm" : "w-10 h-10 text-base"
      }`}
    >
      {initial}
    </div>
  );
};
