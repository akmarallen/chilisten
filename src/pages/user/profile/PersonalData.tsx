import { useState } from "react";
import { useStore } from "zustand";
import authStore from "../../../context/auth";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  ShoppingBag,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { userService } from "../../../api/users.api";
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import { PatternFormat } from "react-number-format";

const PersonalData = () => {
  const { t, i18n } = useTranslation();
  const user = useStore(authStore, (state) => state.user);
  const setUser = useStore(authStore, (state) => state.setUser);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      full_name: user?.full_name || "",
      phone: user?.phone || "",
      city: user?.city || "",
    },
  });

  const onUpdateProfile = async (data: any) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: updatedUser } = await userService.updateUser(user.id, data);
      if (updatedUser) {
        setUser(updatedUser);
        setIsEditing(false);
        toast.success(t("profile.update_success"));
      }
    } catch (error) {
      toast.error(t("profile.update_error"));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(
      i18n.language === "ru" ? "ru-RU" : "ky-KG",
      {
        year: "numeric",
        month: "long",
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-[20px] border border-[#b48c5a]/20 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
            <Star size={24} fill="currentColor" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#2d1a0e]">
              {user?.rating || "0.0"}
            </div>
            <div className="text-[0.7rem] text-[#a07850] uppercase">
              {t("profile.rating")}
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-[20px] border border-[#b48c5a]/20 flex items-center gap-4">
          <div className="p-3 bg-[#8b5e3c]/5 text-[#8b5e3c] rounded-xl">
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="text-xl font-bold text-[#2d1a0e]">
              {user?.total_sales || 0}
            </div>
            <div className="text-[0.7rem] text-[#a07850] uppercase">
              {t("profile.sales")}
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onUpdateProfile)}
        className="bg-white rounded-[20px] border border-[#b48c5a]/20 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[#b48c5a]/10 bg-[#fdf8f3]/50 flex justify-between items-center">
          <h3 className="text-lg font-medium text-[#2d1a0e]">
            {t("profile.personal_data")}
          </h3>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-[#a07850] flex items-center gap-1 text-xs font-bold uppercase cursor-pointer"
            >
              <Edit2 size={14} /> {t("profile.edit_profile")}
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="text-green-600 flex items-center gap-1 text-xs font-bold uppercase cursor-pointer"
              >
                <Check size={14} /> {t("common.save")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  reset();
                }}
                className="text-red-500 flex items-center gap-1 text-xs font-bold uppercase cursor-pointer"
              >
                <X size={14} />
                {t("common.cancel")}
              </button>
            </div>
          )}
        </div>

        <div className="p-6 space-y-5">
          <DetailItem
            icon={<Mail size={18} />}
            label={t("profile.email")}
            value={user?.email}
          />

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#fdf8f3] flex items-center justify-center text-[#a07850]">
              <Phone size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[0.65rem] uppercase tracking-widest text-[#a07850] font-bold">
                {t("profile.phone")}
              </p>
              <Controller
                name="phone"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <PatternFormat
                    disabled={!isEditing}
                    format="+996 (###) ##-##-##"
                    value={value}
                    onValueChange={(v) => onChange(v.value)}
                    className="w-full border-b border-[#b48c5a]/20 outline-none text-[#2d1a0e] bg-transparent"
                  />
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#fdf8f3] flex items-center justify-center text-[#a07850]">
              <MapPin size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[0.65rem] uppercase tracking-widest text-[#a07850] font-bold">
                {t("profile.location")}
              </p>
              {isEditing ? (
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      className="w-full border-b border-[#b48c5a]/20 outline-none bg-transparent"
                    />
                  )}
                />
              ) : (
                <p className="text-[#2d1a0e]">
                  {user?.city || t("profile.not_specified")}
                </p>
              )}
            </div>
          </div>

          <DetailItem
            icon={<Calendar size={18} />}
            label={t("profile.joined")}
            value={formatDate(user?.created_at || null)}
            isLast
          />
          
        </div>
      </form>
    </div>
  );
};

const DetailItem = ({ icon, label, value, isLast = false }: any) => (
  <div
    className={`flex items-center gap-4 ${isLast ? "pt-2 border-t border-[#b48c5a]/10" : ""}`}
  >
    <div className="w-10 h-10 rounded-full bg-[#fdf8f3] flex items-center justify-center text-[#a07850]">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[0.65rem] uppercase tracking-widest text-[#a07850] font-bold">
        {label}
      </p>
      <p className="text-[#2d1a0e] text-[0.95rem]">{value || "—"}</p>
    </div>
  </div>
);

export default PersonalData;
