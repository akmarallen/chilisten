import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import {
  Trash2,
  Edit3,
  ExternalLink,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { Book } from "../../api/books.api";

const PAGE_SIZE = 10;

const AllBooksTab = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(0);
      loadBooks(0);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, filterStatus]);

  const loadBooks = async (page: number) => {
    try {
      setLoading(true);

      let query = supabase
        .from("books")
        .select(`*, seller:seller_id(full_name, email)`, { count: "exact" });

      if (searchQuery.trim()) {
        query = query.textSearch("search_vector", searchQuery.trim(), {
          config: "russian",
          type: "plain",
        });
      }

      if (filterStatus !== "ALL") {
        query = query.eq("status", filterStatus as Book["status"]);
      }

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setAllBooks(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      toast.error(t("admin.books.load_error"));
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    loadBooks(newPage);
  };

  const handleStatusUpdate = async (
    bookId: string,
    newStatus: Book["status"],
  ) => {
    try {
      const { error } = await supabase
        .from("books")
        .update({ status: newStatus })
        .eq("id", bookId);

      if (error) throw error;
      setAllBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, status: newStatus } : b)),
      );
      toast.success(t("admin.books.status_updated"));
    } catch (err) {
      toast.error(t("admin.books.update_error"));
    }
  };

  const handleDelete = async (bookId: string) => {
    if (!window.confirm(t("admin.books.confirm_delete"))) return;
    try {
      const { error } = await supabase.from("books").delete().eq("id", bookId);
      if (error) throw error;
      loadBooks(currentPage);
      toast.success(t("admin.books.delete_success"));
    } catch (err) {
      toast.error(t("admin.books.delete_error"));
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-[#2d1a0e]">
          {t("admin.books.title")}{" "}
          <span className="text-stone-400 font-normal">({totalCount})</span>
        </h2>

        <div className="flex flex-1 max-w-2xl gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              size={18}
            />
            <input
              type="text"
              placeholder={t("admin.books.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#8B5E3C] text-sm"
            />
          </div>

          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              size={16}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none appearance-none text-sm font-medium text-stone-700"
            >
              <option value="ALL">{t("admin.books.status.all")}</option>
              <option value="ACTIVE">{t("admin.books.status.ACTIVE")}</option>
              <option value="PENDING">{t("admin.books.status.PENDING")}</option>
              <option value="SOLD">{t("admin.books.status.SOLD")}</option>
              <option value="ARCHIVED">
                {t("admin.books.status.ARCHIVED")}
              </option>
              <option value="REJECTED">
                {t("admin.books.status.REJECTED")}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t("admin.books.table.book")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t("admin.books.table.seller")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t("admin.books.table.status")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">
                  {t("admin.books.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-20 text-center text-stone-400"
                  >
                    {t("common.loading")}
                  </td>
                </tr>
              ) : allBooks.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-20 text-center text-stone-400"
                  >
                    {t("not_found")}
                  </td>
                </tr>
              ) : (
                allBooks.map((book) => (
                  <tr
                    key={book.id}
                    className="hover:bg-stone-50/50 transition-colors group"
                  >
                    <td
                      className="w-[200px] px-6 py-4 cursor-pointer"
                      onClick={() => navigate(`/book/${book.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-stone-100 rounded overflow-hidden shrink-0">
                          {book.cover_url && (
                            <img
                              src={book.cover_url}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[#2d1a0e] text-sm group-hover/book:text-[#8B5E3C] truncate flex items-center gap-1">
                            {book.title}
                            <ExternalLink
                              size={12}
                              className="opacity-0 group-hover:opacity-100"
                            />
                          </div>
                          <div className="text-xs text-stone-500 truncate">
                            {book.author}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      className="px-6 py-4 cursor-pointer group/seller"
                      onClick={() => navigate(`/seller/${book.seller_id}`)}
                    >
                      <div className="text-sm font-medium text-stone-700 group-hover/seller:text-[#8B5E3C] transition-colors flex items-center gap-1">
                        {/* @ts-ignore */}
                        {book.seller?.full_name}
                        <ExternalLink
                          size={12}
                          className="opacity-0 group-hover/seller:opacity-100 transition-opacity"
                        />
                      </div>
                      <div className="text-xs text-stone-400">
                        {/* @ts-ignore */}
                        {book.seller?.email}
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4">
                      <select
                        value={book.status}
                        onChange={(e) =>
                          handleStatusUpdate(
                            book.id,
                            e.target.value as Book["status"],
                          )
                        }
                        className={`text-sm font-bold px-2 py-1 rounded-lg border-none focus:ring-2 focus:ring-[#8B5E3C]/20 cursor-pointer 
          ${
            book.status === "ACTIVE"
              ? "bg-green-50 text-green-700"
              : book.status === "PENDING"
                ? "bg-orange-50 text-orange-700"
                : "bg-stone-100 text-stone-600"
          }`}
                      >
                        <option value="ACTIVE">
                          {t("admin.books.status.ACTIVE")}
                        </option>
                        <option value="PENDING">
                          {t("admin.books.status.PENDING")}
                        </option>
                        <option value="SOLD">
                          {t("admin.books.status.SOLD")}
                        </option>
                        <option value="REJECTED">
                          {t("admin.books.status.REJECTED")}
                        </option>
                        <option value="ARCHIVED">
                          {t("admin.books.status.ARCHIVED")}
                        </option>
                      </select>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/edit-book/${book.id}`)}
                          className="p-2 text-stone-400 hover:text-[#8B5E3C] hover:bg-[#8B5E3C]/5 rounded-lg transition-colors"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
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
            <p className="text-xs text-stone-500">
              {t("catalog.page_x_of_y", {
                currentPage: currentPage + 1,
                totalPages,
              })}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 0 || loading}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-stone-700 px-2">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages - 1 || loading}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBooksTab;
