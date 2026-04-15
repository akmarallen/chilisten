// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import BookCard from "../BookCard/BookCard";
import { useStore } from "zustand";
import authStore from "../../context/auth";
import { Book, bookService } from "../../api/books.api";
import { toast } from "react-toastify";
import { getGenres } from "../../utils/const/const";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("");
  const [, setParams] = useSearchParams();
  const { user } = useStore(authStore);
  const { t } = useTranslation();

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await bookService.getBooks(
        { genre: activeCategory, userId: user?.id },
        0,
      );
      if (fetchError) throw fetchError;

      const formattedBooks = data?.map((book) => ({
        ...book,
        isLiked: !!(user?.id && book.liked && book.liked.length > 0),
      }));
      setBooks(formattedBooks || []);
    } catch (e) {
      setError(t("home.fetch_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [activeCategory, user?.id]);

  const likeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggleLike = async (bookId: string) => {
    if (!user) return setParams({ login: "true" });

    const bookBeforeClick = books.find((b) => b.id === bookId);
    const wasLikedAlready = !!bookBeforeClick?.isLiked;

    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, isLiked: !b.isLiked } : b)),
    );

    if (likeTimeout.current) clearTimeout(likeTimeout.current);

    likeTimeout.current = setTimeout(async () => {
      try {
        const finalState = await bookService.toggleBookLike(bookId);
        setBooks((prev) =>
          prev.map((b) =>
            b.id === bookId ? { ...b, isLiked: !!finalState } : b,
          ),
        );
      } catch (e) {
        setBooks((prev) =>
          prev.map((b) =>
            b.id === bookId ? { ...b, isLiked: wasLikedAlready } : b,
          ),
        );
        toast.error(t("common.error"));
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-['DM_Sans',sans-serif]">
      {/* --- HERO SECTION --- */}
      <section className="bg-white border-b border-[#f0f0f0] px-6 py-14 text-center">
        <div className="max-w-[600px] mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4 text-[0.7rem] font-medium tracking-[0.14em] uppercase text-[#8B5E3C] before:content-[''] before:w-6 before:h-[1.5px] before:bg-[#8B5E3C] after:content-[''] after:w-6 after:h-[1.5px] after:bg-[#8B5E3C]">
            {t("home.hero_tagline")}
          </div>
          <h1 className="font-['Playfair_Display',serif] text-4xl md:text-5xl font-bold text-[#1a0a00] leading-[1.15] mb-4 tracking-tight">
            {t("home.hero_title_part1")}{" "}
            <em className="italic text-[#8B5E3C] font-medium">
              {t("home.hero_title_italic")}
            </em>{" "}
            {t("home.hero_title_part2")}
          </h1>
          <p className="text-base text-[#7a5030] font-light leading-relaxed mb-8">
            {t("home.hero_description")}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <Link
              to="/catalog"
              className="px-7 py-3 rounded-xl bg-linear-to-br from-[#1a0a00] to-[#3d1a00] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t("home.cta_buy")}
            </Link>
            <Link
              to="/new-book"
              className="px-7 py-3 rounded-xl border-[1.5px] border-[#d1d5db] bg-white text-[#374151] text-sm hover:border-[#9ca3af] transition-colors"
            >
              {t("home.cta_sell")}
            </Link>
          </div>

          <div className="flex justify-center gap-12 pt-6 border-t border-[#f3f4f6]">
            <Stat num="8 000+" label={t("home.stats.books")} />
            <Stat num="2 500+" label={t("home.stats.sellers")} />
            <Stat num="⭐ 4.8" label={t("home.stats.rating")} />
          </div>
        </div>
      </section>

      {/* --- CATEGORIES --- */}
      <nav className="bg-white border-b border-[#f0f0f0] px-6 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex max-w-[935px] justify-center mx-auto">
          {getGenres(t).map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`flex items-center gap-2 px-5 py-4 text-[0.82rem] font-medium whitespace-nowrap border-b-2 transition-all ${
                activeCategory === cat.value
                  ? "text-[#1a0a00] border-[#1a0a00]"
                  : "text-[#6b7280] border-transparent hover:text-[#1a0a00]"
              }`}
            >
              <span className="text-base">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-[935px] mx-auto px-6 py-6 pb-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg text-[#1a0a00]">
            {t(`genres.${activeCategory || "all"}`)}
          </h2>
          <Link
            to={`/catalog`}
            className="text-[0.82rem] text-[#8B5E3C] font-medium hover:opacity-70 transition-opacity"
          >
            {t("home.cta_all")} →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="col-span-full py-16 flex flex-col items-center gap-4 border border-dashed border-gray-200 rounded-2xl bg-white">
            <span className="text-4xl grayscale">🔌</span>
            <p className="text-sm font-medium text-gray-600">{error}</p>
            <button
              onClick={fetchBooks}
              className="px-4 py-2 bg-[#1a0a00] text-white text-xs rounded-lg active:scale-95 transition-transform"
            >
              {t("home.retry")}
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-3 text-gray-400">
            <span className="text-4xl">📚</span>
            <p>{t("home.no_books")}</p>
            {activeCategory && (
              <button
                onClick={() => setActiveCategory("")}
                className="px-4 py-1.5 border border-gray-300 rounded-lg text-xs hover:bg-white"
              >
                {t("home.show_all")}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isLiked={book.isLiked as boolean}
                onLikeToggle={handleToggleLike}
              />
            ))}
          </div>
        )}

        {/* --- SELL CTA BANNER --- */}
        <section className="mt-8 p-12 rounded-2xl bg-linear-to-br from-[#1a0a00] to-[#3d1a00] text-white text-center">
          <h3 className="text-2xl mb-3">{t("home.sell_banner_title")}</h3>
          <p className="text-sm opacity-70 font-light mb-6">
            {t("home.sell_banner_desc")}
          </p>
          <Link
            to="/new-book"
            className="px-8 py-3 bg-white text-[#1a0a00] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t("home.cta_sell")} →
          </Link>
        </section>
      </main>
    </div>
  );
};

const Stat = ({ num, label }: { num: string; label: string }) => (
  <div>
    <div className="font-bold text-xl text-[#1a0a00]">{num}</div>
    <div className="text-[0.68rem] text-[#9ca3af] uppercase tracking-wider">
      {label}
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white border border-[#f3f4f6] rounded-xl overflow-hidden animate-pulse">
    <div className="aspect-2/3 bg-gray-100" />
    <div className="p-3 space-y-2">
      <div className="h-2.5 w-4/5 bg-gray-100 rounded-full" />
      <div className="h-2.5 w-3/5 bg-gray-100 rounded-full" />
    </div>
  </div>
);

export default HeroSection;
