import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Search,
  User as UserIcon,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  Star,
  ShoppingBag,
  Verified,
  ExternalLink,
  Edit3,
  Trash2,
  X,
  MapPin,
  Phone,
} from "lucide-react";
import { toast } from "react-toastify";
import { Controller, useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { User, userService } from "../../api/users.api";
import { CITIES } from "../../utils/const/const";

const PAGE_SIZE = 10;

const UsersTab = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
  });

  const loadUsers = useCallback(
    async (page: number, search: string) => {
      try {
        setLoading(true);
        const { data, count } = await userService.getAllUsers(
          page,
          PAGE_SIZE,
          search,
        );
        setUsers(data);
        setTotalCount(count || 0);
      } catch (err) {
        toast.error(t("admin.users.load_error"));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(0);
      loadUsers(0, searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, loadUsers]);

  useEffect(() => {
    if (editingUser) {
      reset({
        full_name: editingUser.full_name || "",
        email: editingUser.email || "",
        phone: editingUser.phone || "",
        city: editingUser.city || "Бишкек",
        role: editingUser.role || "user",
      });
    }
  }, [editingUser, reset]);

  const onUpdateSubmit = async (data: any) => {
    if (!editingUser) return;
    try {
      setIsSubmitting(true);
      await userService.updateUser(editingUser.id, data);
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...data } : u)),
      );
      toast.success(t("admin.users.update_success"));
      setEditingUser(null);
    } catch (err) {
      toast.error(t("admin.users.update_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      setIsSubmitting(true);
      await userService.deleteUser(deletingUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      toast.success(t("admin.users.delete_success"));
      setDeletingUser(null);
    } catch (err) {
      toast.error(t("admin.users.delete_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const inputStyles =
    "w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition-all text-sm";
  const labelStyles =
    "text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block";
  const errorStyles = "text-[10px] text-red-500 mt-1 font-medium italic";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-[#2d1a0e] flex items-center gap-2">
          <UserIcon size={24} className="text-[#8B5E3C]" />
          {t("admin.users.title")}{" "}
          <span className="text-stone-400 font-normal">({totalCount})</span>
        </h2>
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            size={18}
          />
          <input
            type="text"
            placeholder={t("admin.users.search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#8B5E3C] text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t("admin.users.table.user")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t("admin.users.table.stats")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t("admin.users.table.role")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">
                  {t("admin.users.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-stone-400"
                  >
                    {t("common.loading")}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-stone-50/50 transition-colors group ${user.is_suspended ? "bg-red-50/40" : ""}`}
                  >
                    <td
                      className="px-6 py-4 cursor-pointer"
                      onClick={() => navigate(`/seller/${user.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-100 overflow-hidden flex items-center justify-center border border-stone-200 shrink-0">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            <span className="text-stone-400 font-bold">
                              {user.full_name?.[0] || "?"}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[#2d1a0e] text-sm flex items-center gap-1 group-hover:text-[#8B5E3C]">
                            {user.full_name || "---"}
                            {user.is_verified && (
                              <Verified size={14} className="text-blue-500" />
                            )}
                            <ExternalLink
                              size={12}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </div>
                          <div className="text-xs text-stone-500 flex items-center gap-1">
                            <Mail size={12} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-xs text-stone-600">
                        <span className="flex items-center gap-1">
                          <Star
                            size={14}
                            className="text-amber-400 fill-amber-400"
                          />{" "}
                          {user.rating || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingBag size={14} /> {user.total_sales || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-sm font-medium text-stone-700">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-1">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-stone-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() =>
                            userService
                              .updateUser(user.id, {
                                is_suspended: !user.is_suspended,
                              })
                              .then(() => loadUsers(currentPage, searchQuery))
                          }
                          className={`p-2 rounded-lg transition-colors ${user.is_suspended ? "text-green-600 hover:bg-green-50" : "text-amber-600 hover:bg-amber-50"}`}
                        >
                          {user.is_suspended ? (
                            <CheckCircle size={18} />
                          ) : (
                            <Ban size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              {t("catalog.page_x_of_y", {
                current: currentPage + 1,
                total: totalPages,
              })}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 0 || loading}
                onClick={() => {
                  setCurrentPage((p) => p - 1);
                  loadUsers(currentPage - 1, searchQuery);
                }}
                className="p-2 rounded-lg border border-stone-200 bg-white disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium px-2">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages - 1 || loading}
                onClick={() => {
                  setCurrentPage((p) => p + 1);
                  loadUsers(currentPage + 1, searchQuery);
                }}
                className="p-2 rounded-lg border border-stone-200 bg-white disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm"
          onClick={() => setEditingUser(null)}
        >
          <div
            className="relative w-full max-w-[420px] bg-[#fdf8f3] rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
            >
              <X size={18} />
            </button>
            <div className="pt-10 pb-6 px-8 text-center border-b border-stone-100">
              <div className="w-14 h-14 bg-linear-to-br from-amber-700 to-amber-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3">
                <UserIcon size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-stone-800">
                {t("admin.users.edit_user")}
              </h2>
            </div>

            <form
              onSubmit={handleSubmit(onUpdateSubmit)}
              className="p-8 space-y-4 max-h-[60vh] overflow-y-auto"
            >
              <div>
                <label className={labelStyles}>
                  {t("admin.users.fields.name")}
                </label>
                <div className="relative">
                  <UserIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600/50"
                    size={16}
                  />
                  <input
                    {...register("full_name", {
                      required: "Имя обязательно",
                      minLength: { value: 2, message: "Минимум 2 символа" },
                    })}
                    className={`${inputStyles} ${errors.full_name ? "border-red-500" : "border-stone-200"}`}
                    placeholder="Иван Иванов"
                  />
                </div>
                {errors.full_name && (
                  <p className={errorStyles}>
                    {String(errors.full_name.message)}
                  </p>
                )}
              </div>

              <div>
                <label className={labelStyles}>
                  {t("admin.users.fields.email")}
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600/50"
                    size={16}
                  />
                  <input
                    {...register("email", {
                      required: "Email обязателен",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Некорректный email",
                      },
                    })}
                    className={`${inputStyles} ${errors.email ? "border-red-500" : "border-stone-200"}`}
                    placeholder="mail@example.com"
                  />
                </div>
                {errors.email && (
                  <p className={errorStyles}>{String(errors.email.message)}</p>
                )}
              </div>

              <div>
                <label className={labelStyles}>
                  {t("admin.users.fields.phone")}
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600/50"
                    size={16}
                  />
                  <Controller
                    control={control}
                    name="phone"
                    rules={{
                      required: "Номер обязателен",
                      minLength: {
                        value: 9,
                        message: "Невалидный номер телефона",
                      },
                    }}
                    render={({ field }) => (
                      <PatternFormat
                        format="+996 (###) ##-##-##"
                        mask="_"
                        className={`${inputStyles} ${errors.phone ? "border-red-500" : "border-stone-200"}`}
                        value={field.value}
                        onValueChange={(v) => field.onChange(v.value)}
                        placeholder="+996 (700) 00-00-00"
                      />
                    )}
                  />
                </div>
                {errors.phone && (
                  <p className={errorStyles}>{String(errors.phone.message)}</p>
                )}
              </div>

              <div>
                <label className={labelStyles}>
                  {t("admin.users.fields.city")}
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600/50"
                    size={16}
                  />
                  <select
                    {...register("city", { required: true })}
                    className={`${inputStyles} border-stone-200 appearance-none cursor-pointer`}
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelStyles}>
                  {t("admin.users.fields.role")}
                </label>
                <select
                  {...register("role", { required: true })}
                  className={`${inputStyles} border-stone-200`}
                >
                  <option value="user">Пользователь</option>
                  <option value="moderator">Модератор</option>
                  <option value="admin">Админ</option>
                </select>
              </div>

              <button
                disabled={isSubmitting}
                className="w-full py-3 bg-linear-to-r from-amber-800 to-amber-900 text-white rounded-xl text-lg shadow-lg hover:shadow-amber-900/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
              >
                {isSubmitting ? "..." : t("common.save")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm">
          <div className="bg-[#fdf8f3] rounded-[24px] p-8 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
              <Trash2 size={32} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">
              {t("admin.users.delete_confirm_title")}
            </h3>
            <p className="text-sm text-stone-500 mb-6">
              {t("admin.users.delete_confirm_desc", {
                name: deletingUser.full_name || deletingUser.email,
              })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingUser(null)}
                className="flex-1 py-3 text-stone-500 font-medium hover:bg-stone-100 rounded-xl transition-all"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 transition-all"
              >
                {isSubmitting ? "..." : t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
