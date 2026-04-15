import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "zustand";
import authStore from "../../../context/auth";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Book, bookService } from "../../../api/books.api";

import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader,
  Plus,
  Edit,
} from "lucide-react";
import BookCard from "../../../components/BookCard/BookCard";

const BOOKS_PER_PAGE = 8;

export const MyBooks = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useStore(authStore, (state) => state.user);

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMyBooks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error, count } = await bookService.getMyBooks(
        user.id,
        page,
      );

      if (error) throw error;

      setBooks(data || []);
      setTotal(count || 0);
    } catch (err: any) {
      toast.error(t("profile.books.fetch_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBooks();
  }, [page, user]);

  const handleDelete = async () => {
    if (!bookToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await bookService.deleteBook(bookToDelete.id);
      if (error) throw error;

      toast.success(t("profile.books.delete_success"));
      setIsDeleteModalOpen(false);

      if (books.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        fetchMyBooks();
      }
    } catch (err) {
      toast.error(t("profile.books.delete_error"));
    } finally {
      setIsDeleting(false);
      setBookToDelete(null);
    }
  };

  const totalPages = Math.ceil(total / BOOKS_PER_PAGE);

  return (
    <div className="bg-[#fdf8f3] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#2d1a0e]">
              {t("profile.my_books")}
            </h1>
            <p className="text-[#a07850] text-sm mt-1">
              {t("catalog.book_count", { count: total })}
            </p>
          </div>
          <button
            onClick={() => navigate("/new-book")}
            className="flex items-center gap-2 bg-linear-to-br from-[#7a4020] to-[#a0602a] text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg hover:opacity-90 transition-all active:scale-95"
          >
            <Plus size={18} /> {t("profile.add_new")}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin text-[#8b5e3c]" size={40} />
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
            {books.map((book) => (
              <div key={book.id} className="relative group">
                <BookCard book={book} />
                <div className="absolute top-2 left-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => navigate(`/edit-book/${book.id}`)}
                    className="z-15 p-2 bg-white/90 backdrop-blur-sm text-blue-600 rounded-lg shadow-md hover:bg-blue-50 transition-colors"
                    title={t("common.edit")}
                  >
                    <Edit size={18} className="rotate-45" />
                  </button>
                  <button
                    onClick={() => {
                      setBookToDelete({ id: book.id, title: book.title });
                      setIsDeleteModalOpen(true);
                    }}
                    className="z-15 p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-lg shadow-md hover:bg-red-50 transition-colors"
                    title={t("common.delete")}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[24px] border border-[#b48c5a]/10 p-16 text-center">
            <p className="text-[#a07850] text-lg mb-6">
              {t("profile.no_books")}
            </p>
            <button
              onClick={() => navigate("/new-book")}
              className="text-[#8b5e3c] font-bold border-b-2 border-[#8b5e3c] pb-1 hover:text-[#7a4020] transition-colors"
            >
              {t("profile.add_first_book")}
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#b48c5a]/20 bg-white text-[#8b5e3c] disabled:opacity-40 hover:bg-[#8b5e3c]/5 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="mx-4 text-sm font-medium text-[#2d1a0e]">
              {page + 1} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#b48c5a]/20 bg-white text-[#8b5e3c] disabled:opacity-40 hover:bg-[#8b5e3c]/5 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-8 shadow-2xl border border-[#b48c5a]/10">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#2d1a0e] mb-2">
                {t("profile.delete_confirm_title")}
              </h3>
              <p className="text-sm text-[#a07850] leading-relaxed mb-8">
                {t("profile.delete_confirm_desc")} <br />
                <span className="font-bold text-[#2d1a0e]">
                  "{bookToDelete?.title}"
                </span>
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl bg-[#fdf8f3] text-sm font-semibold text-[#7a5030] hover:bg-[#f5ece4] transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    t("common.delete")
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
