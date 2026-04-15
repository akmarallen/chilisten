import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "zustand";
import authStore from "../../../context/auth";
import { bookService, Book } from "../../../api/books.api";
import BookCard from "../../../components/BookCard/BookCard";
import { PAGE_SIZE } from "../../../utils/const/const";
import { useTranslation } from "react-i18next"; // Added

const FavoritesPage = () => {
  const { t } = useTranslation();
  const { user } = useStore(authStore);
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const { data, count } = await bookService.getFavoriteBooks(
          user?.id!,
          page,
        );
        const formatted = data?.map((b) => ({ ...b, isLiked: true })) || [];
        setBooks(formatted as Book[]);
        setTotal(count || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, page, navigate]);

  const handleToggleLike = async (bookId: string) => {
    setBooks((prev) =>
      // @ts-ignore
      prev.map((b) => (b.id === bookId ? { ...b, isLiked: !b.isLiked } : b)),
    );

    try {
      const finalLikeState = await bookService.toggleBookLike(bookId);

      setBooks((prev) =>
        prev.map((b) =>
          b.id === bookId ? { ...b, isLiked: finalLikeState as boolean } : b,
        ),
      );

      setTotal((prev) => (finalLikeState ? prev + 1 : prev - 1));
    } catch (e) {
      setBooks((prev) =>
        // @ts-ignore
        prev.map((b) => (b.id === bookId ? { ...b, isLiked: !b.isLiked } : b)),
      );
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="bg-[#fdf8f3] min-h-screen font-sans pb-20">
      <section className="max-w-[1280px] mx-auto px-6 py-10">
        <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#2d1a0e] mb-1">
          {t("favorites.title")}
        </h1>

        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[14px] overflow-hidden border border-[#b48c5a]/15 animate-pulse"
              >
                <div className="h-[200px] bg-[#f0e8dc]" />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-3/4 bg-[#f0e8dc] rounded-full" />
                  <div className="h-3 w-1/2 bg-[#f0e8dc] rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : books.length > 0 ? (
          <>
            <div className="mb-6 text-[#a07850] text-sm italic">
              {t("favorites.wishlist_text", {
                count: total,
                books: t("catalog.book_count", { count: total }).split(" ")[1],
              })}
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  // @ts-ignore
                  isLiked={book.isLiked}
                  onLikeToggle={handleToggleLike}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-10 h-10 rounded-lg border ${
                      page === i
                        ? "bg-[#7a4020] text-white border-transparent"
                        : "bg-white border-[#b48c5a]/20 text-[#5a3520]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 flex flex-col items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-[#8b5e3c]/5 flex items-center justify-center">
              <Heart size={36} className="text-[#c4a882] stroke-[1.5px]" />
            </div>
            <div className="font-['Playfair_Display'] text-2xl text-[#2d1a0e]">
              {t("favorites.empty_title")}
            </div>
            <p className="text-[#a07850] max-w-sm leading-relaxed">
              {t("favorites.empty_desc")}
            </p>
            <Link
              to="/"
              className="mt-4 px-8 py-3 bg-[#7a4020] text-white rounded-xl hover:bg-[#5a2e16] transition-all shadow-lg shadow-[#7a4020]/20"
            >
              {t("favorites.go_to_catalog")}
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default FavoritesPage;
