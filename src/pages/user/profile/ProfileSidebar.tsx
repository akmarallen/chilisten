import { useRef, useState } from "react";
import { useStore } from "zustand";
import authStore from "../../../context/auth";
import {
  User,
  LogOut,
  ShieldCheck,
  Camera,
  Heart,
  BookOpen,
  Settings,
  UserIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { userService } from "../../../api/users.api";
import { toast } from "react-toastify";
import { Link, useLocation } from "react-router-dom";

const ProfileSidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const user = useStore(authStore, (state) => state.user);
  const logout = useStore(authStore, (state) => state.logout);
  const setUser = useStore(authStore, (state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("profile.avatar_too_big", { mb: 2 }));
      return;
    }

    setLoading(true);
    try {
      const { data } = await userService.updateAvatar(user, file);
      if (data) {
        setUser(data);
        toast.success(t("profile.update_success"));
      }
    } catch (error: any) {
      toast.error(error.message || t("profile.update_avatar_error"));
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getMenuItems = () => {
    const menuItems = [
      {
        path: "/profile/personal",
        label: t("profile.personal_data"),
        icon: <Settings size={18} />,
      },
      {
        path: "/profile/favorites",
        label: t("profile.favorites"),
        icon: <Heart size={18} />,
      },
      {
        path: "/profile/my-books",
        label: t("profile.my_books"),
        icon: <BookOpen size={18} />,
      },
    ];
    if (user?.role === "admin") {
      menuItems.push({
        path: "/admin",
        label: t("profile.admin_panel"),
        icon: <UserIcon size={18} />,
      });
    }
    return menuItems;
  };

  return (
    <div className="bg-white p-6 rounded-[20px] border border-[#b48c5a]/20 shadow-sm text-center">
      <div className="relative w-32 h-32 mx-auto mb-4 group">
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#fdf8f3] bg-[#8b5e3c]/10">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#8b5e3c]">
              <User size={48} />
            </div>
          )}
        </div>

        <button
          disabled={loading}
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-50"
        >
          <Camera className="text-white" size={24} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          className="hidden"
          accept="image/*"
        />

        {user?.is_verified && (
          <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 text-blue-500 shadow-sm">
            <ShieldCheck
              size={20}
              fill="currentColor"
              className="text-white fill-blue-500"
            />
          </div>
        )}
      </div>

      <h1 className="text-2xl font-bold text-[#2d1a0e] mb-1">
        {user?.full_name || t("profile.not_specified")}
      </h1>
      <p className="text-[#a07850] text-sm mb-6 capitalize">
        {user?.role === "admin"
          ? t("profile.admin_role")
          : t("profile.user_role")}
      </p>

      <nav className="space-y-2 mb-6 text-left">
        {getMenuItems().map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              location.pathname === item.path
                ? "bg-[#8b5e3c] text-white"
                : "text-[#8b5e3c] hover:bg-[#fdf8f3]"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors cursor-pointer"
      >
        <LogOut size={16} />
        {t("profile.logout")}
      </button>
    </div>
  );
};

export default ProfileSidebar;
