import { useState, useEffect, FC, useRef } from "react";
import { Search, SlidersHorizontal, X, BookOpen } from "lucide-react";
import {
  getGenres,
  CITIES,
  PAGE_SIZE,
  getSortOptions,
  getConditions,
} from "../../utils/const/const";
import { Database } from "../../api/database.types";
import { Book, bookService } from "../../api/books.api";
import authStore from "../../context/auth";
import { useSearchParams } from "react-router-dom";
import { useStore } from "zustand";
import { useTranslation } from "react-i18next";
import BookCard from "../BookCard/BookCard";

export type BookSearchFilters = Partial<{
  search: string;
  genre: string;
  city: string;
  condition: Database["public"]["Enums"]["book_condition"] | "";
  minPrice: string;
  maxPrice: string;
  sort: string;
  userId?: string;
}>;

type Props = {
  search?: string;
};

const CatalogSection = ({ search }: Props) => {
  const { user } = useStore(authStore);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [, setParams] = useSearchParams();
  const [filters, setFilters] = useState<BookSearchFilters>({
    search: search || "",
    genre: "",
    city: "",
    condition: "",
    minPrice: "",
    maxPrice: "",
    sort: "date_desc",
    userId: user?.id,
  });
  const { t } = useTranslation();

  useEffect(() => {
    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const { data, error, count } = await bookService.getBooks(
          { ...filters, search: filters.search },
          page,
        );

        if (error) throw error;

        const formattedBooks = data?.map((book) => ({
          ...book,
          isLiked: !!(user?.id && book.liked && book.liked.length > 0),
        }));

        setBooks(formattedBooks || []);
        setTotal(count || 0);
      } catch (e: any) {
        if (e.name === "AbortError") return;

        console.error("Fetch error:", e);
        setBooks([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filters, page, search]);

  useEffect(() => {
    setPage(0);
  }, [filters]);

  const likeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggleLike = async (bookId: string) => {
    if (!user) return setParams({ login: "true" });
    setBooks((prev) =>
      // @ts-ignore
      prev.map((b) => (b.id === bookId ? { ...b, isLiked: !b.isLiked } : b)),
    );

    if (likeTimeout.current) clearTimeout(likeTimeout.current);
    likeTimeout.current = setTimeout(async () => {
      try {
        const finalLikeState = await bookService.toggleBookLike(bookId);
        setBooks((prev) =>
          prev.map((b) =>
            b.id === bookId ? { ...b, isLiked: finalLikeState as boolean } : b,
          ),
        );
      } catch (e) {
        setBooks((prev) =>
          prev.map((b) =>
            // @ts-ignore
            b.id === bookId ? { ...b, isLiked: !b.isLiked } : b,
          ),
        );
      }
    }, 300);
  };

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSearch = filters?.search?.trim() || "";
    setFilters((prev) => ({ ...prev, search: cleanSearch }));
  };

  const resetFilters = () => {
    const defaultFilters: BookSearchFilters = {
      search: "",
      genre: "",
      city: "",
      condition: "",
      minPrice: "",
      maxPrice: "",
      sort: "date_desc",
    };
    setFilters(defaultFilters);
    setPage(0);
  };

  const hasActiveFilters = !!(
    filters.genre ||
    filters.city ||
    filters.condition ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.search
  );
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="bg-[#fdf8f3] min-h-[60vh] font-sans">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed left-0 top-0 bottom-0 w-[280px] bg-[#fdf8f3] z-50 p-6 overflow-y-auto shadow-2xl transition-transform duration-300 md:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          className="absolute top-4 right-4 text-[#7a5030]"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={20} />
        </button>
        <SidebarContent
          filters={filters}
          setFilters={setFilters}
          onReset={resetFilters}
          hasActive={hasActiveFilters}
        />
      </div>

      <section className="max-w-[1280px] mx-auto px-6 py-10 md:pb-16">
        <div className="flex flex-wrap items-center gap-3 mb-7">
          <form
            className="flex-1 min-w-[200px] relative"
            onSubmit={applySearch}
          >
            <input
              className="w-full py-2.5 pl-4 pr-10 border-[1.5px] border-[#b48c5a]/25 rounded-[10px] bg-white text-sm text-[#2d1a0e] outline-none transition-all focus:border-[#8B5E3C] focus:ring-4 focus:ring-[#8b5e3c]/10 placeholder-[#c4a882]"
              type="text"
              placeholder={t("catalog.search_placeholder")}
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c4956a] hover:text-[#8B5E3C]"
            >
              <Search size={16} />
            </button>
          </form>

          <select
            className="py-2.5 px-3.5 border-[1.5px] border-[#b48c5a]/25 rounded-[10px] bg-white text-[0.83rem] text-[#5a3520] cursor-pointer outline-none min-w-[160px]"
            value={filters.sort}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, sort: e.target.value }))
            }
          >
            {getSortOptions(t).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <button
            className={`md:hidden flex items-center gap-1.5 py-2.5 px-3.5 rounded-[10px] border-[1.5px] bg-white text-[0.83rem] text-[#5a3520] transition-colors whitespace-nowrap ${sidebarOpen || hasActiveFilters ? "border-[#8B5E3C] bg-[#8b5e3c]/10" : "border-[#b48c5a]/25 hover:bg-[#8b5e3c]/5"}`}
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <SlidersHorizontal size={15} />
            {t("catalog.filters")}
            {hasActiveFilters && (
              <span className="w-4.5 h-4.5 bg-[#8B5E3C] text-white rounded-full text-[0.65rem] flex items-center justify-center min-w-[18px]">
                {
                  [
                    filters.genre,
                    filters.city,
                    filters.condition,
                    filters.minPrice,
                    filters.maxPrice,
                    filters.search,
                  ].filter(Boolean).length
                }
              </span>
            )}
          </button>
        </div>

        <div className="flex items-start gap-6">
          <aside className="hidden md:block w-[240px] shrink-0 bg-white rounded-[14px] border border-[#b48c5a]/20 p-5 sticky top-20">
            <SidebarContent
              filters={filters}
              setFilters={setFilters}
              onReset={resetFilters}
              hasActive={hasActiveFilters}
            />
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <div>
                <div className="text-[0.7rem] text-[#a07850] uppercase tracking-widest font-medium">
                  {t("catalog.title")}
                </div>
                <div className="font-['Playfair_Display'] text-3xl font-semibold text-[#2d1a0e] mt-0.5">
                  {loading
                    ? t("catalog.loading")
                    : total > 0
                      ? t("catalog.book_count", { count: total })
                      : t("catalog.no_books")}
                </div>
              </div>
              {!loading && total > 0 && (
                <div className="text-[0.8rem] text-[#a07850]">
                  {t("catalog.page_x_of_y", {
                    current: page + 1,
                    total: totalPages,
                  })}
                </div>
              )}
            </div>

            {!loading && books.length === 0 && (
              <div className="text-center py-20 px-8 flex flex-col items-center gap-4">
                <div className="w-[72px] h-[72px] rounded-full bg-[#8b5e3c]/10 flex items-center justify-center">
                  <BookOpen size={32} className="text-[#8B5E3C]" />
                </div>
                <div className="font-['Playfair_Display'] text-xl text-[#2d1a0e]">
                  {hasActiveFilters
                    ? t("catalog.no_results")
                    : t("catalog.no_books")}
                </div>
                <p className="text-sm text-[#a07850] max-w-[280px] leading-relaxed">
                  {hasActiveFilters
                    ? t("catalog.try_another_filters")
                    : t("catalog.become_first_seller")}
                </p>
                {hasActiveFilters && (
                  <button
                    className="mt-2 py-2 px-5 rounded-lg border-[1.5px] border-[#8B5E3C] text-[#7a4020] text-[0.85rem] hover:bg-[#8b5e3c]/10"
                    onClick={resetFilters}
                  >
                    {t("catalog.reset")}
                  </button>
                )}
              </div>
            )}

            {!loading && books.length > 0 && (
              <>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
                  {books.map((book) => (
                    <BookCard
                      // @ts-ignore
                      isLiked={book.isLiked as boolean}
                      key={book.id}
                      book={book}
                      onLikeToggle={handleToggleLike}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
                    <button
                      className="w-9 h-9 border-[1.5px] border-[#b48c5a]/20 rounded-lg bg-white text-[#5a3520] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:border-[#8B5E3C] hover:not-disabled:bg-[#8b5e3c]/5 transition-all"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 0}
                    >
                      ←
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => {
                      if (
                        i === 0 ||
                        i === totalPages - 1 ||
                        Math.abs(i - page) <= 1
                      ) {
                        return (
                          <button
                            key={i}
                            className={`w-9 h-9 rounded-lg text-sm transition-all border ${page === i ? "bg-linear-to-br from-[#7a4020] to-[#a0602a] text-white border-transparent shadow-md" : "bg-white border-[#b48c5a]/20 text-[#5a3520] hover:border-[#8B5E3C]"}`}
                            onClick={() => setPage(i)}
                          >
                            {i + 1}
                          </button>
                        );
                      }

                      if (Math.abs(i - page) === 2)
                        return (
                          <span key={i} className="text-[#c4a882] text-sm px-1">
                            …
                          </span>
                        );

                      return null;
                    })}

                    <button
                      className="w-9 h-9 border-[1.5px] border-[#b48c5a]/20 rounded-lg bg-white text-[#5a3520] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:border-[#8B5E3C] hover:not-disabled:bg-[#8b5e3c]/5 transition-all"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= totalPages - 1}
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

type SidebarContentProps = {
  filters: BookSearchFilters;
  setFilters: (filters: BookSearchFilters) => void;
  onReset: () => void;
  hasActive: boolean;
};
const SidebarContent: FC<SidebarContentProps> = ({
  filters,
  setFilters,
  onReset,
  hasActive,
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-4 font-['Playfair_Display'] text-base font-medium text-[#2d1a0e]">
        {t("catalog.filters")}
        {hasActive && (
          <button
            className="text-[0.72rem] text-[#8B5E3C] hover:underline"
            onClick={onReset}
          >
            {t("catalog.reset")}
          </button>
        )}
      </div>

      <div>
        <label className="text-[0.72rem] font-medium text-[#7a4f2e] uppercase tracking-wider mb-1.5 block">
          {t("catalog.genre")}
        </label>
        <select
          className="w-full p-2.5 border-[1.5px] border-[#b48c5a]/20 rounded-lg bg-[#fdf8f3] text-[0.83rem] text-[#2d1a0e] outline-none"
          value={filters.genre}
          onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
        >
          {getGenres(t).map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[0.72rem] font-medium text-[#7a4f2e] uppercase tracking-wider mb-1.5 block">
          {t("catalog.condition")}
        </label>
        <select
          className="w-full p-2.5 border-[1.5px] border-[#b48c5a]/20 rounded-lg bg-[#fdf8f3] text-[0.83rem] text-[#2d1a0e] outline-none"
          value={filters.condition}
          onChange={(e) =>
            setFilters({ ...filters, condition: e.target.value as any })
          }
        >
          {[
            { label: t("catalog.any_conditions"), value: "" },
            ...getConditions(t),
          ].map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[0.72rem] font-medium text-[#7a4f2e] uppercase tracking-wider mb-1.5 block">
          {t("catalog.city")}
        </label>
        <select
          className="w-full p-2.5 border-[1.5px] border-[#b48c5a]/20 rounded-lg bg-[#fdf8f3] text-[0.83rem] text-[#2d1a0e] outline-none"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        >
          <option value="">{t("catalog.all_cities")}</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[0.72rem] font-medium text-[#7a4f2e] uppercase tracking-wider mb-1.5 block">
          {t("catalog.price_som")}
        </label>
        <div className="flex gap-2">
          <input
            className="w-1/2 p-2.5 border-[1.5px] border-[#b48c5a]/20 rounded-lg bg-[#fdf8f3] text-[0.83rem] outline-none"
            type="number"
            placeholder={t("catalog.price_from")}
            value={filters.minPrice}
            onChange={(e) =>
              setFilters({ ...filters, minPrice: e.target.value })
            }
          />
          <input
            className="w-1/2 p-2.5 border-[1.5px] border-[#b48c5a]/20 rounded-lg bg-[#fdf8f3] text-[0.83rem] outline-none"
            type="number"
            placeholder={t("catalog.price_to")}
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters({ ...filters, maxPrice: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default CatalogSection;
