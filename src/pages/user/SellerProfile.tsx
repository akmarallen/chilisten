import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  ArrowLeft,
  MapPin,
  Star,
  BookOpen,
  User,
  Calendar,
  AlertOctagon,
} from "lucide-react";
import BookCard from "../../components/BookCard/BookCard";
import authStore from "../../context/auth";
import { useStore } from "zustand";
import { userService } from "../../api/users.api";
import { Book } from "../../api/books.api";
import { useTranslation } from "react-i18next";
import ReportModal from "../../components/ReportModal/ReportModal";
import { toast } from "react-toastify";

const SellerProfilePage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useStore(authStore);
  const [, setParams] = useSearchParams();
  const [seller, setSeller] = useState<
    Awaited<ReturnType<typeof userService.getSellerProfile>>["data"] | null
  >(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [likedCards, setLikedCards] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const handleReportClick = () => {
    if (!user) {
      navigate("/login=true");
      return;
    }
    if (user.id === id) {
      toast.warning(t("seller.report.self_report_error"));
      return;
    }
    setIsReportModalOpen(true);
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError("");

      try {
        const { data: sellerData, error: sellerError } =
          await userService.getSellerProfile(id!, user?.id);

        if (sellerError) throw sellerError;

        setSeller(sellerData);

        if (sellerData.books) {
          const formattedBooks = sellerData.books.map((b) => ({
            ...b,
            isLiked: b.liked && b.liked.length > 0,
          }));

          setBooks(formattedBooks);
          setLikedCards(
            new Set(formattedBooks.filter((b) => b.isLiked).map((b) => b.id)),
          );
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(t("seller.errors.load_fail"));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, user?.id, t]);

  const handleLikeToggle = async (bookId: string) => {
    if (!user) {
      navigate("/login=true");
      return;
    }

    const isLiked = likedCards.has(bookId);

    try {
      if (isLiked) {
        const { error: deleteError } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("book_id", bookId);

        if (deleteError) throw deleteError;

        setLikedCards((prev) => {
          const next = new Set(prev);
          next.delete(bookId);
          return next;
        });
      } else {
        const { error: insertError } = await supabase
          .from("favorites")
          .insert([{ user_id: user.id, book_id: bookId }]);

        if (insertError?.code === "23505") {
          setLikedCards((prev) => new Set(prev).add(bookId));
          return;
        }

        if (insertError) throw insertError;

        setLikedCards((prev) => new Set(prev).add(bookId));
      }
    } catch (err) {
      console.error("Like toggle error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#fdf8f3] text-[#a07850] font-sans">
        {t("common.loading")}
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#fdf8f3] font-sans gap-4">
        <User size={48} className="text-[#c4956a]" />
        <div className=" text-xl text-[#2d1a0e]">
          {error || t("seller.errors.not_found")}
        </div>
        <button
          onClick={() => navigate("/catalog")}
          className="px-5 py-2 rounded-lg border-1.5 border-[#8B5E3C] text-[#7a4020] hover:bg-[#8B5E3C]/5 transition-colors text-sm"
        >
          {t("seller.back_to_catalog")}
        </button>
      </div>
    );
  }

  const joinedYear = seller.created_at
    ? new Date(seller.created_at).getFullYear()
    : null;

  return (
    <div className="bg-[#fdf8f3] min-h-screen font-sans">
      <div className="max-w-[1100px] mx-auto px-6 py-6 pb-16">
        <div className="flex justify-between items-center mb-6">
          <button
            className="inline-flex items-center gap-1.5 text-xs text-[#8B5E3C] hover:opacity-70 transition-opacity"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} /> {t("common.back")}
          </button>

          {user?.id !== id && (
            <button
              onClick={handleReportClick}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              <AlertOctagon size={14} />
              {t("seller.report.button")}
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#b48c5a]/15 p-8 mb-10 flex flex-wrap items-center gap-6 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-[#8B5E3C] to-[#C8874E] flex items-center justify-center text-3xl font-semibold text-white shrink-0 overflow-hidden shadow-[0_6px_20px_rgba(139,94,60,0.3)]">
            {seller.avatar_url ? (
              <img
                src={seller.avatar_url}
                alt={seller.full_name || "avatar"}
                className="w-full h-full object-cover"
              />
            ) : (
              seller.full_name?.charAt(0)?.toUpperCase() || "?"
            )}
          </div>

          <div className="flex-1 min-w-[200px]">
            <h1 className=" text-2xl font-semibold text-[#2d1a0e] mb-1.5">
              {seller.full_name || t("seller.default_name")}
            </h1>
            <div className="flex flex-wrap gap-3 text-xs text-[#7a5030]">
              {seller.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {seller.city}
                </span>
              )}
              {Number(seller.rating) > 0 && (
                <span className="flex items-center gap-1 text-[#c4956a]">
                  <Star size={13} fill="#c4956a" stroke="#c4956a" />
                  {seller.rating}
                </span>
              )}
              {joinedYear && (
                <span className="flex items-center gap-1">
                  <Calendar size={13} />{" "}
                  {t("seller.joined", { year: joinedYear })}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-6 sm:ml-auto">
            <div className="text-center">
              <div className=" text-2xl font-semibold text-[#2d1a0e]">
                {books.length}
              </div>
              <div className="text-[10px] text-[#a07850] uppercase tracking-wider">
                {t("seller.stats.books")}
              </div>
            </div>
            {Number(seller.total_sales) > 0 && (
              <div className="text-center">
                <div className=" text-2xl font-semibold text-[#2d1a0e]">
                  {seller.total_sales}
                </div>
                <div className="text-[10px] text-[#a07850] uppercase tracking-wider">
                  {t("seller.stats.sales")}
                </div>
              </div>
            )}
            {Number(seller.rating) > 0 && (
              <div className="text-center">
                <div className=" text-2xl font-semibold text-[#2d1a0e]">
                  {seller.rating}
                </div>
                <div className="text-[10px] text-[#a07850] uppercase tracking-wider">
                  {t("seller.stats.rating")}
                </div>
              </div>
            )}
          </div>
        </div>

        <h2 className=" text-xl text-[#2d1a0e] mb-5">
          {t("seller.books_title", { count: books.length })}
        </h2>

        {books.length === 0 ? (
          <div className="text-center py-12 text-[#a07850] text-sm italic">
            <BookOpen size={36} className="mx-auto mb-3 opacity-50" />
            <p>{t("seller.no_books")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isLiked={likedCards.has(book.id)}
                onLikeToggle={handleLikeToggle}
              />
            ))}
          </div>
        )}
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        sellerId={id!}
        reporterId={user?.id || ""}
        sellerName={seller.full_name || ""}
      />
    </div>
  );
};

export default SellerProfilePage;
