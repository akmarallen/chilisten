import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  User,
  Book as BookIcon,
  Calendar,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";

const ReportsTab = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reports")
        .select(
          `
          *,
          reporter:reporter_id(full_name, email),
          book:book_id(id, title, author, cover_url)
        `,
        )
        .eq("status", "NEW")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      toast.error(t("admin.reports.load_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    reportId: string,
    status: "RESOLVED" | "REJECTED",
  ) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status })
        .eq("id", reportId);

      if (error) throw error;

      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setSelectedReport(null);
      toast.success(
        t(`admin.reports.status_${status.toLowerCase() as "resolved"}`),
      );
    } catch (err) {
      toast.error(t("admin.reports.update_error"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#2d1a0e] flex items-center gap-2">
          <AlertCircle className="text-red-500" size={24} />
          {t("admin.reports.title")} ({reports.length})
        </h2>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t("admin.reports.table.target")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t("admin.reports.table.reporter")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t("admin.reports.table.reason")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">
                  {t("admin.reports.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-stone-400"
                  >
                    {t("common.loading")}
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-stone-400"
                  >
                    {t("admin.reports.no_reports")}
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-stone-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-[#2d1a0e]">
                        {report.book?.title}
                      </div>
                      <div className="text-xs text-stone-500">
                        {report.book?.author}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-stone-700">
                        {report.reporter?.full_name}
                      </div>
                      <div className="text-xs text-stone-400">
                        {report.reporter?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block max-w-[200px] truncate text-sm text-stone-600">
                        {report.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="p-2 text-stone-400 hover:text-[#8B5E3C] hover:bg-[#8B5E3C]/5 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Details */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-[#2d1a0e]">
                {t("admin.reports.details_title")}
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 hover:bg-stone-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="w-16 h-20 bg-stone-200 rounded-lg overflow-hidden shrink-0">
                  {selectedReport.book?.cover_url && (
                    <img
                      src={selectedReport.book.cover_url}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase mb-1">
                    <BookIcon size={14} /> {t("admin.reports.reported_book")}
                  </div>
                  <h4 className="font-bold text-stone-900">
                    {selectedReport.book?.title}
                  </h4>
                  <p className="text-sm text-stone-500">
                    {selectedReport.book?.author}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="text-stone-400 mt-1" size={18} />
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase">
                      {t("admin.reports.reporter")}
                    </p>
                    <p className="text-sm font-medium">
                      {selectedReport.reporter?.full_name} (
                      {selectedReport.reporter?.email})
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="text-stone-400 mt-1" size={18} />
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase">
                      {t("admin.reports.date")}
                    </p>
                    <p className="text-sm font-medium">
                      {format(new Date(selectedReport.created_at), "PPP")}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-xs font-bold text-red-400 uppercase mb-1">
                    {t("admin.reports.reason")}
                  </p>
                  <p className="text-sm text-red-900 leading-relaxed">
                    {selectedReport.reason}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex gap-3">
              <button
                onClick={() =>
                  handleUpdateStatus(selectedReport.id, "REJECTED")
                }
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 font-bold hover:bg-stone-100 transition-colors"
              >
                <XCircle size={18} /> {t("admin.reports.action_reject")}
              </button>
              <button
                onClick={() =>
                  handleUpdateStatus(selectedReport.id, "RESOLVED")
                }
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-md shadow-green-200 transition-colors"
              >
                <CheckCircle2 size={18} /> {t("admin.reports.action_resolve")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
