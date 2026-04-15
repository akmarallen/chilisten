import { useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  BookOpen,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle,
  X,
} from "lucide-react";
import { CITIES } from "../../utils/const/const";
import { useSearchParams } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { PatternFormat } from "react-number-format";

const AuthModal = () => {
  const [params, setParams] = useSearchParams();
  const isOpen = params.get("login") === "true";

  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      city: "Бишкек",
      password: "",
    },
  });

  const onClose = () => {
    params.delete("login");
    setParams(params);
    reset();
    setRegistered(false);
  };

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (tab === "register") {
        const { error } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            data: {
              name: data.full_name.trim(),
              phone: data.phone.trim(),
              city: data.city,
            },
          },
        });

        if (error) throw error;
        setRegisteredEmail(data.email);
        setRegistered(true);
        reset({ full_name: "", email: "", phone: "", city: "", password: "" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email.trim(),
          password: data.password,
        });

        if (error) throw error;
        onClose();
      }
    } catch (error: any) {
      toast.error(t("auth.wrong_password_or_email"));
    } finally {
      setLoading(false);
    }
  };

  const inputStyles =
    "w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition-all text-sm";
  const labelStyles =
    "text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] bg-[#fdf8f3] rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
        >
          <X size={18} />
        </button>

        {registered ? (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className=" text-2xl font-semibold text-stone-900">
              {t("auth.check_email")}
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              <Trans
                i18nKey="auth.check_email_desc"
                values={{ email: registeredEmail }}
                components={{ bold: <span className="font-semibold" /> }}
              />
            </p>
            <button
              onClick={() => {
                setRegistered(false);
                setTab("login");
              }}
              className="w-full mt-4 py-3 bg-stone-800 text-white rounded-xl  hover:bg-stone-900 transition-all shadow-lg"
            >
              {t("auth.login")} →
            </button>
          </div>
        ) : (
          <>
            <div className="pt-10 pb-6 px-8 text-center border-b border-stone-100">
              <div className="w-14 h-14 bg-linear-to-br from-amber-700 to-amber-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3">
                <BookOpen size={28} className="text-white" />
              </div>
              <h2 className=" text-2xl font-bold text-stone-800">
                {tab === "login" ? t("auth.welcome") : t("auth.create_account")}
              </h2>
            </div>

            <div className="flex px-8 border-b border-stone-100">
              {(["login", "register"] as const).map((tKey) => (
                <button
                  key={tKey}
                  onClick={() => setTab(tKey)}
                  className={`flex-1 py-4 text-sm font-medium transition-all border-b-2 ${
                    tab === tKey
                      ? "border-amber-700 text-stone-900"
                      : "border-transparent text-stone-400 hover:text-stone-600"
                  }`}
                >
                  {t(`auth.${tKey}`)}
                </button>
              ))}
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-8 space-y-4 max-h-[60vh] overflow-y-auto"
            >
              {tab === "register" && (
                <div>
                  <label className={labelStyles}>{t("auth.name")}</label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600/50"
                      size={16}
                    />
                    <input
                      {...register("full_name", {
                        required:
                          tab === "register" ? t("auth.error_required") : false,
                      })}
                      className={inputStyles}
                      placeholder="Иван Иванов"
                    />
                  </div>
                  {errors.full_name && (
                    <p className="text-[10px] text-red-500 mt-1">
                      {errors.full_name.message}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className={labelStyles}>{t("auth.email")}</label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600/50"
                    size={16}
                  />
                  <input
                    {...register("email", {
                      required: t("auth.error_required"),
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: t("auth.error_invalid_email"),
                      },
                    })}
                    className={inputStyles}
                    placeholder="mail@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {tab === "register" && (
                <>
                  <div>
                    <label className={labelStyles}>{t("auth.phone")}</label>
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600/50"
                        size={16}
                      />
                      <Controller
                        control={control}
                        name="phone"
                        rules={{
                          required:
                            tab === "register"
                              ? t("auth.error_required")
                              : false,
                        }}
                        render={({ field }) => (
                          <PatternFormat
                            format="+996 (###) ##-##-##"
                            mask="_"
                            className={inputStyles}
                            value={field.value}
                            onValueChange={(values) =>
                              field.onChange(values.value)
                            }
                            placeholder="+996 (700) 00-00-00"
                          />
                        )}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-[10px] text-red-500 mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelStyles}>{t("auth.city")}</label>
                    <div className="relative">
                      <MapPin
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600/50"
                        size={16}
                      />
                      <select
                        {...register("city")}
                        className={`${inputStyles} appearance-none cursor-pointer`}
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className={labelStyles}>{t("auth.password")}</label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600/50"
                    size={16}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: t("auth.error_required"),
                      minLength: {
                        value: 8,
                        message: t("auth.error_min_length"),
                      },
                    })}
                    className={inputStyles}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                disabled={loading}
                className="w-full py-3 bg-linear-to-r from-amber-800 to-amber-900 text-white rounded-xl  text-lg shadow-lg hover:shadow-amber-900/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
              >
                {loading
                  ? "..."
                  : tab === "login"
                    ? t("auth.login")
                    : t("auth.register")}
              </button>

              <div className="flex items-center gap-2 my-4 opacity-50">
                <div className="flex-1 h-px bg-stone-300"></div>
                <span className="text-[10px] uppercase font-bold text-stone-500">
                  {tab === "login"
                    ? t("auth.no_account")
                    : t("auth.already_have_account")}
                </span>
                <div className="flex-1 h-px bg-stone-300"></div>
              </div>

              <button
                type="button"
                onClick={() => setTab(tab === "login" ? "register" : "login")}
                className="w-full text-sm text-amber-800 font-medium hover:underline"
              >
                {tab === "login" ? t("auth.register") : t("auth.login")} →
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
