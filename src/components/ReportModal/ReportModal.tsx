import { useState } from "react";
import { AlertOctagon, X, CheckCircle, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ReportInsert, reportService } from "../../api/reports.api";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  reporterId: string;
  sellerName: string;
  bookId?: string;
  bookTitle?: string;
}

const ReportModal = ({
  isOpen,
  onClose,
  sellerId,
  reporterId,
  sellerName,
  bookId,
  bookTitle,
}: ReportModalProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: { reason: "" },
  });

  if (!isOpen) return null;

  const handleModalClose = () => {
    reset();
    setSubmitted(false);
    onClose();
  };

  const onSubmit = async (data: { reason: string }) => {
    setLoading(true);
    try {
      await reportService.createReport({
        reporter_id: reporterId,
        seller_id: sellerId,
        book_id: bookId || null,
        reason: data.reason.trim(),
        status: "NEW",
      } as ReportInsert);

      setSubmitted(true);
    } catch (error: any) {
      toast.error(t("seller.report.error"));
    } finally {
      setLoading(false);
    }
  };

  const inputStyles =
    "w-full pl-4 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none transition-all text-sm resize-none h-32";
  const labelStyles =
    "text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm"
      onClick={handleModalClose}
    >
      <div
        className="relative w-full max-w-[420px] bg-[#fdf8f3] rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-stone-900">
              {t("seller.report.success_title")}
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              {t("seller.report.success")}
            </p>
            <button
              onClick={handleModalClose}
              className="w-full mt-4 py-3 bg-stone-800 text-white rounded-xl hover:bg-stone-900 transition-all shadow-lg font-medium"
            >
              {t("common.close")}
            </button>
          </div>
        ) : (
          <>
            <div className="pt-10 pb-6 px-8 text-center border-b border-stone-100">
              <div className="w-14 h-14 bg-linear-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3">
                <AlertOctagon size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-stone-800">
                {bookId
                  ? t("seller.report.title_book")
                  : t("seller.report.title")}
              </h2>
              <p className="text-stone-500 text-xs mt-1">
                {bookId
                  ? t("seller.report.reporting_book", { title: bookTitle })
                  : t("seller.report.reporting_user", { name: sellerName })}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-4">
              <div>
                <label className={labelStyles}>
                  {t("seller.report.reason_label")}
                </label>

                <textarea
                  {...register("reason", {
                    required: t("auth.error_required"),
                    minLength: {
                      value: 10,
                      message: t("seller.report.min_length"),
                    },
                  })}
                  className={inputStyles}
                  placeholder={t("seller.report.reason_placeholder")}
                />
                {errors.reason && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.reason.message}
                  </p>
                )}
              </div>

              <button
                disabled={loading}
                className="w-full py-3 bg-linear-to-r from-red-700 to-red-800 text-white rounded-xl text-lg shadow-lg hover:shadow-red-900/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 font-medium"
              >
                {loading ? "..." : t("seller.report.button")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
